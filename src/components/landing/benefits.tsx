import Link from "next/link"
import { CheckCircle2, FileText, Lock, Gauge, MessagesSquare, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
    { icon: Wallet, text: "Automated Dues Collection", color: "text-primary" },
    { icon: Lock, text: "Role-Based Access Control", color: "text-accent" },
    { icon: Gauge, text: "Real-time Financial Dashboards", color: "text-secondary hover:text-orange-500" }, // Adjusted for visibility
    { icon: Lock, text: "Secure Data & Auth (Supabase)", color: "text-primary" },
    { icon: MessagesSquare, text: "Community Engagement Feed", color: "text-accent" },
]

export function LandingBenefits() {
    return (
        <section id="features" className="py-24 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                            Modern Technology for Seamless Gatherings.
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            We've built Ogbako on a modern stack to ensure speed, security, and scalability.
                            Say goodbye to spreadsheets and manual tracking errors.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                View Documentation
                            </Button>
                            <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                                Contact Sales
                            </Button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="space-y-6">
                            {benefits.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={`p-2 rounded-full bg-background border border-border shadow-sm`}>
                                        <item.icon className={`h-5 w-5 ${item.color.replace('hover:text-orange-500', '')} text-orange-600`} />
                                    </div>
                                    <span className="text-lg font-medium text-foreground">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Small visual decoration */}
                        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>99.9% Uptime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span>Exportable Reports</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
