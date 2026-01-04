"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MemberFinancial {
    user_id: string
    full_name: string
    email: string
    total_obligations: number
    total_paid: number
    outstanding_balance: number
}

export default function AdminDefaultersPage() {
    const { activeOrgId, getActiveOrgRole } = useAuthStore()
    const router = useRouter()
    const [defaulters, setDefaulters] = useState<MemberFinancial[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const role = getActiveOrgRole()
        if (role !== 'OWNER' && role !== 'ADMIN') {
            router.push('/dashboard')
        } else {
            fetchDefaulters()
        }
    }, [activeOrgId, getActiveOrgRole, router])

    async function fetchDefaulters() {
        if (!activeOrgId) return
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase
                .from('member_financials_view')
                .select('*')
                .eq('organization_id', activeOrgId)
                .gt('outstanding_balance', 0) // Only fetch those who owe money
                .order('outstanding_balance', { ascending: false })

            if (error) {
                // If view doesn't exist yet (migration not run), fetch simple error
                console.error("View fetch error", error)
            } else {
                setDefaulters(data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold">Defaulter Tracking</h1>
            <p className="text-muted-foreground">Monitor outstanding payments and identify defaulters.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Outstanding Balances</CardTitle>
                    <CardDescription>Members with unpaid dues.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead className="text-right">Total Owed</TableHead>
                                    <TableHead className="text-right">Total Paid</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {defaulters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No defaulters found. Everyone is paid up! 🎉
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    defaulters.map((member) => (
                                        <TableRow key={member.user_id}>
                                            <TableCell>
                                                <div className="font-medium">{member.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(member.total_obligations)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(member.total_paid)}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                {formatCurrency(member.outstanding_balance)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">Defaulter</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
