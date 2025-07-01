-- Disable RLS temporarily to allow all operations
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to view their orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to update their orders" ON orders;
DROP POLICY IF EXISTS "Allow public to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow public to view orders by order number" ON orders;

-- Create simple policies that allow all operations
CREATE POLICY "Allow all operations on orders"
ON orders
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true); 