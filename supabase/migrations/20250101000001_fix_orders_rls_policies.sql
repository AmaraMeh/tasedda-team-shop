-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create new policies that allow both authenticated and guest orders
CREATE POLICY "Allow authenticated users to insert orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user_id matches authenticated user OR if it's a guest order (user_id is null)
  (user_id = auth.uid()) OR (user_id IS NULL)
);

CREATE POLICY "Allow authenticated users to view their orders"
ON orders
FOR SELECT
TO authenticated
USING (
  -- Allow if user_id matches authenticated user OR if it's a guest order (user_id is null)
  (user_id = auth.uid()) OR (user_id IS NULL)
);

CREATE POLICY "Allow authenticated users to update their orders"
ON orders
FOR UPDATE
TO authenticated
USING (
  -- Allow if user_id matches authenticated user OR if it's a guest order (user_id is null)
  (user_id = auth.uid()) OR (user_id IS NULL)
);

-- Allow public to insert orders (for guest checkout)
CREATE POLICY "Allow public to insert orders"
ON orders
FOR INSERT
TO anon
WITH CHECK (
  -- Allow guest orders (user_id is null) with valid shipping address
  user_id IS NULL AND 
  shipping_address IS NOT NULL AND 
  shipping_address->>'full_name' IS NOT NULL
);

-- Allow public to view orders (for order tracking)
CREATE POLICY "Allow public to view orders by order number"
ON orders
FOR SELECT
TO anon
USING (
  -- Allow viewing orders by order_number (for order tracking)
  order_number IS NOT NULL
);

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY; 