import Link from "next/link"
import { ArrowRight, Building2, User } from "lucide-react"

export function LandingMultiTenancy() {
    return (
        <section id="solutions" className="py-24 w-full">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                <div className="rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[500px]">
                    {/* Left Side (Deep Teal) */}
                    <div className="lg:w-1/2 bg-primary p-12 lg:p-20 relative overflow-hidden flex items-center justify-center">
                        {/* Abstract Connection Lines */}
                        <div className="absolute inset-0 opacity-10">
                            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100" stroke="white" strokeWidth="2" fill="none" />
                                <path d="M0 0 C 50 100 80 100 100 0" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        {/* Illustration: User Switching Contexts */}
                        <div className="relative z-10 w-full max-w-md">
                            <div className="flex justify-center mb-8">
                                <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <User className="h-12 w-12 text-white" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center gap-4">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 w-40 flex flex-col items-center gap-3 transform translate-y-4">
                                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                                        <span className="font-bold text-primary-foreground">LTC</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">Lagos Tech</span>
                                </div>

                                <div className="h-px bg-white/30 flex-1 relative">
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-white rounded-full"></div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 w-40 flex flex-col items-center gap-3 transform -translate-y-4">
                                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center">
                                        <span className="font-bold text-white">OYF</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">Ohana Youth</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side (Terracotta Orange) */}
                    <div className="lg:w-1/2 bg-accent p-12 lg:p-20 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="h-6 w-6 text-white/80" />
                            <span className="text-white/80 font-medium tracking-wide uppercase text-sm">Structure</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Built for Multi-Tenancy
                        </h2>

                        <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
                            One user, endless communities. Create, join, and switch between multiple organizations seamlessly from one secure dashboard. No more multiple logins.
                        </p>

                        <Link href="/register" className="inline-flex items-center text-white font-bold hover:underline underline-offset-4 group">
                            Start Your Organization
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
