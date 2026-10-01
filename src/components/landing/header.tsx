'use client';

import Link from "next/link";
import { Users, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LandingHeader() {
    const router = useRouter();
    const { user, userProfile, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Sign out note:", e);
        }
        logout();
        router.push('/');
    };

    const displayName = userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
    const avatarUrl = userProfile?.profilePicture || user?.user_metadata?.avatar_url;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 mx-auto">
                <Link className="flex items-center gap-2" href={mounted && user ? "/dashboard" : "/"}>
                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-primary">Ogbako</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
                    <Link className="hover:text-primary transition-colors" href="/#features">
                        Features
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="/#solutions">
                        Multi-Tenancy
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="/#pricing">
                        Pricing
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="/#how-it-works">
                        How It Works
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    {mounted && user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                                <Avatar className="h-8 w-8 border">
                                    {avatarUrl ? (
                                        <AvatarImage src={avatarUrl} alt={displayName} />
                                    ) : (
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                            {displayName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <span className="text-xs font-semibold max-w-[120px] truncate">{displayName}</span>
                            </div>
                            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 shadow-sm gap-1.5 text-xs sm:text-sm">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                    <ArrowRight className="h-3.5 w-3.5 ml-1 hidden sm:inline" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="h-9 px-2 text-muted-foreground hover:text-destructive"
                                title="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="font-medium px-4 text-foreground/80 hover:text-primary">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-5 shadow-sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
