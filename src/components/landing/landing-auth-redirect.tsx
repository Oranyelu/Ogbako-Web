'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { createClient } from '@/lib/supabase/client';

export function LandingAuthRedirect() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        // If client store has a user, redirect to dashboard
        if (user) {
            router.replace('/dashboard');
            return;
        }

        // Also check if Supabase session exists
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                router.replace('/dashboard');
            }
        });
    }, [user, router]);

    return null;
}
