
-- Fonction pour générer un code promo unique (LION + 3 chiffres)
CREATE OR REPLACE FUNCTION generate_promo_code()
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
