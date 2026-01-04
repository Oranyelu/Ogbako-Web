'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/use-auth-store';

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
    name: z.string().min(2, {
        message: 'Organization name must be at least 2 characters.',
    }),
    slug: z.string().min(2, {
        message: 'Slug must be at least 2 characters.',
    }).regex(/^[a-z0-9-]+$/, {
        message: 'Slug must only contain lowercase letters, numbers, and hyphens.',
    }),
});

export function CreateOrgForm() {
    const router = useRouter();
    const { setOrganizations, setActiveOrg, organizations, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    });

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue('name', name);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        form.setValue('slug', slug);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const supabase = createClient();
        let activeUser = user;

        if (!activeUser) {
            const { data: { user: freshUser } } = await supabase.auth.getUser();
            if (!freshUser) {
                alert("You must be logged in to create an organization.");
                return;
            }
            activeUser = freshUser;
        }

        setIsLoading(true);

        try {
            // Generate a random 6-character alphanumeric join code
            const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            // 1. Create Organization
            // Need to insert created_by as current user
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: values.name,
                    slug: values.slug,
                    created_by: activeUser.id,
                    join_code: joinCode
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // 2. Add creator as OWNER member - NOW HANDLED BY DB TRIGGER
            // But we keep this try/catch block loosely or remove it. 
            // If the trigger runs, this manual insert might fail with "duplicate key" if we keep it.
            // So we SHOULD remove it to rely on the trigger.

            /* (Removed explicit manual insert to avoid race condition with trigger) */

            // We do need to wait a brief moment or rely on the returned data? 
            // Actually, since the trigger runs in the same transaction as the insert, 
            // the member row exists immediately.

            // Update store
            // We need to fetch the fresh org view or construct it
            // Assuming orgData matches Organization interface roughly or we cast it
            const newOrg = {
                id: orgData.id,
                name: orgData.name,
                slug: orgData.slug,
                role: 'OWNER' // We know we just became owner
            };

            // @ts-ignore - Store types might need strict alignment later
            const updatedOrgs = [...organizations, newOrg];
            // @ts-ignore
            setOrganizations(updatedOrgs);
            setActiveOrg(newOrg.id);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Failed to create organization:", error);
            // Check for unique constraint violation on slug
            if (error.code === '23505') {
                form.setError('slug', { message: 'This URL slug is already taken.' });
            } else {
                alert("Failed to create organization: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Organization</CardTitle>
                <CardDescription>
                    Set up your new organization workspace. You will be the admin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Acme Corp"
                                            {...field}
                                            onChange={handleNameChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="acme-corp" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Your organization will be accessible at this URL identifier.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Organization
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
