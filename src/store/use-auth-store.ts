import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface AuthState {
    user: User | null;
    organizations: Organization[];
    activeOrgId: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setOrganizations: (orgs: Organization[]) => void;
    setActiveOrg: (orgId: string) => void;
    getActiveOrgRole: () => 'OWNER' | 'ADMIN' | 'MEMBER' | null;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            organizations: [],
            activeOrgId: null,

            setUser: (user) => set({ user }),
            logout: () => set({ user: null, activeOrgId: null, organizations: [] }),
            setOrganizations: (organizations) => set({ organizations }),
            setActiveOrg: (activeOrgId) => {
                set({ activeOrgId });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('x-org-id', activeOrgId);
                }
            },
            getActiveOrgRole: () => {
                const { organizations, activeOrgId } = get();
                const org = organizations.find((o) => o.id === activeOrgId);
                return org?.role || null;
            },
        }),
        {
            name: 'ogbako-auth-storage',
            partialize: (state) => ({
                organizations: state.organizations,
                activeOrgId: state.activeOrgId
                // We don't persist user here because Supabase handles the session
                // But keeping it in store is useful for UI state if we sync it
            }),
        }
    )
);
