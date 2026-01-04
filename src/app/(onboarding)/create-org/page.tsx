import { Metadata } from 'next';
import { CreateOrgForm } from '@/components/onboarding/create-org-form';

export const metadata: Metadata = {
    title: 'Create Organization - Ogbako',
    description: 'Setup your organization.',
};

export default function CreateOrgPage() {
    return (
        <div className="w-full">
            <CreateOrgForm />
        </div>
    );
}
