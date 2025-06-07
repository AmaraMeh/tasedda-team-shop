-- Création de la table team_join_requests
CREATE TABLE IF NOT EXISTS team_join_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    invited_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Création d'un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_team_join_requests_user_id ON team_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_status ON team_join_requests(status);

-- Création d'une politique RLS pour la sécurité
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres demandes
CREATE POLICY "Users can view their own requests"
    ON team_join_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres demandes
CREATE POLICY "Users can create their own requests"
    ON team_join_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux admins de tout voir et modifier
CREATE POLICY "Admins can do everything"
    ON team_join_requests
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    ); 