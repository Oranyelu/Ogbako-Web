import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    tier?: SubscriptionTier;
    transparencyMode?: boolean;
    memberCount?: number;
}

interface AuthState {
    user: User | null;
    organizations: Organization[];
    activeOrgId: string | null;
    transparencyMode: boolean;
    currentTier: SubscriptionTier;

    // Actions
    setUser: (user: User | null) => void;
    setOrganizations: (orgs: Organization[]) => void;
    setActiveOrg: (orgId: string) => void;
    getActiveOrg: () => Organization | undefined;
    getActiveOrgRole: () => 'OWNER' | 'ADMIN' | 'MEMBER' | null;
    setTransparencyMode: (enabled: boolean) => void;
    setTier: (tier: SubscriptionTier) => void;
    loadUserOrganizations: (supabase: any, user: User) => Promise<Organization[]>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            organizations: [],
            activeOrgId: null,
            transparencyMode: false,
            currentTier: 'FREE',

            setUser: (user) => set({ user }),
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('x-org-id');
                }
                set({ user: null, activeOrgId: null, organizations: [], transparencyMode: false });
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
            loadUserOrganizations: async (supabase: any, user: User) => {
                try {
                    // Query organizations user belongs to
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
                            tier: 'BASIC', // Default active tier
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
                organizations: state.organizations,
                activeOrgId: state.activeOrgId,
                transparencyMode: state.transparencyMode,
                currentTier: state.currentTier,
            }),
        }
    )
);
