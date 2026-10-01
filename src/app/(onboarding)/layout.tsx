import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import Link from "next/link";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <OnboardingHeader />
            <main className="flex flex-1 items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-muted/20">
                <div className="w-full max-w-3xl">{children}</div>
            </main>
            <footer className="border-t border-border/40 py-4 px-6 text-center text-xs text-muted-foreground bg-background">
                <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© 2026 Ogbako Platform. Multi-Tenant Community Infrastructure.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <Link href="/dashboard/settings" className="hover:text-primary transition-colors">Settings</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
