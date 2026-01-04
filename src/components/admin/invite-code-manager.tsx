"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/use-auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Copy, Check } from "lucide-react"

interface InviteCode {
    id: string
    code: string
    role: string
    created_at: string
    used_at: string | null
    expires_at: string | null
}

export function InviteCodeManager() {
    const { activeOrgId } = useAuthStore()
    const [codes, setCodes] = useState<InviteCode[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        if (activeOrgId) fetchCodes()
    }, [activeOrgId])

    async function fetchCodes() {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('verification_codes')
            .select('*')
            .eq('organization_id', activeOrgId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setCodes(data)
        }
        setIsLoading(false)
    }

    async function generateCode() {
        if (!activeOrgId) return
        setIsGenerating(true)

        // Generate random 8-char code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase()

        const { data, error } = await supabase
            .from('verification_codes')
            .insert({
                organization_id: activeOrgId,
                code: code,
                role: 'MEMBER'
            })
            .select()
            .single()

        if (error) {
            alert("Failed to generate code")
        } else {
            alert("Invite code generated!")
            setCodes([data, ...codes])
        }
        setIsGenerating(false)
    }

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        alert("Code copied to clipboard: " + code)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Invitation Codes</CardTitle>
                    <CardDescription>Generate one-time codes for new members.</CardDescription>
                </div>
                <Button onClick={generateCode} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Generate New
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {codes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No codes generated yet.</TableCell>
                                </TableRow>
                            ) : codes.map((code) => (
                                <TableRow key={code.id}>
                                    <TableCell className="font-mono font-medium">{code.code}</TableCell>
                                    <TableCell>{code.role}</TableCell>
                                    <TableCell>
                                        {code.used_at ? (
                                            <span className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded">Used</span>
                                        ) : (
                                            <span className="text-green-500 text-xs bg-green-50 px-2 py-1 rounded">Active</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!code.used_at && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(code.code, code.id)}
                                            >
                                                {copiedId === code.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                <span className="sr-only">Copy</span>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
