'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ChevronsUpDown, Check, Plus, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/use-auth-store';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DashboardTopNav() {
    const router = useRouter();
    const { organizations, activeOrgId, setActiveOrg, user, userProfile, logout } = useAuthStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Sign out note:", e);
        }
        logout();
        router.push('/');
    };

    if (!mounted) {
        return <div className="h-9 w-48 animate-pulse bg-muted/20 rounded-md" />;
    }

    const activeOrg = organizations.find((o) => o.id === activeOrgId);
    const displayName = userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
    const avatarUrl = userProfile?.profilePicture || user?.user_metadata?.avatar_url;

    return (
        <div className="flex items-center gap-2 ml-auto pr-4">
            {/* Multi-Platform / Organization Switcher */}
            {organizations.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 bg-background border-border/80 hover:bg-muted/30 text-xs font-medium max-w-[220px]"
                        >
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{activeOrg ? activeOrg.name : 'Select Platform'}</span>
                            {organizations.length > 1 && (
                                <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-primary/10 text-primary">
                                    {organizations.length}
                                </Badge>
                            )}
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-auto" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-1">
                        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                            Switch Community Platform
                        </DropdownMenuLabel>
                        {organizations.map((org) => {
                            const isCurrent = org.id === activeOrgId;
                            return (
                                <DropdownMenuItem
                                    key={org.id}
                                    onClick={() => setActiveOrg(org.id)}
                                    className={`flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-md text-xs ${
                                        isCurrent ? 'bg-primary/10 text-primary font-semibold' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <Building2 className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div className="truncate">
                                            <div className="truncate">{org.name}</div>
                                            <div className="text-[10px] text-muted-foreground capitalize font-normal">{org.role.toLowerCase()}</div>
                                        </div>
                                    </div>
                                    {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem asChild className="cursor-pointer py-1.5 px-2.5 text-xs">
                            <Link href="/create-org" className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5 text-primary" />
                                <span>Create New Group</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* User Profile & Sign Out Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                        <Avatar className="h-8 w-8 border">
                            {avatarUrl ? (
                                <AvatarImage src={avatarUrl} alt={displayName} />
                            ) : (
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                    {displayName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                    <div className="p-2 border-b">
                        <p className="text-xs font-semibold truncate">{displayName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer py-1.5 px-2.5 text-xs">
                        <Link href="/dashboard/settings" className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>My Profile & Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer py-1.5 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                        <div className="flex items-center gap-2">
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Sign Out</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
