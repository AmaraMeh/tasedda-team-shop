
-- Créer une table pour les tarifs de livraison par wilaya
CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya TEXT NOT NULL UNIQUE,
  home_delivery_price NUMERIC NOT NULL,
  office_delivery_price NUMERIC,
  return_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS pour la table shipping_rates
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de voir les tarifs
CREATE POLICY "Anyone can view shipping rates"
ON public.shipping_rates
FOR SELECT
USING (true);

-- Politique pour permettre aux admins de gérer les tarifs
CREATE POLICY "Admins can manage shipping rates"
ON public.shipping_rates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Insérer tous les tarifs de livraison
INSERT INTO public.shipping_rates (wilaya, home_delivery_price, office_delivery_price, return_price) VALUES
('ADRAR', 1400, 900, 300),
('CHLEF', 800, 450, 200),
('LAGHOUAT', 950, 550, 200),
('OUM EL BOUAGHI', 800, 450, 200),
('BATNA', 800, 450, 200),
('BEJAIA', 950, 450, 200),
('BISKRA', 950, 550, 200),
('BECHAR', 1100, 650, 300),
('BLIDA', 750, 400, 200),
('BOUIRA', 700, 450, 200),
('TAMANRASSET', 1600, 1050, 250),
('TEBESSA', 800, 450, 200),
('TLEMCEN', 900, 500, 200),
('TIARET', 800, 450, 200),
('TIZI OUZOU', 950, 450, 200),
('ALGER', 600, 400, 200),
('DJELFA', 950, 550, 200),
('JIJEL', 700, 450, 200),
('SETIF', 750, 450, 200),
('SAIDA', 800, 500, 200),
('SKIKDA', 750, 450, 200),
('SIDI BEL ABBESS', 750, 450, 200),
('ANNABA', 800, 450, 200),
('GUELMA', 800, 450, 200),
('CONSTANTINE', 750, 450, 200),
('MEDEA', 750, 450, 200),
('MOSTAGANEM', 750, 450, 200),
('M''SILA', 850, 500, 200),
('MASCARA', 750, 450, 200),
('OUARGLA', 1050, 600, 300),
('ORAN', 700, 450, 200),
('EL BAYADH', 1050, 600, 300),
('ILLIZI', 1400, NULL, NULL),
('BORDJ BOU ARRERIDJ', 750, 450, 200),
('BOUMERDES', 750, 450, 200),
('EL TARF', 850, 450, 200),
('TINDOUF', 1600, NULL, NULL),
('TISSEMSILT', 800, 500, 200),
('EL OUED', 1000, 600, 300),
('KHENCHELA', 800, NULL, 200),
('SOUK AHRAS', 800, 450, 200),
('TIPAZA', 750, 450, 200),
('MILA', 750, 450, 200),
('AIN DEFLA', 750, 450, 200),
('NAAMA', 1100, 600, 200),
('AIN TEMOUCHENT', 750, 450, 200),
('GHARDAIA', 1000, 650, 200),
('RELIZANE', 750, 450, 200),
('TIMIMOUN', 1400, NULL, NULL),
('BORDJ BADJI MOKHTAR', 1600, NULL, NULL),
('OULED DJELLAL', 950, 550, 200),
('BENI ABBES', 1000, 900, 200),
('IN SALAH', 1600, NULL, 250),
('IN GUEZZAM', 1600, NULL, 250),
('TOUGGOURT', 1000, 600, 200),
('DJANET', 1600, NULL, NULL),
('M''GHAIR', 1000, NULL, 200),
('EL MENIA', 1000, NULL, 200);

-- Ajouter une colonne shipping_cost aux commandes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;

-- Ajouter une colonne delivery_method aux commandes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'home_delivery';

-- Améliorer la table commissions pour supporter les types de commission
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sale';
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Créer une fonction pour calculer les commissions avec bonus d'affiliation
CREATE OR REPLACE FUNCTION public.process_team_commission(order_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    order_record RECORD;
    team_member_record RECORD;
    commission_rate NUMERIC;
    commission_amount NUMERIC;
    affiliate_count INTEGER;
    inviter_member_id UUID;
BEGIN
    -- Récupérer les informations de la commande
    SELECT * INTO order_record 
    FROM orders 
    WHERE id = order_id_param AND promo_code IS NOT NULL;
    
    IF order_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Trouver le membre de l'équipe avec ce code promo
    SELECT * INTO team_member_record 
    FROM team_members 
    WHERE promo_code = order_record.promo_code AND is_active = true;
    
    IF team_member_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculer le taux de commission selon le rang
    commission_rate := CASE 
        WHEN team_member_record.rank = 1 THEN 0.06
        WHEN team_member_record.rank = 2 THEN 0.08
        WHEN team_member_record.rank = 3 THEN 0.10
        WHEN team_member_record.rank = 4 THEN 0.12
        WHEN team_member_record.rank = 5 THEN 0.12
        ELSE 0.06
    END;
    
    commission_amount := order_record.total_amount * commission_rate;
    
    -- Créer la commission de vente
    INSERT INTO commissions (
        team_member_id, 
        order_id, 
        amount, 
        percentage, 
        status, 
        type,
        metadata
    ) VALUES (
        team_member_record.id,
        order_record.id,
        commission_amount,
        commission_rate,
        'pending',
        'sale',
        jsonb_build_object('order_number', order_record.order_number)
    );
    
    -- Vérifier si le membre qui a utilisé le code promo a un parrain
    IF team_member_record.invited_by IS NOT NULL THEN
        -- Compter les affiliés du parrain qui ont fait des achats validés
        SELECT COUNT(DISTINCT o.id) INTO affiliate_count
        FROM orders o
        JOIN team_members tm ON o.promo_code = tm.promo_code
        WHERE tm.invited_by = team_member_record.invited_by
        AND o.order_status = 'delivered';
        
        -- Si c'est le 3ème affilié, donner le bonus de 300 DA
        IF affiliate_count >= 3 THEN
            -- Vérifier si le bonus n'a pas déjà été donné
            IF NOT EXISTS (
                SELECT 1 FROM commissions 
                WHERE team_member_id = team_member_record.invited_by 
                AND type = 'affiliation_bonus'
                AND metadata->>'affiliated_member_id' = team_member_record.id::text
            ) THEN
                INSERT INTO commissions (
                    team_member_id,
                    amount,
                    status,
                    type,
                    metadata
                ) VALUES (
                    team_member_record.invited_by,
                    300,
                    'pending',
                    'affiliation_bonus',
                    jsonb_build_object(
                        'affiliated_member_id', team_member_record.id,
                        'affiliate_count', affiliate_count
                    )
                );
            END IF;
        END IF;
    END IF;
    
    -- Mettre à jour les statistiques du membre
    UPDATE team_members 
    SET 
        total_sales = total_sales + 1,
        total_commissions = total_commissions + commission_amount,
        updated_at = now()
    WHERE id = team_member_record.id;
END;
$$;
