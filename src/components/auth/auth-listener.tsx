'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthListener() {
    const router = useRouter();
    const { setUser, setOrganizations, organizations, loadUserOrganizations } = useAuthStore();

    useEffect(() => {
        const supabase = createClient();

        // 1. Initial Session Check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                if (organizations.length === 0) {
                    await loadUserOrganizations(supabase, session.user);
                }
            }
        });

        // 2. Listen for Auth Changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                await loadUserOrganizations(supabase, session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setOrganizations([]);
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setOrganizations, loadUserOrganizations, organizations.length, router]);

    return null; // This component renders nothing
}
