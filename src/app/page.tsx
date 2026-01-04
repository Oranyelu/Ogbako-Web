import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, Users, Wallet } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="rounded-full bg-primary/10 p-1 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl">Ogbako</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
            About
          </Link>
        </nav>
        <div className="ml-4">
          <Link href="/login">
            <Button size="sm">Log In</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50 dark:bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Manage your Organization with <span className="text-primary">Ogbako</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  The all-in-one platform for membership management, financial tracking, and community engagement.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="h-11 px-8">Get Started</Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="h-11 px-8">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-950/50">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Member Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Easily manage your member directory, track roles, and handle statuses with our powerful data tables.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-950/50">
                <CardHeader>
                  <Wallet className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Financial Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track dues, record transactions, and generate financial reports to keep your organization transparent.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-950/50">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Analytics & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visualize your growth and financial health with interactive charts and real-time dashboards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to upgrade your organization?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Join hundreds of communities using Ogbako to streamline their operations.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="h-11 px-8 gap-2">
                    Create Account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2024 Ogbako Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
