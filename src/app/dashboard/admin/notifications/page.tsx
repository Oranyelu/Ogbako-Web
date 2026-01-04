"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"

export default function AdminNotificationsPage() {
    const { activeOrgId, getActiveOrgRole } = useAuthStore()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const role = getActiveOrgRole()
        if (role !== 'OWNER' && role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [activeOrgId, getActiveOrgRole, router])

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrgId) return
        setIsLoading(true)

        const supabase = createClient()
        const { error } = await supabase.rpc('broadcast_notification', {
            _org_id: activeOrgId,
            _title: title,
            _message: message
        })

        if (error) {
            alert("Error sending broadcast: " + error.message)
        } else {
            alert("Broadcast sent successfully to all members!")
            setTitle("")
            setMessage("")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold">Broadcast Notifications</h1>
            <p className="text-muted-foreground">Send announcements to all organization members.</p>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>New Broadcast</CardTitle>
                    <CardDescription>This message will appear in every member's dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleBroadcast} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="Important Announcement"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Broadcast
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
