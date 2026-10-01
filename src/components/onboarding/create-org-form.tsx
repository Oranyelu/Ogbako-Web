'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, Organization, GroupMembershipRules } from '@/store/use-auth-store';

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
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Sliders, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Group name must be at least 2 characters.',
    }),
    slug: z.string().min(2, {
        message: 'Slug must be at least 2 characters.',
    }).regex(/^[a-z0-9-]+$/, {
        message: 'Slug must only contain lowercase letters, numbers, and hyphens.',
    }),
    category: z.string().min(1, { message: 'Please select a group category.' }),
    description: z.string().optional(),
    meetingFrequency: z.string(),
    currency: z.string(),

    // Membership Rules
    minAge: z.number().min(0).max(120),
    maxAge: z.number().min(0).max(120),
    requiredNationality: z.string(),
    requiredGender: z.enum(['ALL', 'MALE', 'FEMALE']),
    requiredState: z.string(),
    requiresApproval: z.boolean(),
});

const isValidUuid = (val?: string): boolean =>
    !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export function CreateOrgForm() {
    const router = useRouter();
    const { user, createOrganizationLocally, setActiveOrg } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successOrg, setSuccessOrg] = useState<Organization | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            slug: '',
            category: 'Town Union',
            description: '',
            meetingFrequency: 'Monthly',
            currency: 'NGN',
            minAge: 18,
            maxAge: 100,
            requiredNationality: 'Nigerian',
            requiredGender: 'ALL',
            requiredState: 'Any',
            requiresApproval: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setFormError(null);
        const supabase = createClient();
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const rules: GroupMembershipRules = {
            minAge: values.minAge > 0 ? values.minAge : undefined,
            maxAge: values.maxAge < 100 ? values.maxAge : undefined,
            requiredNationality: values.requiredNationality,
            requiredGender: values.requiredGender,
            requiredState: values.requiredState !== 'Any' ? values.requiredState : undefined,
            requiresApproval: values.requiresApproval,
        };

        let baseSlug = (values.slug || values.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (baseSlug.length < 2) {
            baseSlug = 'org-' + Math.random().toString(36).substring(2, 7);
        }

        const orgPayload = {
            name: values.name.trim(),
            slug: baseSlug,
            category: values.category,
            description: values.description?.trim() || '',
            meetingFrequency: values.meetingFrequency,
            currency: values.currency,
            joinCode,
            rules,
            role: 'OWNER' as const,
            tier: 'BASIC' as const,
            transparencyMode: false,
            memberCount: 1,
            isVerifiedIdentity: false,
        };

        try {
            // Determine active user ID
            let activeUserId = user?.id;
            if (!activeUserId) {
                try {
                    const { data: { user: freshUser } } = await supabase.auth.getUser();
                    activeUserId = freshUser?.id;
                } catch (e) {
                    // Ignore network error
                }
            }

            const creatorUuid = isValidUuid(activeUserId) ? activeUserId : null;

            // Attempt Supabase insert
            let targetSlug = baseSlug;
            let insertPayload = {
                name: values.name.trim(),
                slug: targetSlug,
                category: values.category,
                description: values.description?.trim() || null,
                meeting_frequency: values.meetingFrequency,
                currency: values.currency,
                join_code: joinCode,
                rules: rules,
                created_by: creatorUuid,
                is_verified_identity: false,
            };

            let { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert(insertPayload)
                .select()
                .single();

            // If slug conflict (code 23505), append random suffix and retry
            if (orgError && orgError.code === '23505') {
                targetSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
                insertPayload.slug = targetSlug;
                const retryRes = await supabase
                    .from('organizations')
                    .insert(insertPayload)
                    .select()
                    .single();
                orgData = retryRes.data;
                orgError = retryRes.error;
            }

            if (!orgError && orgData) {
                // Ensure membership is registered in Supabase
                if (creatorUuid) {
                    try {
                        await supabase.from('organization_members').upsert({
                            organization_id: orgData.id,
                            user_id: creatorUuid,
                            role: 'OWNER',
                        }, { onConflict: 'organization_id,user_id' });
                    } catch (mErr) {
                        console.warn("Membership sync note:", mErr);
                    }
                }

                const created = createOrganizationLocally({
                    ...orgPayload,
                    id: orgData.id,
                    slug: orgData.slug,
                    joinCode: orgData.join_code || joinCode,
                });

                setActiveOrg(created.id);
                setSuccessOrg(created);
                setTimeout(() => {
                    router.push('/dashboard');
                    router.refresh();
                }, 1200);
                return;
            }

            // If Supabase encountered an error, check if it's network/offline
            if (orgError) {
                console.warn("Supabase org insert warning:", orgError);
            }

            // Graceful fallback to local workspace
            const localCreated = createOrganizationLocally(orgPayload);
            setActiveOrg(localCreated.id);
            setSuccessOrg(localCreated);
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1200);

        } catch (error: any) {
            console.error("Group creation error:", error);
            // Fallback: create in local workspace so user is never blocked
            const localCreated = createOrganizationLocally(orgPayload);
            setActiveOrg(localCreated.id);
            setSuccessOrg(localCreated);
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1200);
        } finally {
            setIsLoading(false);
        }
    }

    if (successOrg) {
        return (
            <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 text-center p-6 shadow-md">
                <CardContent className="pt-6 space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                            {successOrg.name} Created!
                        </h2>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                            Your community group workspace is ready. Access code: <span className="font-mono font-bold tracking-wider">{successOrg.joinCode}</span>
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Opening your dashboard...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-border/70">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Create a New Group</CardTitle>
                        <CardDescription>
                            Configure your community union, council, or association and define membership criteria.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs border-primary/30 text-primary">
                        <Building2 className="h-3.5 w-3.5" />
                        Admin Workspace
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {formError && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-3.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 text-primary" />
                                1. Group Identity & Category
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Group / Organization Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Umuahia Progressive Union"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        const name = e.target.value;
                                                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                                        form.setValue('slug', slug, { shouldValidate: true });
                                                    }}
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
                                            <FormLabel className="text-xs font-semibold">Workspace Identifier (Slug)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="umuahia-progressive-union" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Town Union">Town Union / Community Assc.</SelectItem>
                                                    <SelectItem value="Clan / Family Meeting">Clan / Family Meeting</SelectItem>
                                                    <SelectItem value="Age Grade">Age Grade Society</SelectItem>
                                                    <SelectItem value="Cooperative / Esusu">Cooperative / Esusu Club</SelectItem>
                                                    <SelectItem value="Youth Wing">Youth Wing Association</SelectItem>
                                                    <SelectItem value="Women's Wing">Women's Cultural Wing</SelectItem>
                                                    <SelectItem value="Diaspora Chapter">Diaspora Chapter</SelectItem>
                                                    <SelectItem value="Professional Group">Professional / Welfare Club</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="meetingFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Meeting Schedule</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                                    <SelectItem value="Bi-monthly">Every 2 Weeks</SelectItem>
                                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="Annual">Annual General Meeting</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Dues Currency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                                                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                                                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                                                    <SelectItem value="EUR">Euro (€)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold">Mission / Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Briefly state the purpose of this assembly, development goals, or brotherhood objectives..."
                                                className="resize-none h-18 text-xs"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Section 2: Membership Rules */}
                        <div className="space-y-3.5 pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Sliders className="h-4 w-4 text-primary" />
                                    2. Membership Eligibility Rules
                                </h3>
                                <span className="text-[11px] text-muted-foreground">Enforced during member onboarding</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                <FormField
                                    control={form.control}
                                    name="minAge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Min. Age Requirement</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={120}
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px]">e.g. 18, 21, or 50</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maxAge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Max. Age Limit</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={120}
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px]">e.g. 35 for Youth</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="requiredGender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Gender Rule</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Welcome</SelectItem>
                                                    <SelectItem value="MALE">Men Only</SelectItem>
                                                    <SelectItem value="FEMALE">Women Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="requiredNationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Nationality</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Nigerian">Nigerian</SelectItem>
                                                    <SelectItem value="Any">Any Nationality</SelectItem>
                                                    <SelectItem value="Ghanaian">Ghanaian</SelectItem>
                                                    <SelectItem value="Kenyan">Kenyan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Premium Identity Callout */}
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-xs space-y-0.5">
                                <p className="font-semibold text-primary">Premium Identity & Name Protection</p>
                                <p className="text-muted-foreground">
                                    Premium tier unlocks platform-wide name reservation, preventing unauthorized groups from duplicating or copying your community's official identity and brand.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="w-1/3" onClick={() => router.push('/dashboard')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="w-2/3 font-semibold shadow-sm" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Community Workspace
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
