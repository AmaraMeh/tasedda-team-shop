-- Fonction pour générer un code promo unique (3 lettres + 3 chiffres)
CREATE OR REPLACE FUNCTION generate_promo_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  letters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  code text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    -- Générer 3 lettres aléatoires
    code := '';
    FOR i IN 1..3 LOOP
      code := code || substr(letters, floor(random() * 26 + 1)::integer, 1);
    END LOOP;
    
    -- Ajouter 3 chiffres aléatoires
    code := code || lpad(floor(random() * 1000)::text, 3, '0');
    
    -- Vérifier si le code existe déjà
    SELECT NOT EXISTS (
      SELECT 1 FROM team_members WHERE promo_code = code
    ) INTO is_unique;
  END LOOP;
  
  RETURN code;
END;
$$; 