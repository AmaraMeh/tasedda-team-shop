
-- Insérer un code d'invitation pour commencer avec la première équipe
INSERT INTO public.invitation_codes (code, type, created_by)
VALUES ('TEAM2025', 'team', NULL)
ON CONFLICT (code) DO NOTHING;

-- Mettre à jour la fonction generate_promo_code pour s'assurer qu'elle génère bien LION + 3 chiffres
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
