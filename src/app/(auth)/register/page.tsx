import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
    title: 'Register - Ogbako',
    description: 'Create a new account on Ogbako.',
};

export default function RegisterPage() {
    return (
        <div className="flex h-full w-full items-center justify-center px-4">
            <RegisterForm />
        </div>
    );
}
