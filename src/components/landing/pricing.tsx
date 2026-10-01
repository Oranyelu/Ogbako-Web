'use client';

import Link from "next/link";
import { Check, Zap, Sparkles, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PRICING_TIERS = [
    {
        id: "free",
        name: "Free Test Tier",
        price: "₦0",
        period: "/month",
        description: "Great for testing out Ogbako with your core executive council.",
        memberLimit: "Up to 10 members",
        highlight: false,
        badge: "Evaluation",
        features: [
            "Up to 10 members",
            "Manual financial tracking",
            "Basic member directory",
            "Dashboard overview",
            "Community announcement board",
        ],
        cta: "Start Free",
        href: "/register",
    },
    {
        id: "basic",
        name: "Basic",
        price: "₦20,000",
        period: "/month",
        description: "Perfect for growing town unions and modest community chapters.",
        memberLimit: "Up to 50 members",
        highlight: false,
        badge: "Growing Groups",
        features: [
            "Up to 50 members",
            "Complete financial & dues tracking",
            "Meeting minutes taking studio",
            "Member roles & directory management",
            "Late dues penalty calculator",
            "Transaction history ledger",
        ],
        cta: "Choose Basic",
        href: "/register",
    },
    {
        id: "pro",
        name: "Pro",
        price: "₦50,000",
        period: "/month",
        description: "The complete suite for active associations needing dues payments and notifications.",
        memberLimit: "Up to 200 members",
        highlight: true,
        badge: "Most Popular",
        features: [
            "Up to 200 members",
            "In-app payments (Card, Bank Transfer, USSD)",
            "Offline mode for local meetings",
            "Meeting minutes mode with instant broadcasts",
            "Push & SMS/Email reminders",
            "Defaulter tracking & automatic reminders",
            "Admin transparency mode toggle",
        ],
        cta: "Get Started with Pro",
        href: "/register",
    },
    {
        id: "premium",
        name: "Premium",
        price: "₦144,000",
        period: "/month",
        description: "For large diaspora associations and national unions needing enterprise tools.",
        memberLimit: "Unlimited members",
        highlight: false,
        badge: "Enterprise & Diaspora",
        features: [
            "Unlimited members",
            "Integrated online meetings (Video & Audio)",
            "AI minutes taking & automatic meeting summaries",
            "24/7 Priority technical support",
            "Further customization of app (Custom branding & rules)",
            "Identity & Name Protection (Protects from others copying your name and identity)",
            "Multi-branch / chapter management",
            "Full financial audit trails & exportable reports",
        ],
        cta: "Unlock Premium",
        href: "/register",
    },
];

export function LandingPricing() {
    return (
        <section id="pricing" className="py-24 bg-muted/20 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5">
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-secondary" />
                        Transparent Pricing for Every Community
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
                        Simple, predictable plans that grow with your people.
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl">
                        Start free for testing, or empower your members with in-app dues payments, automated minutes, and AI-powered summaries.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRICING_TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                                tier.highlight
                                    ? "bg-card border-2 border-secondary shadow-2xl scale-105 z-10"
                                    : "bg-card/70 backdrop-blur border border-border hover:border-primary/40 shadow-sm hover:shadow-md"
                            }`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider shadow">
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                                    {!tier.highlight && (
                                        <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted">
                                            {tier.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                                        {tier.price}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-4 bg-primary/10 w-fit px-2.5 py-1 rounded-full">
                                    <Users className="h-3.5 w-3.5" />
                                    {tier.memberLimit}
                                </div>

                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    {tier.description}
                                </p>

                                <div className="space-y-3 mb-8 border-t pt-6">
                                    {tier.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-sm">
                                            <div className="rounded-full bg-primary/10 p-0.5 mt-0.5 shrink-0 text-primary">
                                                <Check className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-foreground/90">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link href={tier.href} className="w-full">
                                <Button
                                    className={`w-full h-11 text-sm font-semibold rounded-xl transition-all ${
                                        tier.highlight
                                            ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    }`}
                                >
                                    {tier.cta}
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Transparency Mode Spotlight in Pricing */}
                <div className="mt-16 bg-card border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/10 text-secondary rounded-2xl shrink-0">
                            <Shield className="h-8 w-8" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-primary">
                                Built-in Transparency Mode
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Trust is everything in community unions. Admins can toggle Transparency Mode on or off anytime to share meeting financials with all members or keep individual balances confidential.
                            </p>
                        </div>
                    </div>
                    <Link href="/register" className="shrink-0 w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto border-primary/30 hover:bg-primary/5">
                            Learn More
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
