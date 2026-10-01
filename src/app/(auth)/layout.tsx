import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <LandingHeader />
            <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
                <div className="w-full max-w-md">{children}</div>
            </main>
            <LandingFooter />
        </div>
    );
}
