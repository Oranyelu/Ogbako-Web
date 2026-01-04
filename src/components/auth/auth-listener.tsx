'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthListener() {
    const router = useRouter();
    const { setUser, setOrganizations, activeOrgId } = useAuthStore();

    useEffect(() => {
        const supabase = createClient();

        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Update store with fresh user data (metadata, email, etc.)
                setUser(session.user);
            }
        });

        // 2. Listen for Auth Changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Update user in store whenever session refreshes/signs in
                setUser(session.user);

                // Optional: You could fetch organizations here if needed
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setOrganizations([]);
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setOrganizations, router]);

    return null; // This component renders nothing
}
