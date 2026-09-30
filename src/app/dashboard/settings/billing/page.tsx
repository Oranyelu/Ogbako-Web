"use client"

import { useState } from "react"
import { useAuthStore, SubscriptionTier } from "@/store/use-auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, CreditCard, Users, Shield, ArrowUpRight, Zap, CheckCircle2 } from "lucide-react"

interface PlanInfo {
    id: SubscriptionTier
    name: string
    price: string
    numericPrice: number
    period: string
    memberLimit: string
    maxMembers: number
    description: string
    badge?: string
    highlight?: boolean
    features: string[]
}

const PLANS: PlanInfo[] = [
    {
        id: "FREE",
        name: "Free Testing Tier",
        price: "₦0",
        numericPrice: 0,
        period: "/month",
        memberLimit: "10 members",
        maxMembers: 10,
        description: "Free tier designed specifically for evaluation and testing with your executive council.",
        badge: "Testing",
        features: [
            "Up to 10 members",
            "Manual financial tracking",
            "Member directory",
            "Executive dashboard",
        ]
    },
    {
        id: "BASIC",
        name: "Basic",
        price: "₦20,000",
        numericPrice: 20000,
        period: "/month",
        memberLimit: "50 members",
        maxMembers: 50,
        description: "Essential tooling for small town unions, branches, and community chapters.",
        badge: "Town Unions",
        features: [
            "Up to 50 members",
            "Complete financial tracking",
            "Meeting minutes taking studio",
            "Member directory & role permissions",
            "Late penalty multiplier logic",
            "Defaulter tracking",
        ]
    },
    {
        id: "PRO",
        name: "Pro",
        price: "₦50,000",
        numericPrice: 50000,
        period: "/month",
        memberLimit: "200 members",
        maxMembers: 200,
        description: "Advanced community management with in-app payments, offline meeting mode, and minute notifications.",
        highlight: true,
        badge: "Most Popular",
        features: [
            "Up to 200 members",
            "In-app payments (Card, Bank Transfer, USSD)",
            "Offline mode for uninterrupted meetings",
            "Meeting minute mode with instant broadcasts",
            "Automated payment reminders & SMS/Email",
            "Admin transparency mode toggle",
            "Defaulter tracking with penalties",
        ]
    },
    {
        id: "PREMIUM",
        name: "Premium",
        price: "₦144,000",
        numericPrice: 144000,
        period: "/month",
        memberLimit: "Unlimited members",
        maxMembers: 999999,
        description: "Full-scale solution featuring online meetings, AI minutes taking and summarization, and unlimited membership.",
        badge: "Enterprise & Diaspora",
        features: [
            "Unlimited members",
            "Integrated Online Meetings (Video & Audio)",
            "AI Minutes taking & automated meeting summaries",
            "Multi-branch chapter management",
            "Dedicated community account manager",
            "Full financial audit trails & exportable reports",
            "Priority 24/7 technical support",
        ]
    }
]

export default function BillingPage() {
    const { currentTier, setTier, getActiveOrgRole } = useAuthStore()
    const role = getActiveOrgRole()
    const isAdmin = role === 'OWNER' || role === 'ADMIN'

    const [activePlanId, setActivePlanId] = useState<SubscriptionTier>(currentTier || "BASIC")
    const [isUpdating, setIsUpdating] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const currentPlan = PLANS.find(p => p.id === activePlanId) || PLANS[1]
    const currentMemberCount = 14 // Current sample active count

    const handleSwitchPlan = (planId: SubscriptionTier) => {
        if (!isAdmin) {
            alert("Only organization Admins or Owners can change subscription tiers.")
            return
        }

        setIsUpdating(true)
        setTimeout(() => {
            setActivePlanId(planId)
            setTier(planId)
            setIsUpdating(false)
            setSuccessMessage(`Successfully switched to the ${planId} plan!`)
            setTimeout(() => setSuccessMessage(null), 4000)
        }, 800)
    }

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 pt-0 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription Plans</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your organization's subscription plan, member capacity, and feature entitlements.
                </p>
            </div>

            {successMessage && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {successMessage}
                </div>
            )}

            {/* Current Plan Overview Card */}
            <Card className="border-2 border-primary/20 shadow-sm bg-gradient-to-r from-card to-primary/5">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Current Active Plan</span>
                            <CardTitle className="text-2xl mt-1 flex items-center gap-3">
                                {currentPlan.name}
                                <Badge className="bg-secondary text-secondary-foreground text-xs">
                                    {currentPlan.price} {currentPlan.period}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {currentPlan.description}
                            </CardDescription>
                        </div>

                        <div className="text-right sm:border-l sm:pl-6 border-border">
                            <span className="text-xs text-muted-foreground">Member Capacity</span>
                            <div className="text-2xl font-extrabold text-foreground">
                                {currentMemberCount} / {currentPlan.maxMembers > 1000 ? "∞" : currentPlan.maxMembers}
                            </div>
                            <span className="text-xs text-green-600 font-medium">Within tier limits</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Capacity progress bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Capacity utilized</span>
                            <span>{Math.round((currentMemberCount / (currentPlan.maxMembers > 1000 ? 500 : currentPlan.maxMembers)) * 100)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(100, (currentMemberCount / (currentPlan.maxMembers > 1000 ? 500 : currentPlan.maxMembers)) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* All 4 Plans Grid */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold">Select a Subscription Tier</h2>
                    <p className="text-sm text-muted-foreground">
                        Transparent monthly pricing tailored for associations, unions, and communities across Nigeria and the Diaspora.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.id === activePlanId

                        return (
                            <Card
                                key={plan.id}
                                className={`flex flex-col justify-between relative transition-all duration-200 ${
                                    isCurrent
                                        ? "border-2 border-primary shadow-lg bg-card"
                                        : plan.highlight
                                        ? "border-2 border-secondary shadow-md bg-card/80"
                                        : "border border-border hover:border-primary/30"
                                }`}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                                            Current Plan
                                        </span>
                                    </div>
                                )}
                                {!isCurrent && plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-secondary text-secondary-foreground text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <CardHeader className="pt-6">
                                    <div className="flex justify-between items-center mb-1">
                                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    </div>
                                    <div className="flex items-baseline gap-1 my-2">
                                        <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                                        <span className="text-xs text-muted-foreground">{plan.period}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 w-fit px-2.5 py-0.5 rounded-full">
                                        <Users className="h-3 w-3" />
                                        {plan.memberLimit}
                                    </div>
                                    <CardDescription className="text-xs mt-2 line-clamp-2">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-2 border-t pt-4">
                                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Features</span>
                                    <ul className="space-y-2 pt-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                                                <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="pt-4 border-t">
                                    <Button
                                        onClick={() => handleSwitchPlan(plan.id)}
                                        disabled={isCurrent || isUpdating || !isAdmin}
                                        className={`w-full text-xs font-semibold ${
                                            isCurrent
                                                ? "bg-muted text-muted-foreground cursor-default hover:bg-muted"
                                                : plan.highlight
                                                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                                        }`}
                                    >
                                        {isCurrent ? "Active Plan" : `Switch to ${plan.name}`}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Invoicing / Payment Method Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Billing Details & Invoicing
                    </CardTitle>
                    <CardDescription>
                        All plans are billed in Nigerian Naira (NGN) via secure bank transfer, debit card, or USSD.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Billing Cycle</span>
                        <span className="font-medium">Monthly (Renews 1st of each month)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Supported Payment Gateways</span>
                        <span className="font-medium">Paystack / Flutterwave / Direct Bank Transfer</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Invoice Email Recipient</span>
                        <span className="font-medium">Executive Secretary / Treasurer</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
