'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, Organization } from '@/store/use-auth-store';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    joinCode: z.string().min(6, {
        message: 'Join code must be at least 6 characters.',
    }),
});

export function JoinOrgForm() {
    const router = useRouter();
    const { setOrganizations, setActiveOrg, organizations, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            joinCode: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            alert("You must be logged in to join an organization.");
            return;
        }
        setIsLoading(true);
        const supabase = createClient();

        try {
            // Call the secure RPC function to redeem the code
            const { data, error } = await supabase
                .rpc('redeem_invite_code', { _code: values.joinCode.toUpperCase() });

            if (error) throw error;

            if (!data.success) {
                form.setError('joinCode', { message: data.message });
                setIsLoading(false);
                return;
            }

            // Success: Fetch the organization details to update store
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', data.organization_id)
                .single();

            if (orgError) throw orgError;

            // Update Store and Redirect
            const newOrg: Organization = {
                id: org.id,
                name: org.name,
                slug: org.slug,
                role: 'MEMBER' // Default, though RPC might assign different
            };

            const updatedOrgs = [...organizations, newOrg];
            setOrganizations(updatedOrgs);
            setActiveOrg(org.id);

            router.push('/dashboard');

        } catch (error: any) {
            console.error("Failed to join organization:", error);
            form.setError('joinCode', { message: 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Join Organization</CardTitle>
                <CardDescription>
                    Enter the 6-character access code provided by your admin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="joinCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Access Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="A1B2C3"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Ask your organization admin for this code.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Join Organization
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
