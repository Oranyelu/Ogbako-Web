import { Quote } from "lucide-react"

export function LandingTestimonial() {
    return (
        <section className="py-24 bg-primary text-white relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 h-4 w-4 rounded-full bg-white" />
                <div className="absolute top-20 right-40 h-2 w-2 rounded-full bg-secondary" />
                <div className="absolute bottom-40 left-1/4 h-3 w-3 rounded-full bg-accent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent"></div>
            </div>

            <div className="container px-4 md:px-6 mx-auto max-w-4xl relative z-10 text-center">
                <div className="flex justify-center mb-8">
                    <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Quote className="h-8 w-8 text-secondary" />
                    </div>
                </div>

                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium leading-normal mb-10">
                    "Ogbako transformed how our association handles yearly dues and member communication. Transparency has never been easier."
                </blockquote>

                <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 rounded-full bg-gray-200 border-4 border-white/20 mb-2 overflow-hidden">
                        {/* Avatar Placeholder */}
                        <div className="h-full w-full bg-gradient-to-tr from-gray-400 to-gray-200" />
                    </div>
                    <cite className="not-italic font-bold text-xl">Chidi Okeke</cite>
                    <span className="text-white/70">Treasurer, Lagos Tech Collective</span>
                </div>
            </div>
        </section>
    )
}
