
-- Permettre user_id nullable dans la table orders pour les commandes sans compte
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter une contrainte pour s'assurer qu'on a soit un user_id soit des informations dans shipping_address
ALTER TABLE public.orders ADD CONSTRAINT orders_user_or_guest_check 
CHECK (
  user_id IS NOT NULL OR 
  (shipping_address IS NOT NULL AND shipping_address->>'full_name' IS NOT NULL)
);
