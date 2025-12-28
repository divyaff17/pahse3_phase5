-- =====================================================
-- Phase 2: Database Schema for Logistics Engine
-- PopClozet - Inventory, Bundles, and Reservations
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- Required for exclusion constraints on uuid + date range

-- =====================================================
-- 1. INVENTORY_ITEMS TABLE
-- Physical items with barcodes, sizes, and conditions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(20),
    condition_grade VARCHAR(20) DEFAULT 'excellent' CHECK (condition_grade IN ('excellent', 'good', 'fair', 'needs_repair')),
    location VARCHAR(100), -- Warehouse location code
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    last_inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for inventory_items
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON public.inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_available ON public.inventory_items(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_inventory_items_size ON public.inventory_items(size);

-- =====================================================
-- 2. BUNDLES TABLE
-- Virtual product bundles (e.g., "Gala Set" = Dress + Clutch)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    image_url TEXT,
    discount_percent DECIMAL(5,2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    is_active BOOLEAN DEFAULT true,
    gender VARCHAR(20) DEFAULT 'unisex' CHECK (gender IN ('mens', 'womens', 'unisex')),
    event_category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bundles
CREATE INDEX IF NOT EXISTS idx_bundles_active ON public.bundles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON public.bundles(slug);

-- =====================================================
-- 3. BUNDLE_ITEMS TABLE
-- Junction table defining bundle composition
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    is_required BOOLEAN DEFAULT true, -- If false, item is optional
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bundle_id, product_id)
);

-- Indexes for bundle_items
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON public.bundle_items(product_id);

-- =====================================================
-- 4. RESERVATIONS TABLE
-- Booking records with date ranges and concurrency control
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL, -- If part of a bundle booking
    
    -- PostgreSQL tstzrange for date-based availability checking
    booking_period TSTZRANGE NOT NULL,
    
    -- Reservation status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'returned')),
    
    -- Pricing at time of booking
    rental_price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    
    -- Logistics
    delivery_address TEXT,
    delivery_notes TEXT,
    pickup_scheduled_at TIMESTAMPTZ,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ
);

-- =====================================================
-- CONCURRENCY CONTROL: Exclusion Constraint
-- Prevents double-booking at the database level
-- =====================================================

-- This constraint ensures that for any specific inventory_item_id,
-- no two rows can have overlapping booking_period values
-- The && operator checks for range overlap

ALTER TABLE public.reservations
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING GIST (
    inventory_item_id WITH =,
    booking_period WITH &&
)
WHERE (status NOT IN ('cancelled', 'returned'));

-- =====================================================
-- INDEXES for Reservations
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_inventory_item ON public.reservations(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_period ON public.reservations USING GIST (booking_period);
CREATE INDEX IF NOT EXISTS idx_reservations_active ON public.reservations(status) WHERE status IN ('pending', 'confirmed', 'active');

-- =====================================================
-- 5. MUTATION_QUEUE TABLE
-- For offline-first mutation tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mutation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL, -- 'create_reservation', 'cancel_reservation', etc.
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    client_id VARCHAR(100) -- For deduplication
);

-- Index for processing queue
CREATE INDEX IF NOT EXISTS idx_mutation_queue_pending ON public.mutation_queue(status, created_at) WHERE status = 'pending';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutation_queue ENABLE ROW LEVEL SECURITY;

-- Inventory Items: Public read, admin write
CREATE POLICY "Anyone can view inventory items"
    ON public.inventory_items FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage inventory"
    ON public.inventory_items FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Bundles: Public read, admin write
CREATE POLICY "Anyone can view active bundles"
    ON public.bundles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage bundles"
    ON public.bundles FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Bundle Items: Public read
CREATE POLICY "Anyone can view bundle items"
    ON public.bundle_items FOR SELECT
    USING (true);

-- Reservations: Users can see their own, admins see all
CREATE POLICY "Users can view their own reservations"
    ON public.reservations FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create reservations"
    ON public.reservations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending reservations"
    ON public.reservations FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Mutation Queue: Users can manage their own
CREATE POLICY "Users can manage their mutation queue"
    ON public.mutation_queue FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS for updated_at timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bundles_updated_at
    BEFORE UPDATE ON public.bundles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON public.inventory_items TO anon, authenticated;
GRANT SELECT ON public.bundles TO anon, authenticated;
GRANT SELECT ON public.bundle_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mutation_queue TO authenticated;

-- =====================================================
-- COMMENTS for documentation
-- =====================================================

COMMENT ON TABLE public.inventory_items IS 'Physical inventory items with individual tracking';
COMMENT ON TABLE public.bundles IS 'Virtual product bundles for package deals';
COMMENT ON TABLE public.bundle_items IS 'Products included in each bundle';
COMMENT ON TABLE public.reservations IS 'Customer bookings with date-range overlap prevention';
COMMENT ON TABLE public.mutation_queue IS 'Offline-first mutation queue for background sync';
COMMENT ON CONSTRAINT no_overlapping_bookings ON public.reservations IS 'Prevents double-booking the same inventory item';
