"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Download, Search, Filter, Shield, Eye, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface TransactionItem {
    id: string
    organization_id: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    description: string
    date: string
    created_at: string
    created_by: string
    payer_name?: string
}

export default function TransactionsPage() {
    const { activeOrgId, user, getActiveOrgRole, transparencyMode } = useAuthStore()
    const role = getActiveOrgRole()
    const isAdmin = role === 'OWNER' || role === 'ADMIN'

    const [transactions, setTransactions] = useState<TransactionItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')

    useEffect(() => {
        async function fetchTransactions() {
            if (!activeOrgId || !user) return
            setIsLoading(true)
            const supabase = createClient()

            try {
                let query = supabase
                    .from('transactions')
                    .select(`
                        id,
                        organization_id,
                        amount,
                        type,
                        description,
                        date,
                        created_at,
                        created_by,
                        profiles:created_by (
                            full_name,
                            email
                        )
                    `)
                    .eq('organization_id', activeOrgId)
                    .order('date', { ascending: false })

                // TRANSPARENCY MODE ENFORCEMENT:
                // If member and transparencyMode is OFF, only fetch user's personal payments
                if (!isAdmin && !transparencyMode) {
                    query = query.eq('created_by', user.id)
                }

                const { data, error } = await query

                if (error) {
                    console.warn("Transactions query failed, using empty or fallback list:", error)
                    setTransactions([])
                } else {
                    const formatted = (data || []).map((t: any) => ({
                        id: t.id,
                        organization_id: t.organization_id,
                        amount: Number(t.amount),
                        type: t.type,
                        description: t.description,
                        date: t.date,
                        created_at: t.created_at,
                        created_by: t.created_by,
                        payer_name: t.profiles?.full_name || (t.created_by === user.id ? 'You' : 'Member')
                    }))
                    setTransactions(formatted)
                }
            } catch (err) {
                console.error("Error loading transactions:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTransactions()
    }, [activeOrgId, user, isAdmin, transparencyMode])

    // Filter by type and search query
    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterType === 'ALL' || t.type === filterType
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.payer_name && t.payer_name.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesType && matchesSearch
    })

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = filteredTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            alert("No transactions available to export.")
            return
        }

        const headers = ["ID", "Date", "Description", "Type", "Amount (NGN)", "Payer/Recorder"]
        const rows = filteredTransactions.map(t => [
            t.id,
            new Date(t.date).toLocaleDateString(),
            `"${t.description.replace(/"/g, '""')}"`,
            t.type,
            t.amount,
            `"${t.payer_name || ''}"`
        ])

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `ogbako-transactions-${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-0 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transaction Ledger</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Comprehensive ledger of all inflows, dues payments, and community expenditures.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Transparency Mode Banner */}
            {!isAdmin && !transparencyMode ? (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <div className="font-semibold flex items-center gap-2">
                            Transparency Mode is OFF (Personal View)
                            <Badge variant="outline" className="text-amber-800 bg-amber-100 border-amber-300">
                                Restricted
                            </Badge>
                        </div>
                        <p className="text-xs text-amber-800/90 mt-1">
                            Your organization administrator has configured financials to private mode. You are currently viewing only your own personal payment receipts and financial commitments.
                        </p>
                    </div>
                </div>
            ) : transparencyMode && (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-900 text-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-green-600 shrink-0" />
                        <div>
                            <div className="font-semibold flex items-center gap-2">
                                Transparency Mode is ON
                                <Badge className="bg-green-600 text-white hover:bg-green-600">
                                    Public Ledger
                                </Badge>
                            </div>
                            <p className="text-xs text-green-800/90 mt-0.5">
                                All organization members can openly inspect meeting dues collection and expenditure records.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Inflows (Income)</CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalIncome)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Expenditures</CardDescription>
                        <CardTitle className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalExpense)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Net Balance</CardDescription>
                        <CardTitle className={`text-2xl font-bold ${totalIncome >= totalExpense ? "text-primary" : "text-red-500"}`}>
                            {formatCurrency(totalIncome - totalExpense)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Table & Filtering */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={filterType === 'ALL' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterType('ALL')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterType === 'INCOME' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterType('INCOME')}
                            >
                                Inflows
                            </Button>
                            <Button
                                variant={filterType === 'EXPENSE' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterType('EXPENSE')}
                            >
                                Outflows
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground space-y-2">
                            <p className="font-medium">No transactions found.</p>
                            <p className="text-xs">
                                {!isAdmin && !transparencyMode
                                    ? "You have not made any recorded payments yet."
                                    : "No financial records match your current filter."}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Member / Source</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[11px] font-semibold ${
                                                    tx.type === 'INCOME'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}
                                            >
                                                {tx.type === 'INCOME' ? (
                                                    <span className="flex items-center gap-1">
                                                        <ArrowDownLeft className="h-3 w-3" /> Inflow
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <ArrowUpRight className="h-3 w-3" /> Outflow
                                                    </span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {tx.description}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {tx.payer_name}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
