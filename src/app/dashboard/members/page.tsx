"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Member, columns } from "./columns"
import { DataTable } from "./data-table"
import { Loader2 } from "lucide-react"

export default function MembersPage() {
    const { activeOrgId } = useAuthStore()
    const [data, setData] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMembers() {
            if (!activeOrgId) return;
            setIsLoading(true);
            const supabase = createClient();

            // Fetch members and join with profiles (assuming profiles table exists and has name/email)
            // User said: profiles (user data), organization_members (links user to org)
            // We need to fetch organization_members where org_id = activeOrgId
            // And join with profiles on user_id

            try {
                const { data: members, error } = await supabase
                    .from('organization_members')
                    .select(`
                        id,
                        role,
                        status,
                        created_at,
                        profiles:user_id (
                            full_name,
                            email
                        )
                    `)
                    .eq('organization_id', activeOrgId);

                if (error) throw error;

                const formattedMembers: Member[] = members.map((m: any) => ({
                    id: m.id,
                    // Handle nested profile data safely
                    name: m.profiles?.full_name || 'Unknown',
                    email: m.profiles?.email || 'No Email',
                    role: m.role, // "OWNER" | "ADMIN" | "MEMBER"
                    status: m.status || 'ACTIVE', // Fallback if status not in DB or null
                    lastActive: m.created_at // Using joined_at/created_at as proxy for now
                }));

                setData(formattedMembers);
            } catch (err) {
                console.error("Error fetching members:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMembers();
    }, [activeOrgId]);

    if (isLoading) {
        return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Members</h2>
                    <p className="text-muted-foreground">Manage your organization members here.</p>
                </div>
            </div>
            <div className="mt-4">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
