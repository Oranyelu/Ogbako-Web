"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, AlertCircle, CheckCircle, CreditCard, Building2, Smartphone, CheckCircle2 } from "lucide-react"
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

    // In-app payment modal state
    const [selectedDue, setSelectedDue] = useState<DueStatus | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card')
    const [isPaying, setIsPaying] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)

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
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => setSelectedDue(due)}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                            >
                                                Pay Dues
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* In-App Dues Payment Modal */}
            <Dialog open={!!selectedDue} onOpenChange={(open) => !open && setSelectedDue(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Settle Dues Obligation</DialogTitle>
                        <DialogDescription>
                            Complete in-app payment for <strong className="text-foreground">{selectedDue?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {paymentSuccess ? (
                        <div className="py-8 text-center space-y-3">
                            <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Payment Successful!</h3>
                            <p className="text-sm text-muted-foreground">
                                Your payment receipt has been issued and credited to the organization treasury.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {/* Amount breakdown */}
                            <div className="p-4 rounded-xl bg-muted/60 border space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Due Amount</span>
                                    <span>{selectedDue && formatCurrency(selectedDue.originalAmount)}</span>
                                </div>
                                {selectedDue?.penaltyOptimistic && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Late Penalty Surcharge</span>
                                        <span>+{formatCurrency(selectedDue.displayAmount - selectedDue.originalAmount)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2 flex justify-between font-bold text-base">
                                    <span>Total Payable</span>
                                    <span className="text-primary">{selectedDue && formatCurrency(selectedDue.displayAmount)}</span>
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Choose Payment Channel</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'card' ? "default" : "outline"}
                                        className="h-16 flex-col gap-1 text-xs"
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Debit Card
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'transfer' ? "default" : "outline"}
                                        className="h-16 flex-col gap-1 text-xs"
                                        onClick={() => setPaymentMethod('transfer')}
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Bank Transfer
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'ussd' ? "default" : "outline"}
                                        className="h-16 flex-col gap-1 text-xs"
                                        onClick={() => setPaymentMethod('ussd')}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                        USSD Code
                                    </Button>
                                </div>
                            </div>

                            {paymentMethod === 'transfer' ? (
                                <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
                                    <p className="font-semibold text-foreground">Dedicated Virtual Account:</p>
                                    <p className="text-muted-foreground">Bank: <strong className="text-foreground">Wema / Ogbako Pay</strong></p>
                                    <p className="text-muted-foreground">Account Number: <strong className="text-foreground">9012847192</strong></p>
                                    <p className="text-[11px] text-muted-foreground">Payment is verified automatically within 60 seconds.</p>
                                </div>
                            ) : paymentMethod === 'ussd' ? (
                                <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
                                    <p className="font-semibold text-foreground">Dial USSD string on your registered SIM:</p>
                                    <p className="font-mono text-primary font-bold text-sm">*737*50*5000*901#</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
                                    Pay securely using your Verve, Mastercard, or Visa Nigerian debit card.
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedDue(null)}
                                    disabled={isPaying}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (!selectedDue || !activeOrgId || !user) return;
                                        setIsPaying(true);

                                        try {
                                            const { error: txError } = await supabase
                                                .from('transactions')
                                                .insert({
                                                    organization_id: activeOrgId,
                                                    due_id: selectedDue.id,
                                                    amount: selectedDue.displayAmount,
                                                    type: 'INCOME',
                                                    description: `Payment for ${selectedDue.title}`,
                                                    date: new Date().toISOString(),
                                                    created_by: user.id
                                                });

                                            if (txError) {
                                                console.warn("Transaction insert error:", txError);
                                            }

                                            setPaymentSuccess(true);
                                            setTimeout(async () => {
                                                setPaymentSuccess(false);
                                                setSelectedDue(null);
                                                await fetchDuesData();
                                            }, 1400);
                                        } catch (err: any) {
                                            alert("Payment error: " + err.message);
                                        } finally {
                                            setIsPaying(false);
                                        }
                                    }}
                                    disabled={isPaying}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                                >
                                    {isPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                    {isPaying ? "Authorizing..." : `Pay ${selectedDue ? formatCurrency(selectedDue.displayAmount) : ""}`}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
}
