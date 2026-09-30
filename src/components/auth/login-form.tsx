'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

const formSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters.',
    }),
});

export function LoginForm() {
    const router = useRouter();
    const { setUser, setOrganizations, setActiveOrg } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                console.error("Login failed:", error.message);
                throw error;
            }

            if (data.user) {
                setUser(data.user);

                // Multi-tenancy: Fetch user's organizations and set active context
                try {
                    const { data: memberships } = await supabase
                        .from('organization_members')
                        .select(`
                            role,
                            organization_id,
                            organizations (
                                id,
                                name,
                                slug
                            )
                        `)
                        .eq('user_id', data.user.id);

                    const userOrgs = (memberships || [])
                        .filter((m: any) => m.organizations)
                        .map((m: any) => ({
                            id: m.organizations.id,
                            name: m.organizations.name,
                            slug: m.organizations.slug,
                            role: m.role || 'MEMBER',
                            tier: 'BASIC' as const,
                            transparencyMode: false
                        }));

                    if (userOrgs.length > 0) {
                        setOrganizations(userOrgs);
                        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('x-org-id') : null;
                        const targetOrgId = userOrgs.some((o: any) => o.id === savedOrgId) ? savedOrgId! : userOrgs[0].id;
                        setActiveOrg(targetOrgId);
                        router.push('/dashboard');
                    } else {
                        // User has no organization yet: route to onboarding
                        router.push('/create-org');
                    }
                } catch (orgErr) {
                    console.warn("Could not fetch user organizations:", orgErr);
                    router.push('/dashboard');
                }

                router.refresh();
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            alert(error.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="m@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
                </Form>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <Button variant="outline" type="button" className="w-full" onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${location.origin}/auth/callback`,
                        },
                    })
                }}>
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Sign in with Google
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <div>
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="underline underline-offset-4 hover:text-primary">
                        Sign up
                    </a>
                </div>
            </CardFooter>
        </Card>
    );
}
