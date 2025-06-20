
-- Créer des politiques RLS pour order_items
-- Permettre l'insertion d'order_items pour les commandes (même pour les invités)
CREATE POLICY "Allow insert order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true);

-- Permettre la lecture des order_items aux propriétaires de commandes et aux admins
CREATE POLICY "Allow read order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Permettre la mise à jour pour les admins seulement
CREATE POLICY "Allow update order items for admins"
  ON public.order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Permettre la suppression pour les admins seulement
CREATE POLICY "Allow delete order items for admins"
  ON public.order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
