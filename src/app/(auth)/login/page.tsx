import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - Ogbako',
    description: 'Login to your Ogbako account',
};

export default function LoginPage() {
    return (
        <div className="flex flex-col space-y-2 text-center">
            {/* Logo or Branding could go here */}
            <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    {/* Placeholder Logo Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                </div>
            </div>
            <LoginForm />
        </div>
    );
}
