import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingCTA() {
    return (
        <section className="py-24 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-center shadow-xl relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary rounded-full opacity-20 blur-3xl"></div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto">
                            Are you ready to organize your community and unlock its potential?
                        </h2>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-8 text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto shadow-lg">
                                    Create Your Organization Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
