import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 mx-auto">
                <Link className="flex items-center gap-2" href="/">
                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-primary">Ogbako</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
                    <Link className="hover:text-primary transition-colors" href="#features">
                        Features
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="#solutions">
                        Multi-Tenancy
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="#pricing">
                        Pricing
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="#how-it-works">
                        How It Works
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" className="font-medium px-4 text-foreground/80 hover:text-primary">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-5 shadow-sm">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
