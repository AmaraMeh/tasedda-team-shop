
-- Ajouter une colonne wilaya à la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wilaya text;

-- Ajouter une colonne seller_type à la table sellers
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS seller_type text DEFAULT 'normal' CHECK (seller_type IN ('normal', 'wholesale'));

-- Créer une table pour les codes d'invitation
CREATE TABLE IF NOT EXISTS public.invitation_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('team', 'seller')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Créer une table pour les messages de chat admin
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour invitation_codes
CREATE POLICY "Admins can do everything on invitation_codes"
    ON public.invitation_codes
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Team members can view invitation codes"
    ON public.invitation_codes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.user_id = auth.uid()
            AND team_members.is_active = true
        )
    );

-- Politiques RLS pour messages
CREATE POLICY "Admins can do everything on messages"
    ON public.messages
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Mettre à jour la fonction generate_promo_code pour générer LION + 3 chiffres
CREATE OR REPLACE FUNCTION public.generate_promo_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    -- Générer LION suivi de 3 chiffres aléatoires
    code := 'LION' || lpad(floor(random() * 1000)::text, 3, '0');
    
    -- Vérifier si le code existe déjà
    SELECT NOT EXISTS (
      SELECT 1 FROM team_members WHERE promo_code = code
    ) INTO is_unique;
  END LOOP;
  
  RETURN code;
END;
$$;
