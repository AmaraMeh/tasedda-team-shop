-- Création de la table shops
CREATE TABLE IF NOT EXISTS shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    is_active BOOLEAN DEFAULT false,
    subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
    trial_end_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Création d'un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_subscription_status ON shops(subscription_status);

-- Création d'une politique RLS pour la sécurité
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir toutes les boutiques actives
CREATE POLICY "Anyone can view active shops"
    ON shops FOR SELECT
    USING (is_active = true);

-- Politique pour permettre aux utilisateurs de voir et modifier leur propre boutique
CREATE POLICY "Users can manage their own shop"
    ON shops
    USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de tout voir et modifier
CREATE POLICY "Admins can do everything"
    ON shops
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_shop_slug(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convertir le nom en slug (minuscules, remplacer les espaces par des tirets)
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    
    final_slug := base_slug;
    
    -- Vérifier si le slug existe déjà
    WHILE EXISTS (SELECT 1 FROM shops WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$; 