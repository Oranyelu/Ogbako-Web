'use client';

import * as React from 'react';
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/layout/nav-main';
import { NavProjects } from '@/components/layout/nav-projects';
import { NavUser } from '@/components/layout/nav-user';
import { TeamSwitcher } from '@/components/layout/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar';

import { useAuthStore } from '@/store/use-auth-store';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { getActiveOrgRole, user: authUser, activeOrgId, transparencyMode } = useAuthStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Only render sidebar content if mounted and there is an active organization
    const shouldShowSidebar = mounted && !!activeOrgId;
    const role = shouldShowSidebar ? getActiveOrgRole() : null;
    const isAdminOrOwner = role === 'OWNER' || role === 'ADMIN';

    // Define Navigation Items
    const navItems = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: SquareTerminal,
            isActive: true,
            items: [
                { title: 'Overview', url: '/dashboard' },
                { title: 'Analytics', url: '/dashboard/analytics' },
            ],
        },
        {
            title: 'Members',
            url: '/dashboard/members',
            icon: Bot,
            items: [
                { title: 'All Members', url: '/dashboard/members' },
                { title: 'Roles & Permissions', url: '/dashboard/members/roles', requiredRole: ['OWNER', 'ADMIN'] },
            ],
        },
        {
            title: 'Financials',
            url: '/dashboard/financials',
            icon: BookOpen,
            items: isAdminOrOwner || transparencyMode ? [
                { title: 'Overview', url: '/dashboard/financials' },
                { title: 'Transactions', url: '/dashboard/financials/transactions' },
                { title: 'Dues & Obligations', url: '/dashboard/financials/dues' },
            ] : [
                { title: 'My Dues', url: '/dashboard/financials/dues' },
                { title: 'My Payments', url: '/dashboard/financials/transactions' },
            ],
        },
        {
            title: 'Meetings & Minutes',
            url: '/dashboard/content',
            icon: Frame,
            items: [
                { title: 'Content Studio', url: '/dashboard/content' },
            ],
        },
        {
            title: 'Settings',
            url: '/dashboard/settings',
            icon: Settings2,
            items: [
                { title: 'Organization', url: '/dashboard/settings' },
                { title: 'Billing & Plans', url: '/dashboard/settings/billing' },
            ],
        },
        {
            title: 'Admin',
            url: '/dashboard/admin',
            icon: Command,
            requiredRole: ['OWNER', 'ADMIN'],
            items: [
                { title: 'Invitations', url: '/dashboard/admin/codes' },
                { title: 'Manage Dues', url: '/dashboard/admin/dues' },
                { title: 'Defaulters', url: '/dashboard/admin/defaulters' },
                { title: 'Broadcasts', url: '/dashboard/admin/notifications' },
            ],
        },
    ];

    // Filter Navigation based on Role & Visibility
    const filteredNav = shouldShowSidebar ? navItems.filter((item) => {
        // @ts-ignore
        if (item.requiredRole && !item.requiredRole.includes(role || '')) return false;
        return true;
    }).map(item => ({
        ...item,
        items: item.items?.filter(subItem => {
            // @ts-ignore
            if (subItem.requiredRole && !subItem.requiredRole.includes(role || '')) return false;
            return true;
        })
    })) : [];

    // User Display Logic
    const userDisplay = (mounted && authUser) ? {
        name: authUser.user_metadata?.full_name || authUser.email || 'User',
        email: authUser.email || '',
        avatar: authUser.user_metadata?.avatar_url || '',
    } : { name: '', email: '', avatar: '' }; // Empty fallback, not placeholders

    if (mounted && !activeOrgId) {
        // If not in an organization, we render a minimal or hidden sidebar 
        // Returning null might break layout expectation of SidebarProvider, 
        // so we render a collapsed/hidden version or simply null if SidebarProvider handles it.
        // Let's return a simple authorized user footer so they can logout if stuck.
        return (
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader>
                    {/* Empty Header in onboarding */}
                </SidebarHeader>
                <SidebarContent>
                    {/* Empty Content in onboarding */}
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={userDisplay} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        );
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredNav} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userDisplay} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
