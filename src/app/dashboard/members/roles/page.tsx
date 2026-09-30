"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Users, Check, Lock, Loader2, CheckCircle2 } from "lucide-react"

interface MemberRoleItem {
    id: string
    user_id: string
    name: string
    email: string
    role: 'OWNER' | 'ADMIN' | 'SECRETARY' | 'TREASURER' | 'MEMBER'
}

const ROLE_PERMISSIONS = [
    {
        role: "OWNER",
        title: "Executive President / Founder",
        description: "Full authority over the entire organization workspace, billing, and dissolution.",
        badgeColor: "bg-red-100 text-red-800 border-red-300",
        permissions: [
            "Manage Billing & Upgrade Plans",
            "Toggle Transparency Mode",
            "Create & Delete Dues",
            "Assign Member Roles",
            "Publish Meeting Minutes",
            "Send Community Broadcasts"
        ]
    },
    {
        role: "ADMIN",
        title: "Executive Vice President / Admin",
        description: "Manages day-to-day organizational operations and finances.",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        permissions: [
            "Toggle Transparency Mode",
            "Create Dues & Late Penalties",
            "Generate Member Invite Codes",
            "Record Income & Expenses",
            "Send Community Broadcasts",
            "Publish Meeting Minutes"
        ]
    },
    {
        role: "TREASURER",
        title: "Financial Secretary / Treasurer",
        description: "Dedicated officer managing treasury ledger, dues tracking, and defaulters.",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        permissions: [
            "Track & Confirm Member Payments",
            "Export Financial Reports",
            "Defaulter Follow-up",
            "View Financial Analytics",
        ]
    },
    {
        role: "MEMBER",
        title: "General Member",
        description: "Standard community member with access to personal dues and authorized meetings.",
        badgeColor: "bg-green-100 text-green-800 border-green-300",
        permissions: [
            "Pay Dues Online",
            "View Personal Payment Receipts",
            "View Financial Records (when Transparency Mode is ON)",
            "Access Meeting Minutes & Broadcasts",
        ]
    }
]

export default function MemberRolesPage() {
    const { activeOrgId, getActiveOrgRole, user } = useAuthStore()
    const currentRole = getActiveOrgRole()
    const isOwnerOrAdmin = currentRole === 'OWNER' || currentRole === 'ADMIN'

    const [members, setMembers] = useState<MemberRoleItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

    useEffect(() => {
        async function fetchOrgMembers() {
            if (!activeOrgId) return
            setIsLoading(true)
            const supabase = createClient()

            try {
                const { data, error } = await supabase
                    .from('organization_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        profiles:user_id (
                            full_name,
                            email
                        )
                    `)
                    .eq('organization_id', activeOrgId)

                if (error) {
                    console.warn("Could not query DB members, fallbacking:", error)
                    setMembers([])
                } else {
                    const formatted = (data || []).map((m: any) => ({
                        id: m.id,
                        user_id: m.user_id,
                        name: m.profiles?.full_name || (m.user_id === user?.id ? 'You' : 'Member'),
                        email: m.profiles?.email || 'N/A',
                        role: m.role || 'MEMBER'
                    }))
                    setMembers(formatted)
                }
            } catch (e) {
                console.error("Error fetching member roles:", e)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrgMembers()
    }, [activeOrgId, user])

    const handleRoleChange = async (memberId: string, newRole: string) => {
        if (!isOwnerOrAdmin) {
            alert("Only Organization Owners or Admins can reassign member roles.")
            return
        }

        setUpdatingId(memberId)
        try {
            const supabase = createClient()
            await supabase
                .from('organization_members')
                .update({ role: newRole })
                .eq('id', memberId)

            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole as any } : m))
            setStatusFeedback("Role updated successfully!")
            setTimeout(() => setStatusFeedback(null), 3000)
        } catch (err: any) {
            alert("Failed to update role: " + err.message)
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 pt-0 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage governance roles and authority boundaries across your organization.
                </p>
            </div>

            {statusFeedback && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {statusFeedback}
                </div>
            )}

            {/* Member Role Assignment Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Member Role Assignments
                    </CardTitle>
                    <CardDescription>
                        Assign administrative and executive responsibilities to community members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No members found in this organization.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Current Role</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="font-medium text-foreground">{member.name}</div>
                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-semibold">
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isOwnerOrAdmin && member.role !== 'OWNER' ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    disabled={updatingId === member.id}
                                                    className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none"
                                                >
                                                    <option value="MEMBER">Member</option>
                                                    <option value="TREASURER">Treasurer</option>
                                                    <option value="SECRETARY">Secretary</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Locked</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Role Permission Hierarchy Breakdown */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Role Permission Matrix</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {ROLE_PERMISSIONS.map((perm) => (
                        <Card key={perm.role} className="flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{perm.title}</CardTitle>
                                    <Badge variant="outline" className={perm.badgeColor}>
                                        {perm.role}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs leading-relaxed pt-1">
                                    {perm.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="border-t pt-4">
                                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                    Entitled Capabilities
                                </span>
                                <ul className="space-y-2 pt-2">
                                    {perm.permissions.map((p, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
