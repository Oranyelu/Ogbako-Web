"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Member, columns } from "./columns"
import { DataTable } from "./data-table"
import { Loader2 } from "lucide-react"

export default function MembersPage() {
    const { activeOrgId, user } = useAuthStore()
    const [data, setData] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMembers() {
            if (!activeOrgId) return;
            setIsLoading(true);
            const supabase = createClient();

            try {
                const { data: members, error } = await supabase
                    .from('organization_members')
                    .select(`
                        id,
                        user_id,
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

                const formattedMembers: Member[] = members.map((m: any) => {
                    const isCurrentUser = m.user_id === user?.id;
                    const name = m.profiles?.full_name || 'Unknown';

                    return {
                        id: m.id,
                        name: isCurrentUser ? `${name} (You)` : name,
                        email: m.profiles?.email || 'No Email',
                        role: m.role,
                        status: m.status || 'ACTIVE',
                        lastActive: m.created_at
                    };
                });

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
