"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Due {
    id: string
    title: string
    amount: number
    due_date: string
    type: string
    penalty_type: string
}

interface DueStatus extends Due {
    status: 'PAID' | 'OWED' | 'OVERDUE'
    paidAmount: number
    penaltyOptimistic: boolean
    displayAmount: number
    originalAmount: number
}

export default function DuesPage() {
    const { activeOrgId, user } = useAuthStore()
    const [dues, setDues] = useState<DueStatus[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({ totalOwed: 0, totalPaid: 0, percentage: 0 })

    const supabase = createClient()

    useEffect(() => {
        if (activeOrgId && user) fetchDuesData()
    }, [activeOrgId, user])

    async function fetchDuesData() {
        setIsLoading(true)
        if (!activeOrgId || !user) return;

        try {
            // 1. Fetch Dues Definition
            const { data: duesData, error: duesError } = await supabase
                .from('dues')
                .select('*')
                .eq('organization_id', activeOrgId)
                .order('due_date', { ascending: false })

            if (duesError) throw duesError;

            // 2. Fetch User Transactions (Payments)
            // We assume transactions linked to dues will be implemented. 
            // For now, let's query transactions with 'type' = 'INCOME' and see if we can link them?
            // Actually, my migration added `due_id` to `transactions`.
            const { data: payments, error: payError } = await supabase
                .from('transactions')
                .select('amount, due_id')
                .eq('organization_id', activeOrgId)
                .eq('created_by', user.id) // Or use a 'payer_id' if implemented, but creates_by match is OK for now

            if (payError) throw payError;

            // 3. Process Logic
            let totalExpected = 0;
            let totalPaid = 0;

            const processedDues: DueStatus[] = (duesData || []).map((d: any) => {
                const myPayment = payments?.find((p: any) => p.due_id === d.id);
                const isPaid = !!myPayment;
                const paidAmt = myPayment ? parseFloat(myPayment.amount) : 0;

                // Penalty Logic (Client-side simulation)
                const dueDate = new Date(d.due_date);
                const isOverdue = !isPaid && dueDate < new Date();
                let displayAmount = parseFloat(d.amount);

                if (isOverdue && d.penalty_type === 'DOUBLE') {
                    displayAmount = displayAmount * 2;
                }

                totalExpected += displayAmount;
                if (isPaid) totalPaid += paidAmt; // Or use displayAmount if we consider fully settled

                return {
                    ...d,
                    originalAmount: parseFloat(d.amount),
                    displayAmount: displayAmount,
                    status: isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'OWED'),
                    paidAmount: paidAmt,
                    penaltyOptimistic: isOverdue && d.penalty_type === 'DOUBLE'
                };
            });

            setDues(processedDues);

            const percentage = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 100; // Default to 100 if nothing owed
            setStats({
                totalOwed: totalExpected - totalPaid,
                totalPaid,
                percentage
            })

        } catch (error) {
            console.error("Error fetching dues:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Dues</h1>
                    <p className="text-muted-foreground">Manage your financial obligations.</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{Math.round(stats.percentage)}%</div>
                    <p className="text-xs text-muted-foreground">Paid Status</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Paid</CardDescription>
                        <CardTitle className="text-2xl text-green-600">{formatCurrency(stats.totalPaid)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Outstanding Balance</CardDescription>
                        <CardTitle className="text-2xl text-red-600">{formatCurrency(stats.totalOwed)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Dues List */}
            <Card>
                <CardHeader>
                    <CardTitle>Obligations ({dues.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No dues assigned yet.</TableCell>
                                </TableRow>
                            ) : dues.map((due) => (
                                <TableRow key={due.id}>
                                    <TableCell className="font-medium">
                                        {due.title}
                                        {due.type !== 'MONTHLY' && <Badge variant="outline" className="ml-2 text-[10px]">{due.type}</Badge>}
                                    </TableCell>
                                    <TableCell>{new Date(due.due_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {due.status === 'PAID' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>}
                                        {due.status === 'OWED' && <Badge variant="outline">Unpaid</Badge>}
                                        {due.status === 'OVERDUE' && <Badge variant="destructive">Overdue</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={due.penaltyOptimistic ? "text-red-500 font-bold" : ""}>
                                                {formatCurrency(due.displayAmount)}
                                            </span>
                                            {due.penaltyOptimistic && (
                                                <span className="text-xs text-muted-foreground line-through decoration-red-500">
                                                    {formatCurrency(due.originalAmount)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {due.status !== 'PAID' && (
                                            <Button size="sm" variant="default">Pay</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    )
}
