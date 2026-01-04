"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import { InviteCodeManager } from "@/components/admin/invite-code-manager"

export default function AdminCodesPage() {
    const { getActiveOrgRole } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        const role = getActiveOrgRole()
        if (role !== 'OWNER' && role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [])

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold">Invitation Codes</h1>
            <p className="text-muted-foreground">Manage and generate secure invitation codes for your organization.</p>
            <InviteCodeManager />
        </div>
    )
}
