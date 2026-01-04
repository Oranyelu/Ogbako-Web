'use client';

import { useAuthStore } from "@/store/use-auth-store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Activity, Plus, Building2, LogIn } from "lucide-react";
import { CreateOrgForm } from "@/components/onboarding/create-org-form";
import { JoinOrgForm } from "@/components/onboarding/join-org-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
    const { user, activeOrgId, organizations, setActiveOrg } = useAuthStore();
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const userName = user?.user_metadata?.full_name || user?.email || 'User';

    // 1. Unified Onboarding/Creation View
    // Shown if: User has NO organizations OR User explicitly clicked "Add New"
    if (organizations.length === 0 || isCreatingNew) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 space-y-8 relative">
                {/* Back Button (Only if user actually has orgs to go back to) */}
                {organizations.length > 0 && (
                    <Button
                        variant="ghost"
                        className="absolute top-4 left-4"
                        onClick={() => setIsCreatingNew(false)}
                    >
                        Back to Selection
                    </Button>
                )}

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">
                        {organizations.length === 0 ? `Welcome to Ogbako, ${userName}!` : 'Expand Your Network'}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-lg">
                        {organizations.length === 0
                            ? "You don't belong to any organizations yet. Create or join one to get started."
                            : "Create a new organization or join an existing one using an invite code."}
                    </p>
                </div>

                <div className="w-full max-w-md">
                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="create">Create New</TabsTrigger>
                            <TabsTrigger value="join">Join Existing</TabsTrigger>
                        </TabsList>
                        <TabsContent value="create">
                            <div className="mt-4">
                                <CreateOrgForm />
                            </div>
                        </TabsContent>
                        <TabsContent value="join">
                            <div className="mt-4">
                                <JoinOrgForm />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        );
    }

    // 2. Selection State: User has organizations but NONE selected
    if (!activeOrgId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 space-y-6 relative">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Select an Organization</h1>
                    <p className="text-muted-foreground">
                        Choose which organization you want to view.
                    </p>
                </div>

                <div className="grid gap-4 w-full max-w-2xl grid-cols-1 md:grid-cols-2">
                    {organizations.map((org) => (
                        <Card
                            key={org.id}
                            className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                            onClick={() => setActiveOrg(org.id)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="font-semibold text-lg">{org.name}</CardTitle>
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">Role: {org.role}</p>
                                <Button variant="secondary" className="w-full">Open Dashboard</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Floating Action Button for Adding New Org */}
                <div className="fixed bottom-8 right-8">
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
                        onClick={() => setIsCreatingNew(true)}
                    >
                        <Plus className="h-8 w-8" />
                    </Button>
                </div>
            </div>
        );
    }

    // 3. Active Dashboard State
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Welcome Back
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userName}</div>
                        <p className="text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Members
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-muted-foreground">
                            +4% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Dues Collected
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Chart component placeholder */}
                        <div className="h-[200px] w-full bg-muted/20 flex items-center justify-center rounded-md">
                            Chart Integration Coming Soon
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <div className="text-sm text-muted-foreground">You have 2 new notifications</div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full mr-4">
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">OM</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground">
                                        Joined Ogbako Association
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">Just now</div>
                            </div>
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full mr-4">
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">JL</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                    <p className="text-sm text-muted-foreground">
                                        Paid Monthly Dues
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">2 min ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
