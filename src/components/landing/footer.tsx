import Link from "next/link"
import { Users, Twitter, Facebook, Instagram, Linkedin } from "lucide-react"

export function LandingFooter() {
    return (
        <footer className="bg-[#082822] text-white py-16 border-t border-white/10">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <Link className="flex items-center gap-2" href="#">
                            <div className="rounded-full bg-white/10 p-1.5 text-white">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Ogbako</span>
                        </Link>
                        <p className="text-gray-400 max-w-xs leading-relaxed">
                            The all-in-one platform for membership management, financial tracking, and community engagement.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <Facebook className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="#" className="hover:text-secondary transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Security</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="#" className="hover:text-secondary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg">Legal</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="#" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-secondary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Ogbako Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
                        <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
