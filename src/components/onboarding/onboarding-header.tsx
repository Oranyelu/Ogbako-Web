'use client';

import Link from "next/link";
import { Users, ArrowLeft, LogOut, User as UserIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/use-auth-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function OnboardingHeader() {
    const router = useRouter();
    const { user, userProfile, logout } = useAuthStore();

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Sign out note:", e);
        }
        logout();
        router.push('/login');
    };

    const displayName = userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
    const displayEmail = userProfile?.email || user?.email || '';
    const avatarUrl = userProfile?.profilePicture || user?.user_metadata?.avatar_url;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
            <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 mx-auto">
                <div className="flex items-center gap-3">
                    <Link className="flex items-center gap-2" href="/dashboard">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-primary">Ogbako</span>
                    </Link>
                    <span className="hidden sm:inline-block text-muted-foreground/40 font-light">|</span>
                    <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-xs py-0.5 px-2.5 bg-muted/30">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>Create Community Workspace</span>
                    </Badge>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="/dashboard" className="flex items-center gap-1.5">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>

                    {user && (
                        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                            <div className="flex items-center gap-2 hidden md:flex">
                                <Avatar className="h-7 w-7 border">
                                    {avatarUrl ? (
                                        <AvatarImage src={avatarUrl} alt={displayName} />
                                    ) : (
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                            {displayName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="text-left text-xs leading-tight">
                                    <div className="font-semibold max-w-[120px] truncate">{displayName}</div>
                                    <div className="text-[10px] text-muted-foreground max-w-[120px] truncate">{displayEmail}</div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
                                title="Sign out"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline ml-1.5">Sign Out</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
