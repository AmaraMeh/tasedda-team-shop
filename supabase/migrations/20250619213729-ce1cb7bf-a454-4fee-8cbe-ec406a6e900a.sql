
-- Fix sellers slug generation by updating the function to handle duplicates better
CREATE OR REPLACE FUNCTION generate_seller_slug(business_name TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert business name to slug (lowercase, replace spaces with dashes)
    base_slug := lower(regexp_replace(business_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    
    -- Add user_id suffix to make it more unique
    base_slug := base_slug || '-' || substring(user_id::text from 1 for 8);
    
    final_slug := base_slug;
    
    -- Check if slug exists and increment counter if needed
    WHILE EXISTS (SELECT 1 FROM sellers WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;

-- Update sellers table to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_seller_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_seller_slug(NEW.business_name, NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto slug generation
DROP TRIGGER IF EXISTS trigger_auto_generate_seller_slug ON sellers;
CREATE TRIGGER trigger_auto_generate_seller_slug
    BEFORE INSERT ON sellers
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_seller_slug();

-- Fix RLS policies for orders table
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Users can insert their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Fix RLS policies for order_items table  
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

CREATE POLICY "Users can insert their own order items"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own order items"
ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Add default invitation code for team
INSERT INTO invitation_codes (code, type, created_by, is_used)
VALUES ('LION213', 'team', NULL, false)
ON CONFLICT (code) DO NOTHING;

-- Update promo code generation to ensure LION prefix
UPDATE team_members 
SET promo_code = 'LION' || lpad(floor(random() * 1000)::text, 3, '0')
WHERE promo_code NOT LIKE 'LION%';

-- Fix products table RLS policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Sellers can manage their own products" ON products;

CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Sellers can insert their own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sellers
    WHERE sellers.id = products.seller_id
    AND sellers.user_id = auth.uid()
    AND sellers.is_active = true
  )
);

CREATE POLICY "Sellers can update their own products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sellers
    WHERE sellers.id = products.seller_id
    AND sellers.user_id = auth.uid()
  )
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
