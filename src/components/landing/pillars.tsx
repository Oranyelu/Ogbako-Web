import { Users, Wallet, BarChart3 } from "lucide-react"

const features = [
    {
        name: "Member Management",
        description: "Powerful directories, role tracking, and easy status updates. Keep your community organized and connected.",
        icon: Users,
        color: "bg-accent", // Terracotta
        iconColor: "text-accent",
    },
    {
        name: "Financial Engine",
        description: "Track dues, record transactions, and generate transparent reports. Simplify your treasury management.",
        icon: Wallet,
        color: "bg-secondary", // Marigold
        iconColor: "text-secondary-foreground",
    },
    {
        name: "Analytics & Insights",
        description: "Real-time visualizaton for growth and financial health. make data-driven decisions for your organization.",
        icon: BarChart3,
        color: "bg-primary", // Deep Teal
        iconColor: "text-primary-foreground",
    },
]

export function LandingPillars() {
    return (
        <section id="features" className="py-24 bg-background relative z-10">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        Everything you need to manage your gathering effectively.
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Ogbako provides the essential tools to help your organization thrive, from member data to financial transparency.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`h-2 w-full ${feature.color}`} />
                            <div className="p-6 md:p-8 space-y-4">
                                <div className={`p-3 w-fit rounded-xl ${feature.color} bg-opacity-10 mb-4`}>
                                    <feature.icon className={`h-6 w-6 ${feature.name === "Financial Engine" ? "text-yellow-700" : feature.name === "Member Management" ? "text-orange-700" : "text-teal-900"}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{feature.name}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Abstract illustration placeholder */}
                                <div className="mt-8 h-32 rounded-lg bg-muted/50 w-full flex items-center justify-center overflow-hidden relative">
                                    {/* We can replace this with actual SVG illustrations later */}
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-200 via-gray-100 to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
