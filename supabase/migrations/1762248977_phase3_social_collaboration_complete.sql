-- Migration: phase3_social_collaboration_complete
-- Created at: 1762248977

-- Phase 3: Social Collaboration Features Migration
-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT true,
    allow_followers BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles"
    ON public.user_profiles FOR SELECT
    USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- User Follows
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their follows"
    ON public.user_follows FOR SELECT
    USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can create follows"
    ON public.user_follows FOR INSERT
    WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their follows"
    ON public.user_follows FOR DELETE
    USING (follower_id = auth.uid());

-- Goal Shares
CREATE TABLE IF NOT EXISTS public.goal_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('viewer', 'collaborator', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(goal_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS idx_goal_shares_goal ON public.goal_shares(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_shares_user ON public.goal_shares(shared_with_user_id);

ALTER TABLE public.goal_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares for their goals"
    ON public.goal_shares FOR SELECT
    USING (owner_id = auth.uid() OR shared_with_user_id = auth.uid());

CREATE POLICY "Goal owners can create shares"
    ON public.goal_shares FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Goal owners can update shares"
    ON public.goal_shares FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Goal owners can delete shares"
    ON public.goal_shares FOR DELETE
    USING (owner_id = auth.uid());

-- Team Goals
CREATE TABLE IF NOT EXISTS public.team_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    icon TEXT,
    color TEXT DEFAULT '#8B5CF6',
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    deadline TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team goals"
    ON public.team_goals FOR SELECT
    USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_goal_id = team_goals.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team creators can create goals"
    ON public.team_goals FOR INSERT
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Team admins can update goals"
    ON public.team_goals FOR UPDATE
    USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_goal_id = team_goals.id
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Team creators can delete goals"
    ON public.team_goals FOR DELETE
    USING (creator_id = auth.uid());

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_goal_id UUID NOT NULL REFERENCES public.team_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'collaborator', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_goal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_goal_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view members"
    ON public.team_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_goal_id = team_members.team_goal_id
            AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Team admins can add members"
    ON public.team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_goals
            WHERE id = team_goal_id
            AND creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_goal_id = team_members.team_goal_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Team admins can update members"
    ON public.team_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_goal_id = team_members.team_goal_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Team admins can remove members"
    ON public.team_members FOR DELETE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_goal_id = team_members.team_goal_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'owner')
        )
    );

-- Comments (Enhanced for Phase 3)
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    team_goal_id UUID REFERENCES public.team_goals(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (goal_id IS NOT NULL AND task_id IS NULL AND team_goal_id IS NULL) OR
        (goal_id IS NULL AND task_id IS NOT NULL AND team_goal_id IS NULL) OR
        (goal_id IS NULL AND task_id IS NULL AND team_goal_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_social_comments_goal ON public.social_comments(goal_id) WHERE goal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_comments_task ON public.social_comments(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_comments_team_goal ON public.social_comments(team_goal_id) WHERE team_goal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_comments_parent ON public.social_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_comments_user ON public.social_comments(user_id);

ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their goals/tasks"
    ON public.social_comments FOR SELECT
    USING (
        user_id = auth.uid() OR
        (goal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.goals WHERE id = goal_id AND user_id = auth.uid()
        )) OR
        (goal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.goal_shares WHERE goal_id = social_comments.goal_id AND shared_with_user_id = auth.uid()
        )) OR
        (task_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
        )) OR
        (team_goal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.team_members WHERE team_goal_id = social_comments.team_goal_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can create comments"
    ON public.social_comments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
    ON public.social_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
    ON public.social_comments FOR DELETE
    USING (user_id = auth.uid());

-- Comment Reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.social_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'support', 'helpful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON public.comment_reactions(user_id);

ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
    ON public.comment_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.social_comments
            WHERE id = comment_reactions.comment_id
        )
    );

CREATE POLICY "Users can create reactions"
    ON public.comment_reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
    ON public.comment_reactions FOR DELETE
    USING (user_id = auth.uid());

-- Activity Feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (
        activity_type IN (
            'goal_completed', 'task_completed', 'milestone_reached',
            'streak_achieved', 'goal_shared', 'team_joined',
            'comment_added', 'achievement_unlocked'
        )
    ),
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    team_goal_id UUID REFERENCES public.team_goals(id) ON DELETE CASCADE,
    metadata JSONB,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON public.activity_feed(is_public) WHERE is_public = true;

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public activity"
    ON public.activity_feed FOR SELECT
    USING (
        is_public = true OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = activity_feed.user_id
            AND follower_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own activity"
    ON public.activity_feed FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activity"
    ON public.activity_feed FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own activity"
    ON public.activity_feed FOR DELETE
    USING (user_id = auth.uid());

-- Add visibility field to goals table
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'followers'));

CREATE INDEX IF NOT EXISTS idx_goals_visibility ON public.goals(visibility);

-- Update goals RLS to include shared goals
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view accessible goals"
    ON public.goals FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.goal_shares
            WHERE goal_id = goals.id
            AND shared_with_user_id = auth.uid()
        ) OR
        (visibility = 'public') OR
        (visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = goals.user_id
            AND follower_id = auth.uid()
        ))
    );

-- Database Functions
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        SPLIT_PART(NEW.email, '@', 1)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();;