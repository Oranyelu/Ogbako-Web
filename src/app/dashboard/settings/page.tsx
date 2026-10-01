"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Shield, CheckCircle2, Building2, CreditCard, Bell, Save, Loader2, ArrowRight, Sliders, User } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
    const {
        activeOrgId,
        getActiveOrg,
        getActiveOrgRole,
        transparencyMode,
        setTransparencyMode,
        currentTier,
        organizations,
        setOrganizations
    } = useAuthStore()

    const activeOrg = getActiveOrg()
    const role = getActiveOrgRole()
    const isAdmin = role === 'OWNER' || role === 'ADMIN'

    const [orgName, setOrgName] = useState(activeOrg?.name || "")
    const [slug, setSlug] = useState(activeOrg?.slug || "")
    const [currency, setCurrency] = useState("NGN (₦)")
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const [minAge, setMinAge] = useState(activeOrg?.rules?.minAge || 18)
    const [maxAge, setMaxAge] = useState(activeOrg?.rules?.maxAge || 100)
    const [requiredGender, setRequiredGender] = useState(activeOrg?.rules?.requiredGender || 'ALL')
    const [requiredNationality, setRequiredNationality] = useState(activeOrg?.rules?.requiredNationality || 'Nigerian')
    const [rulesSaved, setRulesSaved] = useState(false)

    useEffect(() => {
        if (activeOrg) {
            setOrgName(activeOrg.name)
            setSlug(activeOrg.slug)
            if (activeOrg.rules) {
                setMinAge(activeOrg.rules.minAge || 18)
                setMaxAge(activeOrg.rules.maxAge || 100)
                setRequiredGender(activeOrg.rules.requiredGender || 'ALL')
                setRequiredNationality(activeOrg.rules.requiredNationality || 'Nigerian')
            }
        }
    }, [activeOrg])

    const handleSaveRules = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAdmin) return
        const updated = organizations.map(org =>
            org.id === activeOrgId ? {
                ...org,
                rules: {
                    minAge: Number(minAge),
                    maxAge: Number(maxAge),
                    requiredGender: requiredGender as any,
                    requiredNationality
                }
            } : org
        )
        setOrganizations(updated)
        setRulesSaved(true)
        setTimeout(() => setRulesSaved(false), 3000)
    }

    const handleToggleTransparency = async () => {
        if (!isAdmin) {
            alert("Only organization Owners and Admins can toggle Transparency Mode.")
            return
        }

        const nextMode = !transparencyMode
        setTransparencyMode(nextMode)

        // Persist to Supabase if organization table exists
        if (activeOrgId) {
            try {
                const supabase = createClient()
                await supabase
                    .from('organizations')
                    .update({ transparency_mode: nextMode })
                    .eq('id', activeOrgId)
            } catch (err) {
                console.warn("Could not persist transparency_mode to DB, kept in local state:", err)
            }
        }
    }

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAdmin) {
            alert("Only organization Admins can update organization profile.")
            return
        }

        setIsSaving(true)
        setSaveSuccess(false)

        try {
            if (activeOrgId) {
                const supabase = createClient()
                await supabase
                    .from('organizations')
                    .update({ name: orgName })
                    .eq('id', activeOrgId)

                // Update store
                const updated = organizations.map(org =>
                    org.id === activeOrgId ? { ...org, name: orgName } : org
                )
                setOrganizations(updated)
            }
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: any) {
            console.error("Save error:", err)
            alert("Failed to save settings: " + (err.message || "Unknown error"))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 pt-0 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your community workspace profile, transparency rules, and subscription preferences.
                </p>
            </div>

            {/* Transparency Mode Setting Card */}
            <Card className="border-2 border-primary/20 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${transparencyMode ? "bg-green-500" : "bg-amber-500"}`} />
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${transparencyMode ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {transparencyMode ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                            </div>
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    Transparency Mode
                                    {transparencyMode ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                            Active (Public to Members)
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-300">
                                            Private (Admins Only)
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Control whether members can inspect full meeting financial records or only their individual dues.
                                </CardDescription>
                            </div>
                        </div>

                        {isAdmin && (
                            <Button
                                onClick={handleToggleTransparency}
                                variant={transparencyMode ? "outline" : "default"}
                                className={`shrink-0 ${
                                    transparencyMode
                                        ? "border-green-600 text-green-700 hover:bg-green-50"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                            >
                                {transparencyMode ? "Turn Off Transparency" : "Turn On Transparency"}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border text-sm transition-all ${transparencyMode ? "bg-green-50/50 border-green-200" : "bg-muted/40 border-border opacity-70"}`}>
                            <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                                <CheckCircle2 className={`h-4 w-4 ${transparencyMode ? "text-green-600" : "text-muted-foreground"}`} />
                                When Transparency Mode is ON
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Every member who belongs to this meeting can see the organization's total treasury collections, income charts, meeting expenditure records, and verified transaction ledgers.
                            </p>
                        </div>

                        <div className={`p-4 rounded-xl border text-sm transition-all ${!transparencyMode ? "bg-amber-50/50 border-amber-200" : "bg-muted/40 border-border opacity-70"}`}>
                            <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                                <Shield className={`h-4 w-4 ${!transparencyMode ? "text-amber-600" : "text-muted-foreground"}`} />
                                When Transparency Mode is OFF
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Regular members can strictly ONLY view their own personal dues, payments, and outstanding balances. Organization-wide financial analytics remain private to Admins.
                            </p>
                        </div>
                    </div>

                    {!isAdmin && (
                        <p className="text-xs text-muted-foreground italic">
                            * Note: Only organization administrators have permission to change the Transparency Mode setting.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* General Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        General Information
                    </CardTitle>
                    <CardDescription>
                        Basic workspace identification details.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveGeneral}>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="orgName">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    disabled={!isAdmin || isSaving}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Workspace Slug / URL</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    disabled
                                    className="bg-muted text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Default Currency</Label>
                                <Input
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="myRole">Your Membership Role</Label>
                                <Input
                                    id="myRole"
                                    value={role || "Member"}
                                    disabled
                                    className="bg-muted font-medium text-foreground cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </CardContent>

                    {isAdmin && (
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                            <div>
                                {saveSuccess && (
                                    <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Changes saved successfully!
                                    </span>
                                )}
                            </div>
                            <Button type="submit" disabled={isSaving} className="gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    )}
                </form>
            </Card>

            {/* Membership Rules & Criteria Configuration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Sliders className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Membership Eligibility Rules</CardTitle>
                                <CardDescription>
                                    Define demographic criteria required for new members joining this assembly.
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {isAdmin ? "Admin Configurable" : "View Only"}
                        </Badge>
                    </div>
                </CardHeader>
                <form onSubmit={handleSaveRules}>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minAge">Minimum Age</Label>
                                <Input
                                    id="minAge"
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={minAge}
                                    onChange={(e) => setMinAge(Number(e.target.value))}
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxAge">Maximum Age Limit</Label>
                                <Input
                                    id="maxAge"
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={maxAge}
                                    onChange={(e) => setMaxAge(Number(e.target.value))}
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reqGender">Gender Requirement</Label>
                                <select
                                    id="reqGender"
                                    value={requiredGender}
                                    onChange={(e) => setRequiredGender(e.target.value as any)}
                                    disabled={!isAdmin}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="ALL">All Welcome</option>
                                    <option value="MALE">Men Only</option>
                                    <option value="FEMALE">Women Only</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reqNat">Nationality</Label>
                                <Input
                                    id="reqNat"
                                    value={requiredNationality}
                                    onChange={(e) => setRequiredNationality(e.target.value)}
                                    disabled={!isAdmin}
                                    placeholder="e.g. Nigerian"
                                />
                            </div>
                        </div>
                    </CardContent>
                    {isAdmin && (
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                            <div>
                                {rulesSaved && (
                                    <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Membership rules updated!
                                    </span>
                                )}
                            </div>
                            <Button type="submit" variant="outline" className="gap-2">
                                <Save className="h-4 w-4" />
                                Update Rules
                            </Button>
                        </CardFooter>
                    )}
                </form>
            </Card>

            {/* Subscription & Billing Quick Summary */}
            <Card className="bg-card/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Subscription & Plan</CardTitle>
                                <CardDescription>
                                    Manage your community tier, member capacity, and payments.
                                </CardDescription>
                            </div>
                        </div>
                        <Badge className="bg-secondary text-secondary-foreground">
                            {currentTier} PLAN
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Your organization is on the <strong className="text-foreground">{currentTier}</strong> plan. Upgrade anytime to unlock in-app dues payments, offline mode, automated meeting minutes, and AI summaries.
                    </p>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                    <Link href="/dashboard/settings/billing">
                        <Button variant="default" className="gap-2">
                            View Plans & Upgrade
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
