'use client';

import { useAuthStore } from "@/store/use-auth-store";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CreditCard, Building2, Plus, Calendar, Users, FileText, Receipt, Shield, Eye, Settings, ArrowRight, User } from "lucide-react";
import { CreateOrgForm } from "@/components/onboarding/create-org-form";
import { JoinOrgForm } from "@/components/onboarding/join-org-form";
import { PersonalHub } from "@/components/dashboard/personal-hub";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DueStatus {
    id: string
    title: string
    amount: number
    due_date: string
    status: 'PAID' | 'OWED' | 'OVERDUE'
    displayAmount: number
}

interface Notification {
    id: string
    title: string
    message: string
    created_at: string
    is_read: boolean
}

export default function Page() {
    const router = useRouter();
    const { user, activeOrgId, organizations, setActiveOrg, getActiveOrgRole, transparencyMode } = useAuthStore();
    const role = getActiveOrgRole();
    const isAdmin = role === 'OWNER' || role === 'ADMIN';
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const userName = user?.user_metadata?.full_name || user?.email || 'User';

    const [memberStats, setMemberStats] = useState({
        totalOwed: 0,
        nextDueDate: null as string | null,
    });
    const [upcomingDues, setUpcomingDues] = useState<DueStatus[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!activeOrgId || !user) return;
            setIsLoading(true);
            const supabase = createClient();

            try {
                // 1. Fetch Dues & My Payments
                const { data: duesData } = await supabase
                    .from('dues')
                    .select('*')
                    .eq('organization_id', activeOrgId)
                    .order('due_date', { ascending: true }); // Ascending to find nearest

                const { data: payments } = await supabase
                    .from('transactions')
                    .select('amount, due_id')
                    .eq('organization_id', activeOrgId)
                    .eq('created_by', user.id);

                // Process Dues
                let owedSum = 0;
                let nextDue = null as string | null;
                const upcoming: DueStatus[] = [];

                (duesData || []).forEach((d: any) => {
                    const myPayment = payments?.find((p: any) => p.due_id === d.id);
                    const isPaid = !!myPayment;
                    const dueDate = new Date(d.due_date);
                    const isOverdue = !isPaid && dueDate < new Date();
                    let displayAmount = parseFloat(d.amount);

                    if (isOverdue && d.penalty_type === 'DOUBLE') displayAmount *= 2;

                    if (!isPaid) {
                        owedSum += displayAmount;
                        if (!nextDue || dueDate < new Date(nextDue)) nextDue = d.due_date;

                        // Add to upcoming list (limit to 3 later)
                        upcoming.push({
                            id: d.id,
                            title: d.title,
                            amount: d.amount,
                            due_date: d.due_date,
                            status: isOverdue ? 'OVERDUE' : 'OWED',
                            displayAmount
                        });
                    }
                });

                setMemberStats({
                    totalOwed: owedSum,
                    nextDueDate: nextDue
                });
                setUpcomingDues(upcoming.slice(0, 3)); // Top 3

                // 2. Fetch Notifications
                const { data: notifs } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('organization_id', activeOrgId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                setNotifications(notifs || []);

            } catch (error) {
                console.error("Error fetching member data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [activeOrgId, user]);


    const [showProfileHub, setShowProfileHub] = useState(false);

    // 1. Unified Personal Hub when no organizations joined yet or explicitly viewed
    if (organizations.length === 0 || showProfileHub) {
        return (
            <div className="flex flex-col min-h-screen">
                {organizations.length > 0 && (
                    <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setShowProfileHub(false)}>
                            ← Back to {organizations.find(o => o.id === activeOrgId)?.name || 'Dashboard'}
                        </Button>
                        <Badge variant="outline">Personal Hub</Badge>
                    </div>
                )}
                <PersonalHub />
            </div>
        );
    }

    // 2. Selection State
    if (!activeOrgId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 space-y-6 relative">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Select an Organization</h1>
                    <p className="text-muted-foreground text-sm max-w-md">
                        You belong to multiple community platforms. Choose which workspace you want to open.
                    </p>
                </div>
                <div className="grid gap-4 w-full max-w-3xl grid-cols-1 md:grid-cols-2">
                    {organizations.map((org) => (
                        <Card key={org.id} className="cursor-pointer hover:border-primary transition-all hover:shadow-md border-border/80 flex flex-col justify-between" onClick={() => setActiveOrg(org.id)}>
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="font-semibold text-lg">{org.name}</CardTitle>
                                    <span className="text-xs text-muted-foreground capitalize">{org.category || 'Community Group'}</span>
                                </div>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Building2 className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                    <span>Role: <strong className="capitalize text-foreground">{org.role.toLowerCase()}</strong></span>
                                    {org.joinCode && <span>Code: <code className="font-mono font-bold text-foreground">{org.joinCode}</code></span>}
                                </div>
                                <Button variant="secondary" className="w-full font-medium">Open Workspace →</Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Card to create another new group */}
                    <Card className="border-dashed border-2 hover:border-primary transition-all hover:shadow-md flex flex-col items-center justify-center p-6 text-center bg-muted/10 cursor-pointer" onClick={() => router.push('/create-org')}>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                            <Plus className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-base">Create New Group</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            Establish a new town union, age grade, or clan assembly.
                        </p>
                    </Card>
                </div>
            </div>
        );
    }

    const currentOrg = organizations.find(o => o.id === activeOrgId);

    // 3. New Member Dashboard
    return (
        <div className="flex flex-1 flex-col gap-5 p-4 pt-0">
            {/* Multi-Platform Switcher Banner if member of multiple organizations */}
            {organizations.length > 1 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground">
                            Multi-Platform Active: <strong className="text-foreground">{currentOrg?.name}</strong> ({organizations.length} groups)
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {organizations.map((org) => {
                            const isCurrent = org.id === activeOrgId;
                            return (
                                <Button
                                    key={org.id}
                                    variant={isCurrent ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveOrg(org.id)}
                                    className={`h-7 px-2.5 text-xs ${isCurrent ? 'bg-primary text-primary-foreground font-semibold' : 'bg-background hover:bg-muted'}`}
                                >
                                    <span className="max-w-[130px] truncate">{org.name}</span>
                                </Button>
                            );
                        })}
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1"
                        >
                            <Link href="/create-org">
                                <Plus className="h-3 w-3" />
                                <span>New</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName.split(' ')[0]}</h1>
                    <p className="text-sm text-muted-foreground">
                        {currentOrg ? `${currentOrg.name} Portal & Financial Workspace` : 'Your community meeting portal and financial workspace.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setShowProfileHub(true)} className="text-xs gap-1.5 h-8">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>My Personal Profile</span>
                    </Button>
                    <Badge variant={transparencyMode ? "default" : "secondary"} className="flex items-center gap-1.5 py-1 px-3 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Transparency Mode: {transparencyMode ? "ON" : "OFF"}</span>
                    </Badge>
                    {isAdmin && (
                        <Badge variant="outline" className="text-xs border-primary/40 bg-primary/5 text-primary">
                            <Shield className="h-3 w-3 mr-1 text-primary" /> Admin Mode
                        </Badge>
                    )}
                </div>
            </div>

            {/* Quick Actions Bar */}
            <Card className="bg-muted/30 border shadow-sm">
                <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                            <Link href="/dashboard/financials/dues">
                                <CreditCard className="h-4 w-4 text-emerald-600" />
                                <span>Pay Dues</span>
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                            <Link href="/dashboard/content">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span>Minutes</span>
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                            <Link href="/dashboard/members">
                                <Users className="h-4 w-4 text-violet-600" />
                                <span>Members</span>
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                            <Link href="/dashboard/financials/transactions">
                                <Receipt className="h-4 w-4 text-amber-600" />
                                <span>Ledger</span>
                            </Link>
                        </Button>
                        {isAdmin ? (
                            <>
                                <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                                    <Link href="/dashboard/admin/dues">
                                        <Shield className="h-4 w-4 text-indigo-600" />
                                        <span>Manage Dues</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                                    <Link href="/dashboard/settings">
                                        <Settings className="h-4 w-4 text-slate-600" />
                                        <span>Settings</span>
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" size="sm" asChild className="h-auto py-2.5 flex flex-col items-center justify-center gap-1 text-xs hover:border-primary hover:bg-primary/5">
                                <Link href="/dashboard/financials">
                                    <Eye className="h-4 w-4 text-cyan-600" />
                                    <span>Financials</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className={memberStats.totalOwed > 0 ? "border-red-200 bg-red-50/60" : "border-green-200 bg-green-50/60"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(memberStats.totalOwed)}</div>
                        <p className="text-xs text-muted-foreground">{memberStats.totalOwed > 0 ? "Action required" : "All caught up"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {memberStats.nextDueDate ? new Date(memberStats.nextDueDate).toLocaleDateString() : "None"}
                        </div>
                        <p className="text-xs text-muted-foreground">Upcoming obligation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notifications.filter(n => !n.is_read).length}</div>
                        <p className="text-xs text-muted-foreground">Unread messages</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Upcoming Dues */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Dues</CardTitle>
                        <CardDescription>Your pending financial obligations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="text-muted-foreground text-sm">Loading...</div>
                        ) : upcomingDues.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <CreditCard className="h-8 w-8 mb-2 opacity-20" />
                                <p>No pending dues. You're all set!</p>
                            </div>
                        ) : (
                            upcomingDues.map(due => (
                                <div key={due.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{due.title}</p>
                                        <p className="text-sm text-muted-foreground">Due: {new Date(due.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={`font-bold ${due.status === 'OVERDUE' ? 'text-red-600' : ''}`}>
                                                {formatCurrency(due.displayAmount)}
                                            </p>
                                            {due.status === 'OVERDUE' && <Badge variant="destructive" className="text-[10px] h-5">Overdue</Badge>}
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href="/dashboard/financials/dues">Pay</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Notifications Widget */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Recent updates and broadcasts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-muted-foreground text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Bell className="h-8 w-8 mb-2 opacity-20" />
                                <p>No new notifications.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map(n => (
                                    <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${n.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{n.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground opacity-70">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
