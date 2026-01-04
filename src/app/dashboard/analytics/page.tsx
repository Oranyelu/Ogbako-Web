'use client';

import { useAuthStore } from "@/store/use-auth-store";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { OverviewChart } from "@/components/financials/overview-chart";
import { RecentSales } from "@/components/financials/recent-sales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Activity } from "lucide-react";

export default function AnalyticsPage() {
    const { user, activeOrgId } = useAuthStore();

    // Dashboard Data State
    const [stats, setStats] = useState({
        memberCount: 0,
        totalRevenue: 0,
        recentTransactions: [] as any[]
    });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Analytics Data
    useEffect(() => {
        async function fetchDashboardData() {
            if (!activeOrgId) return;
            setIsLoading(true);
            const supabase = createClient();

            try {
                // 1. Members Count
                const { count: memberCount, error: memberError } = await supabase
                    .from('organization_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('organization_id', activeOrgId);

                // 2. Transactions (for Revenue & Recent Activity)
                const { data: transactions, error: txError } = await supabase
                    .from('transactions')
                    .select(`
                        *,
                        profiles:created_by (
                            full_name,
                            email
                        )
                    `)
                    .eq('organization_id', activeOrgId)
                    .order('date', { ascending: false });

                if (memberError) throw memberError;
                if (txError) throw txError;

                const income = (transactions || [])
                    .filter(t => t.type === 'INCOME')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                setStats({
                    memberCount: memberCount || 0,
                    totalRevenue: income,
                    recentTransactions: transactions || []
                });

            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [activeOrgId]);


    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold">Analytics Overview</h1>
            <p className="text-muted-foreground mb-4">Organization performance and financial health.</p>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Members
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.memberCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active members in org
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : `₦${stats.totalRevenue.toLocaleString()}`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total collected to date
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {stats.recentTransactions.length > 0 ? (
                            <OverviewChart data={stats.recentTransactions} />
                        ) : (
                            <div className="h-[200px] w-full bg-muted/20 flex items-center justify-center rounded-md text-muted-foreground">
                                No transaction data yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity using dynamic data */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <div className="text-sm text-muted-foreground">Latest financial transactions</div>
                    </CardHeader>
                    <CardContent>
                        {stats.recentTransactions.length > 0 ? (
                            <RecentSales data={stats.recentTransactions.slice(0, 5)} />
                        ) : (
                            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                                No recent activity to show.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
