-- ==============================================================================
-- OGBAKO PLATFORM: COMPLETE SUPABASE DATABASE SCHEMA & POLICIES
-- ==============================================================================

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    join_code TEXT,
    tier TEXT NOT NULL DEFAULT 'BASIC',
    transparency_mode BOOLEAN NOT NULL DEFAULT false,
    category TEXT DEFAULT 'Town Union',
    description TEXT,
    meeting_frequency TEXT DEFAULT 'Monthly',
    currency TEXT DEFAULT 'NGN',
    rules JSONB DEFAULT '{"minAge": 18, "requiredGender": "ALL", "requiredNationality": "Nigerian"}'::jsonb,
    is_verified_identity BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Organization Members Table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'SECRETARY', 'TREASURER', 'MEMBER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- 3. Dues & Levies Table
CREATE TABLE IF NOT EXISTS public.dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    penalty_type TEXT DEFAULT 'NONE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Transactions & Ledger Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    due_id UUID REFERENCES public.dues(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFLOW' CHECK (type IN ('INFLOW', 'OUTFLOW')),
    category TEXT DEFAULT 'Dues Payment',
    payment_method TEXT DEFAULT 'CARD',
    reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Verification / Access Codes Table
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ
);

-- ==============================================================================
-- AUTOMATIC TRIGGER: Add Organization Creator as OWNER Member
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NOT NULL THEN
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (NEW.id, NEW.created_by, 'OWNER')
        ON CONFLICT (organization_id, user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organization();

-- ==============================================================================
-- RPC FUNCTION: Redeem Invite / Access Code
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.redeem_invite_code(_code TEXT)
RETURNS JSONB AS $$
DECLARE
    _org_id UUID;
    _role TEXT;
    _user_id UUID := auth.uid();
BEGIN
    IF _user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'You must be logged in.');
    END IF;

    SELECT organization_id, role
    INTO _org_id, _role
    FROM public.verification_codes
    WHERE code = UPPER(_code)
      AND (used_at IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1;

    IF _org_id IS NULL THEN
        -- Check if it matches an organization's master join_code
        SELECT id, 'MEMBER'
        INTO _org_id, _role
        FROM public.organizations
        WHERE join_code = UPPER(_code)
        LIMIT 1;
    END IF;

    IF _org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired access code.');
    END IF;

    -- Add member
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (_org_id, _user_id, COALESCE(_role, 'MEMBER'))
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- Mark specific verification code used if applicable
    UPDATE public.verification_codes
    SET used_at = now()
    WHERE code = UPPER(_code);

    RETURN jsonb_build_object(
        'success', true,
        'organization_id', _org_id,
        'message', 'Successfully joined organization!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
CREATE POLICY "Users can view organizations they belong to or open ones"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid()))
        OR created_by = (SELECT auth.uid())
    );

CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admins and Owners can update their organization"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (SELECT auth.uid()) AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Organization Members Policies
CREATE POLICY "Members can view other members in their organization"
    ON public.organization_members FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())
        )
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "Admins can manage organization members"
    ON public.organization_members FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (SELECT auth.uid()) AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Dues Policies
CREATE POLICY "Members can view dues in their organization"
    ON public.dues FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Admins can insert and update dues"
    ON public.dues FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (SELECT auth.uid()) AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Transactions Policies
CREATE POLICY "Transactions view access according to transparency mode"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (
        -- User can always see their own transactions
        created_by = (SELECT auth.uid())
        -- Or if admin
        OR organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (SELECT auth.uid()) AND role IN ('OWNER', 'ADMIN')
        )
        -- Or if organization has transparency_mode enabled
        OR organization_id IN (
            SELECT o.id FROM public.organizations o
            INNER JOIN public.organization_members m ON m.organization_id = o.id
            WHERE m.user_id = (SELECT auth.uid()) AND o.transparency_mode = true
        )
    );

CREATE POLICY "Members can record transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())
        )
    );

-- Notifications Policies
CREATE POLICY "Members can view notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())
        )
    );

-- Verification Codes Policies
CREATE POLICY "Admins can view and manage verification codes"
    ON public.verification_codes FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (SELECT auth.uid()) AND role IN ('OWNER', 'ADMIN')
        )
    );
