"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Loader2, Download, Shield, Eye, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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
    const { activeOrgId, getActiveOrgRole, transparencyMode } = useAuthStore()
    const role = getActiveOrgRole()
    const isAdmin = role === 'OWNER' || role === 'ADMIN'

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Derived Metrics
    const totalRevenue = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const duesCollected = totalRevenue;

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

    const handleDownloadReport = () => {
        if (transactions.length === 0) {
            alert("No transaction records available to export yet.");
            return;
        }

        const headers = ["Transaction ID", "Date", "Description", "Type", "Amount (NGN)", "Recorded By"];
        const rows = transactions.map(t => [
            t.id,
            new Date(t.date).toLocaleDateString(),
            `"${t.description.replace(/"/g, '""')}"`,
            t.type,
            t.amount,
            `"${t.profiles?.full_name || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ogbako-financial-report-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    // TRANSPARENCY MODE RESTRICTION:
    // If user is a regular member and Transparency Mode is OFF, don't reveal full org treasury
    if (!isAdmin && !transparencyMode) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financials</h2>
                    <p className="text-muted-foreground text-sm mt-1">Community financial records & commitments.</p>
                </div>

                <Card className="border-2 border-amber-200 bg-amber-50/50 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2 text-amber-950">
                                    Transparency Mode is Disabled
                                    <Badge variant="outline" className="text-amber-800 bg-amber-100 border-amber-300">
                                        Private Mode
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-amber-800/80">
                                    Overall treasury balances and organization-wide transactions are currently restricted by your administrators.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-amber-900 leading-relaxed">
                            Under the current privacy settings, members can only view their own personal dues, payment history, and individual financial obligations.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link href="/dashboard/financials/dues">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                                    View My Dues Obligations
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/dashboard/financials/transactions">
                                <Button variant="outline" className="border-amber-300 hover:bg-amber-100/50 text-amber-900">
                                    View My Payment Receipts
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold tracking-tight">Financials</h2>
                        {transparencyMode && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-xs">
                                <Eye className="h-3 w-3 mr-1 text-green-600" />
                                Transparency Mode ON
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Overview of organizational revenue, dues collection, and meeting transactions.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleDownloadReport} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>Recent transaction activity.</CardDescription>
                            </div>
                            <Link href="/dashboard/financials/transactions">
                                <Button variant="outline" size="sm" className="gap-1">
                                    Open Full Ledger
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
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
