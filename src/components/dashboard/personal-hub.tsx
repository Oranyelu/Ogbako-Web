'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, calculateAge, checkEligibility, Organization } from '@/store/use-auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Globe,
    Shield,
    Building2,
    Users,
    KeyRound,
    Plus,
    CheckCircle2,
    AlertCircle,
    Check,
    Loader2,
    ArrowRight,
    Camera
} from 'lucide-react';
import Link from 'next/link';

export function PersonalHub() {
    const router = useRouter();
    const { user, userProfile, setUserProfile, availableGroups, joinOrganization, organizations, setActiveOrg } = useAuthStore();

    // Profile state
    const [fullName, setFullName] = useState(userProfile?.fullName || user?.user_metadata?.full_name || 'Member');
    const [email, setEmail] = useState(userProfile?.email || user?.email || '');
    const [phone, setPhone] = useState(userProfile?.phone || user?.user_metadata?.phone || '');
    const [dob, setDob] = useState(userProfile?.dateOfBirth || user?.user_metadata?.date_of_birth || '');
    const [gender, setGender] = useState<string>(userProfile?.gender || 'MALE');
    const [nationality, setNationality] = useState(userProfile?.nationality || 'Nigerian');
    const [stateOfOrigin, setStateOfOrigin] = useState(userProfile?.stateOfOrigin || 'Anambra');
    const [address, setAddress] = useState(userProfile?.address || '');
    const [profilePicture, setProfilePicture] = useState(userProfile?.profilePicture || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [occupation, setOccupation] = useState(userProfile?.occupation || '');

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Join code state
    const [inviteCode, setInviteCode] = useState('');
    const [codeError, setCodeError] = useState<string | null>(null);
    const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);

    // Filter search for available groups
    const [searchQuery, setSearchQuery] = useState('');

    const currentAge = dob ? calculateAge(dob) : null;

    // Calculate profile completeness
    const completenessFields = [fullName, email, phone, dob, gender, nationality, stateOfOrigin, address];
    const filledCount = completenessFields.filter(f => !!f && f !== '').length;
    const completenessPercentage = Math.round((filledCount / completenessFields.length) * 100);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);

        setUserProfile({
            fullName,
            email,
            phone,
            dateOfBirth: dob,
            gender: gender as any,
            nationality,
            stateOfOrigin,
            address,
            profilePicture,
            bio,
            occupation,
        });

        setTimeout(() => {
            setIsSavingProfile(false);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }, 500);
    };

    const handleRedeemCode = (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError(null);
        setCodeSuccess(null);
        if (!inviteCode || inviteCode.trim().length < 4) {
            setCodeError('Please enter a valid access code.');
            return;
        }

        setIsRedeeming(true);
        const result = joinOrganization('', inviteCode.trim().toUpperCase());
        setIsRedeeming(false);

        if (result.success) {
            setCodeSuccess(result.message);
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1200);
        } else {
            setCodeError(result.message);
        }
    };

    const handleJoinGroup = (org: Organization) => {
        const result = joinOrganization(org.id);
        if (result.success) {
            router.push('/dashboard');
            router.refresh();
        } else {
            alert(result.message);
        }
    };

    const filteredGroups = availableGroups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 max-w-6xl mx-auto w-full">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {fullName.split(' ')[0]}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Your personal member profile and community onboarding workspace.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={completenessPercentage >= 80 ? "default" : "secondary"} className="py-1 px-3">
                        Profile: {completenessPercentage}% Complete
                    </Badge>
                    <Button variant="default" size="sm" asChild className="gap-1.5 shadow-sm">
                        <Link href="/create-org">
                            <Plus className="h-4 w-4" />
                            <span>Create New Group</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <Card className="shadow-sm border-border/80">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Personal Member Profile
                            </CardTitle>
                            <CardDescription>
                                Community groups use these details to verify eligibility (age, nationality, origin, and gender).
                            </CardDescription>
                        </div>
                        {savedSuccess && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Profile Saved
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        {/* Profile Picture & Basic Info */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-lg bg-muted/30 border">
                            <div className="relative group">
                                <Avatar className="h-20 w-20 border-2 border-primary/20">
                                    <AvatarImage src={profilePicture} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                        {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'OG'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-1.5 text-center sm:text-left flex-1">
                                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                                    <h3 className="font-bold text-lg">{fullName || 'Your Name'}</h3>
                                    {currentAge !== null && (
                                        <Badge variant="outline" className="text-xs bg-background">
                                            {currentAge} years old
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                        {nationality}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{email} • {phone || 'No phone set'}</p>
                                <div className="pt-1">
                                    <Input
                                        placeholder="Paste photo avatar URL (optional)"
                                        value={profilePicture}
                                        onChange={(e) => setProfilePicture(e.target.value)}
                                        className="text-xs h-8 max-w-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Detail Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 803 123 4567" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Date of Birth</label>
                                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                        <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Nationality</label>
                                <Select value={nationality} onValueChange={setNationality}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Nationality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Nigerian">Nigerian</SelectItem>
                                        <SelectItem value="Ghanaian">Ghanaian</SelectItem>
                                        <SelectItem value="Kenyan">Kenyan</SelectItem>
                                        <SelectItem value="British">British</SelectItem>
                                        <SelectItem value="American">American</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">State of Origin</label>
                                <Input value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)} placeholder="e.g. Anambra" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Residential Address</label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 14 Awolowo Road, Ikoyi, Lagos" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Occupation / Profession</label>
                                <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Civil Engineer / Entrepreneur" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Bio / Background Note</label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="A brief note about your village, clan lineage, or community interests..."
                                className="h-16 resize-none text-xs"
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button type="submit" disabled={isSavingProfile} className="gap-2">
                                {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Personal Profile
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Three Clear Paths Section */}
            <div className="space-y-4">
                <div className="border-b pb-2">
                    <h2 className="text-xl font-bold">Community Group Hub</h2>
                    <p className="text-xs text-muted-foreground">Choose how you want to participate in Ogbako.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Path 1: Create Group */}
                    <Card className="hover:border-primary/60 transition-all flex flex-col justify-between shadow-sm">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Create a New Group</CardTitle>
                            <CardDescription>
                                Establish your town union, age grade, clan meeting, or diaspora association with custom rules.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                            <Button className="w-full gap-2" asChild>
                                <Link href="/create-org">
                                    <span>Setup Group</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Path 2: Join with Code */}
                    <Card className="hover:border-primary/60 transition-all flex flex-col justify-between shadow-sm">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Have an Invite Code?</CardTitle>
                            <CardDescription>
                                Enter the 6-character access code provided by your group's executive or secretary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <form onSubmit={handleRedeemCode} className="space-y-2">
                                <Input
                                    placeholder="e.g. UMU001"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    className="font-mono text-center uppercase tracking-widest font-bold"
                                />
                                {codeError && (
                                    <p className="text-[11px] text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        {codeError}
                                    </p>
                                )}
                                {codeSuccess && (
                                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                                        {codeSuccess}
                                    </p>
                                )}
                                <Button type="submit" variant="secondary" className="w-full mt-2" disabled={isRedeeming}>
                                    {isRedeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem & Join'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Path 3: Multi-tenant Switcher if user has groups */}
                    <Card className="hover:border-primary/60 transition-all flex flex-col justify-between shadow-sm">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
                                <Users className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">My Active Groups</CardTitle>
                            <CardDescription>
                                {organizations.length === 0
                                    ? "You have not joined any group workspaces yet."
                                    : `You are a member of ${organizations.length} group${organizations.length > 1 ? 's' : ''}.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {organizations.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">
                                    Browse the directory below or create your group to start managing finances and minutes.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {organizations.map((org) => (
                                        <div
                                            key={org.id}
                                            onClick={() => {
                                                setActiveOrg(org.id);
                                                router.push('/dashboard');
                                            }}
                                            className="p-2 border rounded-md hover:bg-muted cursor-pointer flex items-center justify-between text-xs"
                                        >
                                            <span className="font-semibold">{org.name}</span>
                                            <Badge variant="outline" className="text-[10px]">{org.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Explore Groups Directory with Eligibility Checking */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Browse Community Groups
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Groups enforce rules such as age brackets, nationality, and gender. Eligibility is dynamically verified from your profile.
                        </p>
                    </div>
                    <Input
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-xs text-xs h-9"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGroups.map((group) => {
                        const eligibility = checkEligibility(userProfile, group.rules);
                        const isMember = organizations.some(o => o.id === group.id);

                        return (
                            <Card key={group.id} className="border shadow-sm flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base font-bold">{group.name}</CardTitle>
                                                {group.isVerifiedIdentity && (
                                                    <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                                                        <Shield className="h-2.5 w-2.5" /> Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{group.category} • {group.memberCount || 1} members</p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {group.currency || 'NGN'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-foreground/80 mt-2 line-clamp-2">
                                        {group.description || 'Dedicated community organization for members.'}
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-2">
                                    {/* Rules preview */}
                                    <div className="text-[11px] bg-muted/40 p-2.5 rounded border space-y-1">
                                        <p className="font-semibold text-muted-foreground text-[10px] uppercase">Membership Requirements:</p>
                                        <div className="flex flex-wrap gap-2 text-foreground/80">
                                            {group.rules?.minAge && (
                                                <span className="bg-background px-1.5 py-0.5 rounded border">Age: {group.rules.minAge}+</span>
                                            )}
                                            {group.rules?.maxAge && (
                                                <span className="bg-background px-1.5 py-0.5 rounded border">Max: {group.rules.maxAge} yrs</span>
                                            )}
                                            {group.rules?.requiredGender && group.rules.requiredGender !== 'ALL' && (
                                                <span className="bg-background px-1.5 py-0.5 rounded border">{group.rules.requiredGender} Only</span>
                                            )}
                                            {group.rules?.requiredNationality && (
                                                <span className="bg-background px-1.5 py-0.5 rounded border">{group.rules.requiredNationality}</span>
                                            )}
                                            {group.rules?.requiredState && (
                                                <span className="bg-background px-1.5 py-0.5 rounded border">{group.rules.requiredState} indigenes</span>
                                            )}
                                        </div>

                                        {/* Dynamic Eligibility Feedback */}
                                        <div className="pt-1.5 border-t border-border/40">
                                            {eligibility.eligible ? (
                                                <p className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    You meet all membership criteria
                                                </p>
                                            ) : (
                                                <p className="text-amber-600 flex items-start gap-1 text-[11px]">
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                    <span>{eligibility.reasons.join(' ')}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-between items-center border-t py-3">
                                    <span className="text-[11px] text-muted-foreground">Code: <span className="font-mono font-semibold">{group.joinCode}</span></span>
                                    {isMember ? (
                                        <Button size="sm" variant="outline" onClick={() => {
                                            setActiveOrg(group.id);
                                            router.push('/dashboard');
                                        }}>
                                            Open Workspace
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            disabled={!eligibility.eligible}
                                            onClick={() => handleJoinGroup(group)}
                                        >
                                            Join Group
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
