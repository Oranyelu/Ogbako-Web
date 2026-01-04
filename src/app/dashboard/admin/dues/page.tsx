"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AdminDuesPage() {
    const { activeOrgId, getActiveOrgRole } = useAuthStore()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState("")
    const [type, setType] = useState("MONTHLY")
    const [penalty, setPenalty] = useState("NONE")

    useEffect(() => {
        const role = getActiveOrgRole()
        if (role !== 'OWNER' && role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [activeOrgId, getActiveOrgRole, router])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrgId) return
        setIsLoading(true)

        const supabase = createClient()
        const { error } = await supabase.from('dues').insert({
            organization_id: activeOrgId,
            title,
            amount: parseFloat(amount),
            due_date: date,
            type,
            penalty_type: penalty
        })

        if (error) {
            alert("Error creating due: " + error.message)
        } else {
            alert("Due created successfully!")
            setTitle("")
            setAmount("")
            setDate("")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold">Manage Dues</h1>
            <p className="text-muted-foreground">Create financial obligations for your members.</p>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Create New Due</CardTitle>
                    <CardDescription>Assign a new payment obligation to all members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input placeholder="e.g. January 2024 Dues" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (₦)</Label>
                            <Input type="number" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                >
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="PROJECT">Project</option>
                                    <option value="CONDOLENCE">Condolence</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Penalty Logic</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={penalty}
                                    onChange={e => setPenalty(e.target.value)}
                                >
                                    <option value="NONE">None</option>
                                    <option value="DOUBLE">Double if Late</option>
                                </select>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Due
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
