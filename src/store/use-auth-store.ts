import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    nationality?: string;
    stateOfOrigin?: string;
    address?: string;
    profilePicture?: string;
    bio?: string;
    occupation?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
}

export interface GroupMembershipRules {
    minAge?: number;
    maxAge?: number;
    requiredNationality?: string;
    requiredGender?: 'ALL' | 'MALE' | 'FEMALE';
    requiredState?: string;
    requiresApproval?: boolean;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    tier?: SubscriptionTier;
    transparencyMode?: boolean;
    memberCount?: number;
    description?: string;
    category?: string;
    meetingFrequency?: string;
    currency?: string;
    joinCode?: string;
    rules?: GroupMembershipRules;
    isVerifiedIdentity?: boolean; // Premium tier protection
}

export function calculateAge(dobString: string): number {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 0;
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function checkEligibility(
    profile: UserProfile | null,
    rules?: GroupMembershipRules
): { eligible: boolean; reasons: string[] } {
    if (!rules) return { eligible: true, reasons: [] };

    const reasons: string[] = [];
    const age = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0;

    // Minimum Age Check
    if (rules.minAge && age < rules.minAge) {
        reasons.push(`Minimum age required is ${rules.minAge} years (your recorded age is ${age || 'not specified'}).`);
    }

    // Maximum Age Check
    if (rules.maxAge && age > rules.maxAge) {
        reasons.push(`Maximum age allowed is ${rules.maxAge} years (your recorded age is ${age}).`);
    }

    // Nationality Check
    if (
        rules.requiredNationality &&
        rules.requiredNationality !== 'Any' &&
        profile?.nationality &&
        profile.nationality.toLowerCase() !== rules.requiredNationality.toLowerCase()
    ) {
        reasons.push(`Requires ${rules.requiredNationality} nationality (your profile says ${profile.nationality}).`);
    }

    // Gender Check
    if (
        rules.requiredGender &&
        rules.requiredGender !== 'ALL' &&
        profile?.gender &&
        profile.gender !== rules.requiredGender
    ) {
        reasons.push(`This group is restricted to ${rules.requiredGender.toLowerCase()} members only.`);
    }

    // State of Origin Check
    if (
        rules.requiredState &&
        rules.requiredState !== 'Any' &&
        profile?.stateOfOrigin &&
        profile.stateOfOrigin.toLowerCase() !== rules.requiredState.toLowerCase()
    ) {
        reasons.push(`Requires state of origin from ${rules.requiredState}.`);
    }

    return {
        eligible: reasons.length === 0,
        reasons
    };
}

const DEFAULT_SAMPLE_GROUPS: Organization[] = [
    {
        id: 'sample-group-1',
        name: 'Umuahia Progressive Union',
        slug: 'umuahia-progressive-union',
        role: 'MEMBER',
        tier: 'PRO',
        transparencyMode: true,
        memberCount: 84,
        description: 'Fostering unity, infrastructural development, and cultural continuity for indigenes of Umuahia at home and in the diaspora.',
        category: 'Town Union',
        meetingFrequency: 'Monthly',
        currency: 'NGN',
        joinCode: 'UMU001',
        isVerifiedIdentity: true,
        rules: {
            minAge: 21,
            requiredNationality: 'Nigerian',
            requiredGender: 'ALL',
            requiredState: 'Abia'
        }
    },
    {
        id: 'sample-group-2',
        name: 'Odimma Youth Wing Association',
        slug: 'odimma-youth-wing',
        role: 'MEMBER',
        tier: 'BASIC',
        transparencyMode: true,
        memberCount: 42,
        description: 'Youth development, tech empowerment, and grassroots community mobilization for young leaders.',
        category: 'Youth Wing',
        meetingFrequency: 'Bi-monthly',
        currency: 'NGN',
        joinCode: 'YOUTH9',
        isVerifiedIdentity: false,
        rules: {
            minAge: 18,
            maxAge: 35,
            requiredNationality: 'Nigerian',
            requiredGender: 'ALL'
        }
    },
    {
        id: 'sample-group-3',
        name: "Ndi Inyom Cultural Assembly",
        slug: 'ndi-inyom-assembly',
        role: 'MEMBER',
        tier: 'PRO',
        transparencyMode: false,
        memberCount: 65,
        description: 'Welfare, mutual micro-savings, and community cultural support for women.',
        category: "Women's Wing",
        meetingFrequency: 'Monthly',
        currency: 'NGN',
        joinCode: 'WOMEN1',
        isVerifiedIdentity: true,
        rules: {
            minAge: 20,
            requiredNationality: 'Nigerian',
            requiredGender: 'FEMALE'
        }
    },
    {
        id: 'sample-group-4',
        name: 'Global Diaspora Investment Club',
        slug: 'global-diaspora-club',
        role: 'MEMBER',
        tier: 'PREMIUM',
        transparencyMode: true,
        memberCount: 156,
        description: 'Diaspora cooperative pooling capital for homeland health centers, schools, and venture financing.',
        category: 'Diaspora Chapter',
        meetingFrequency: 'Monthly',
        currency: 'USD',
        joinCode: 'DIAS01',
        isVerifiedIdentity: true,
        rules: {
            minAge: 25,
            requiredGender: 'ALL'
        }
    }
];

interface AuthState {
    user: User | null;
    userProfile: UserProfile | null;
    organizations: Organization[];
    activeOrgId: string | null;
    transparencyMode: boolean;
    currentTier: SubscriptionTier;
    availableGroups: Organization[];

    // Actions
    setUser: (user: User | null) => void;
    setUserProfile: (profile: Partial<UserProfile>) => void;
    setOrganizations: (orgs: Organization[]) => void;
    setActiveOrg: (orgId: string) => void;
    getActiveOrg: () => Organization | undefined;
    getActiveOrgRole: () => 'OWNER' | 'ADMIN' | 'MEMBER' | null;
    setTransparencyMode: (enabled: boolean) => void;
    setTier: (tier: SubscriptionTier) => void;
    createOrganizationLocally: (orgData: Partial<Organization>) => Organization;
    joinOrganization: (orgId: string, joinCode?: string) => { success: boolean; message: string; org?: Organization };
    loadUserOrganizations: (supabase: any, user: User) => Promise<Organization[]>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            userProfile: null,
            organizations: [],
            activeOrgId: null,
            transparencyMode: false,
            currentTier: 'FREE',
            availableGroups: DEFAULT_SAMPLE_GROUPS,

            setUser: (user) => {
                const existingProfile = get().userProfile;
                if (user && !existingProfile) {
                    const meta = user.user_metadata || {};
                    set({
                        user,
                        userProfile: {
                            id: user.id,
                            fullName: meta.full_name || meta.name || user.email?.split('@')[0] || 'User',
                            email: user.email || '',
                            phone: meta.phone || '',
                            dateOfBirth: meta.date_of_birth || '',
                            gender: meta.gender || 'PREFER_NOT_TO_SAY',
                            nationality: meta.nationality || 'Nigerian',
                            stateOfOrigin: meta.state_of_origin || '',
                            address: meta.address || '',
                            profilePicture: meta.avatar_url || '',
                            bio: meta.bio || '',
                        }
                    });
                } else {
                    set({ user });
                }
            },

            setUserProfile: (updated) => {
                const current = get().userProfile || {
                    id: get().user?.id || 'usr-' + Date.now(),
                    fullName: get().user?.user_metadata?.full_name || 'Member',
                    email: get().user?.email || '',
                    phone: '',
                    dateOfBirth: '',
                    nationality: 'Nigerian',
                };
                set({ userProfile: { ...current, ...updated } });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('x-org-id');
                }
                set({
                    user: null,
                    userProfile: null,
                    activeOrgId: null,
                    organizations: [],
                    transparencyMode: false
                });
            },

            setOrganizations: (organizations) => {
                const { activeOrgId } = get();
                const activeStillExists = organizations.some(o => o.id === activeOrgId);
                const nextActiveId = activeStillExists ? activeOrgId : (organizations[0]?.id || null);
                const activeOrg = organizations.find(o => o.id === nextActiveId);

                set({
                    organizations,
                    activeOrgId: nextActiveId,
                    transparencyMode: activeOrg?.transparencyMode ?? false,
                    currentTier: activeOrg?.tier ?? 'FREE',
                });

                if (nextActiveId && typeof window !== 'undefined') {
                    localStorage.setItem('x-org-id', nextActiveId);
                }
            },

            setActiveOrg: (activeOrgId) => {
                const org = get().organizations.find((o) => o.id === activeOrgId);
                set({
                    activeOrgId,
                    transparencyMode: org?.transparencyMode ?? false,
                    currentTier: org?.tier ?? 'FREE',
                });
                if (typeof window !== 'undefined') {
                    if (activeOrgId) {
                        localStorage.setItem('x-org-id', activeOrgId);
                    } else {
                        localStorage.removeItem('x-org-id');
                    }
                }
            },

            getActiveOrg: () => {
                const { organizations, activeOrgId } = get();
                return organizations.find((o) => o.id === activeOrgId);
            },

            getActiveOrgRole: () => {
                const { organizations, activeOrgId } = get();
                const org = organizations.find((o) => o.id === activeOrgId);
                return org?.role || null;
            },

            setTransparencyMode: (enabled: boolean) => {
                const { organizations, activeOrgId } = get();
                const updatedOrgs = organizations.map(org =>
                    org.id === activeOrgId ? { ...org, transparencyMode: enabled } : org
                );
                set({ transparencyMode: enabled, organizations: updatedOrgs });
            },

            setTier: (tier: SubscriptionTier) => {
                const { organizations, activeOrgId } = get();
                const updatedOrgs = organizations.map(org =>
                    org.id === activeOrgId ? { ...org, tier } : org
                );
                set({ currentTier: tier, organizations: updatedOrgs });
            },

            createOrganizationLocally: (orgData: Partial<Organization>) => {
                const newId = orgData.id || 'org-' + Math.random().toString(36).substring(2, 9);
                const newOrg: Organization = {
                    id: newId,
                    name: orgData.name || 'My Organization',
                    slug: orgData.slug || (orgData.name || 'org').toLowerCase().replace(/\s+/g, '-'),
                    role: 'OWNER',
                    tier: orgData.tier || 'BASIC',
                    transparencyMode: orgData.transparencyMode ?? false,
                    memberCount: 1,
                    description: orgData.description || '',
                    category: orgData.category || 'Town Union',
                    meetingFrequency: orgData.meetingFrequency || 'Monthly',
                    currency: orgData.currency || 'NGN',
                    joinCode: orgData.joinCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
                    rules: orgData.rules || {
                        minAge: 18,
                        requiredNationality: 'Nigerian',
                        requiredGender: 'ALL'
                    },
                    isVerifiedIdentity: orgData.isVerifiedIdentity ?? false
                };

                const updated = [...get().organizations, newOrg];
                const updatedAvailable = [...get().availableGroups, newOrg];
                set({
                    organizations: updated,
                    availableGroups: updatedAvailable,
                    activeOrgId: newOrg.id,
                    currentTier: newOrg.tier || 'BASIC',
                    transparencyMode: newOrg.transparencyMode || false
                });

                if (typeof window !== 'undefined') {
                    localStorage.setItem('x-org-id', newOrg.id);
                }

                return newOrg;
            },

            joinOrganization: (orgId: string, joinCode?: string) => {
                const { availableGroups, organizations, userProfile } = get();
                const target = availableGroups.find(g => g.id === orgId || g.joinCode === joinCode?.toUpperCase());

                if (!target) {
                    return { success: false, message: 'Organization or access code not found.' };
                }

                // Check if already a member
                if (organizations.some(o => o.id === target.id)) {
                    set({ activeOrgId: target.id });
                    return { success: true, message: 'Switched to active organization.', org: target };
                }

                // Validate membership rules
                const check = checkEligibility(userProfile, target.rules);
                if (!check.eligible) {
                    return {
                        success: false,
                        message: `Membership criteria not met: ${check.reasons.join(' ')}`
                    };
                }

                const joinedOrg: Organization = {
                    ...target,
                    role: 'MEMBER',
                    memberCount: (target.memberCount || 1) + 1
                };

                const updated = [...organizations, joinedOrg];
                set({
                    organizations: updated,
                    activeOrgId: joinedOrg.id,
                    currentTier: joinedOrg.tier || 'FREE',
                    transparencyMode: joinedOrg.transparencyMode || false
                });

                if (typeof window !== 'undefined') {
                    localStorage.setItem('x-org-id', joinedOrg.id);
                }

                return { success: true, message: `Successfully joined ${target.name}!`, org: joinedOrg };
            },

            loadUserOrganizations: async (supabase: any, user: User) => {
                try {
                    const { data: memberRows, error } = await supabase
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
                        .eq('user_id', user.id);

                    if (error || !memberRows || memberRows.length === 0) {
                        return get().organizations;
                    }

                    const loadedOrgs: Organization[] = memberRows
                        .filter((row: any) => row.organizations)
                        .map((row: any) => ({
                            id: row.organizations.id,
                            name: row.organizations.name,
                            slug: row.organizations.slug,
                            role: row.role as 'OWNER' | 'ADMIN' | 'MEMBER',
                            tier: 'BASIC',
                            transparencyMode: false
                        }));

                    if (loadedOrgs.length > 0) {
                        get().setOrganizations(loadedOrgs);
                    }
                    return loadedOrgs;
                } catch (e) {
                    console.warn("Could not load user organizations from Supabase:", e);
                    return get().organizations;
                }
            }
        }),
        {
            name: 'ogbako-auth-storage',
            partialize: (state) => ({
                user: state.user,
                userProfile: state.userProfile,
                organizations: state.organizations,
                activeOrgId: state.activeOrgId,
                transparencyMode: state.transparencyMode,
                currentTier: state.currentTier,
                availableGroups: state.availableGroups,
            }),
        }
    )
);
