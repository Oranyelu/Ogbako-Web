"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { OverviewChart } from "@/components/financials/overview-chart"
import { RecentSales } from "@/components/financials/recent-sales"

interface Transaction {
    id: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    description: string
    date: string
    created_at: string
    profiles: {
        full_name: string | null
        email: string | null
    } | null
}

export default function FinancialsPage() {
    const { activeOrgId } = useAuthStore()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Derived Metrics
    const totalRevenue = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const duesCollected = totalRevenue; // Simplified for now (assuming all income is dues)

    useEffect(() => {
        async function fetchFinancials() {
            if (!activeOrgId) return;
            setIsLoading(true);
            const supabase = createClient();

            try {
                // Fetch transactions with creator info
                const { data, error } = await supabase
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

                if (error) throw error;
                setTransactions(data || []);
            } catch (err) {
                console.error("Error fetching financials:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchFinancials();
    }, [activeOrgId]);

    if (isLoading) {
        return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Financials</h2>
                <div className="flex items-center space-x-2">
                    <Button>Download Report</Button>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="reports" disabled>
                        Reports
                    </TabsTrigger>
                    <TabsTrigger value="notifications" disabled>
                        Notifications
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    Lifetime revenue
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Dues Collected
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{duesCollected.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    From {transactions.length} transactions
                                </p>
                            </CardContent>
                        </Card>
                        {/* Placeholders for metrics we don't calculate yet */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <rect width="20" height="14" x="2" y="5" rx="2" />
                                    <path d="M2 10h20" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦0.00</div>
                                <p className="text-xs text-muted-foreground">
                                    +0% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Subscriptions
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+0</div>
                                <p className="text-xs text-muted-foreground">
                                    +0 since last hour
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <OverviewChart data={transactions} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    You have {transactions.length} transactions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentSales data={transactions.slice(0, 5)} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>View all transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No transactions found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className={t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                {t.type === 'INCOME' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
