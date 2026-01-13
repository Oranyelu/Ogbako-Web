import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle } from "lucide-react"

export function LandingHero() {
    return (
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
            {/* Background shape */}
            <div className="absolute inset-0 -z-10 bg-background">
                <div className="absolute top-0 right-0 w-[80%] h-full bg-primary/5 rounded-bl-[100px] -z-10" />
            </div>

            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary w-fit">
                                <span className="flex h-2 w-2 rounded-full bg-secondary mr-2" />
                                New: Financial Reports 2.0
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none text-primary">
                                The all-in-one platform for your community's growth.
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                                Gather, organize, and thrive with Ogbako’s comprehensive management suite.
                                Handle dues, member directories, and events in one place.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register">
                                <Button size="lg" className="h-12 px-8 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto shadow-md">
                                    Start Your Ogbako
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="#how-it-works">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5 w-full sm:w-auto">
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    See How It Works
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 pt-4 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                500+ Communities
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                                $2M+ Dues Tracked
                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                        <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grainy-texture.png')] opacity-10 mix-blend-overlay" />

                            {/* Abstract decorative elements simulating the illustration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]">
                                <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
                                <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
                            </div>

                            {/* Floating UI Elements Simulation */}
                            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center gap-6">
                                {/* Card 1: Member Directory */}
                                <div className="w-[280px] bg-card/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/10 transform -rotate-6 translate-x-[-20px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/20" />
                                        <div className="space-y-1">
                                            <div className="h-2 w-20 bg-primary/20 rounded" />
                                            <div className="h-1.5 w-12 bg-muted-foreground/20 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-muted/20 rounded" />
                                        <div className="h-1.5 w-3/4 bg-muted/20 rounded" />
                                    </div>
                                </div>

                                {/* Card 2: Chart */}
                                <div className="w-[280px] bg-card/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/10 transform rotate-3 translate-x-[20px]">
                                    <div className="flex justify-between items-end h-24 gap-2">
                                        <div className="w-full bg-primary/10 rounded-t-sm h-[40%]" />
                                        <div className="w-full bg-primary/20 rounded-t-sm h-[60%]" />
                                        <div className="w-full bg-primary/40 rounded-t-sm h-[30%]" />
                                        <div className="w-full bg-secondary rounded-t-sm h-[80%]" />
                                    </div>
                                    <div className="mt-2 text-center text-xs font-medium text-muted-foreground">Monthly Growth</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
