-- =====================================================
-- Bundle Availability Functions
-- Recursive CTE for checking if all bundle components are available
-- =====================================================

-- =====================================================
-- 1. Check if a single product has available inventory
-- for a given date range
-- =====================================================

CREATE OR REPLACE FUNCTION check_product_availability(
    p_product_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
) RETURNS TABLE (
    inventory_item_id UUID,
    size VARCHAR,
    condition_grade VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.id,
        ii.size,
        ii.condition_grade
    FROM public.inventory_items ii
    WHERE ii.product_id = p_product_id
      AND ii.is_available = true
      AND NOT EXISTS (
          SELECT 1 
          FROM public.reservations r
          WHERE r.inventory_item_id = ii.id
            AND r.status NOT IN ('cancelled', 'returned')
            AND r.booking_period && tstzrange(p_start_date, p_end_date, '[]')
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Check if a bundle is fully available
-- (all required components have at least one available item)
-- =====================================================

CREATE OR REPLACE FUNCTION check_bundle_availability(
    p_bundle_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
    v_missing_count INTEGER;
BEGIN
    -- Count how many required products are NOT available
    WITH required_products AS (
        -- Get all required products for this bundle
        SELECT 
            bi.product_id,
            bi.quantity
        FROM public.bundle_items bi
        WHERE bi.bundle_id = p_bundle_id
          AND bi.is_required = true
    ),
    available_counts AS (
        -- For each required product, count available inventory items
        SELECT 
            rp.product_id,
            rp.quantity AS required_qty,
            COALESCE(
                (
                    SELECT COUNT(*)
                    FROM check_product_availability(rp.product_id, p_start_date, p_end_date)
                ), 
                0
            ) AS available_qty
        FROM required_products rp
    )
    SELECT COUNT(*) INTO v_missing_count
    FROM available_counts
    WHERE available_qty < required_qty;

    -- Bundle is available only if NO required products are missing
    RETURN v_missing_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Get detailed bundle availability info
-- Returns which components are available and which are missing
-- =====================================================

CREATE OR REPLACE FUNCTION get_bundle_availability_details(
    p_bundle_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
) RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR,
    is_required BOOLEAN,
    required_quantity INTEGER,
    available_quantity BIGINT,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.product_id,
        p.name::VARCHAR AS product_name,
        bi.is_required,
        bi.quantity AS required_quantity,
        COALESCE(
            (
                SELECT COUNT(*)
                FROM check_product_availability(bi.product_id, p_start_date, p_end_date)
            ), 
            0
        ) AS available_quantity,
        COALESCE(
            (
                SELECT COUNT(*)
                FROM check_product_availability(bi.product_id, p_start_date, p_end_date)
            ), 
            0
        ) >= bi.quantity AS is_available
    FROM public.bundle_items bi
    JOIN public.products p ON p.id = bi.product_id
    WHERE bi.bundle_id = p_bundle_id
    ORDER BY bi.is_required DESC, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Reserve a bundle
-- Atomically reserves all items in a bundle
-- =====================================================

CREATE OR REPLACE FUNCTION reserve_bundle(
    p_bundle_id UUID,
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_delivery_address TEXT DEFAULT NULL,
    p_delivery_notes TEXT DEFAULT NULL
) RETURNS TABLE (
    success BOOLEAN,
    reservation_ids UUID[],
    error_message TEXT
) AS $$
DECLARE
    v_bundle RECORD;
    v_item RECORD;
    v_inventory_item_id UUID;
    v_reservation_id UUID;
    v_reservation_ids UUID[] := '{}';
    v_booking_period TSTZRANGE;
    v_total_price DECIMAL(10,2) := 0;
BEGIN
    -- Get bundle info
    SELECT * INTO v_bundle FROM public.bundles WHERE id = p_bundle_id AND is_active = true;
    
    IF v_bundle.id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID[], 'Bundle not found or inactive';
        RETURN;
    END IF;

    -- Check if bundle is available
    IF NOT check_bundle_availability(p_bundle_id, p_start_date, p_end_date) THEN
        RETURN QUERY SELECT false, NULL::UUID[], 'One or more bundle items are not available for the selected dates';
        RETURN;
    END IF;

    -- Create booking period
    v_booking_period := tstzrange(p_start_date, p_end_date, '[]');

    -- Reserve each required item
    FOR v_item IN 
        SELECT 
            bi.product_id,
            bi.quantity,
            p.rental_price
        FROM public.bundle_items bi
        JOIN public.products p ON p.id = bi.product_id
        WHERE bi.bundle_id = p_bundle_id
          AND bi.is_required = true
    LOOP
        -- Get first available inventory item for this product
        SELECT ii.id INTO v_inventory_item_id
        FROM check_product_availability(v_item.product_id, p_start_date, p_end_date) ii
        LIMIT 1;

        IF v_inventory_item_id IS NULL THEN
            -- Rollback would happen automatically due to transaction
            RAISE EXCEPTION 'No inventory available for product %', v_item.product_id;
        END IF;

        -- Create reservation
        INSERT INTO public.reservations (
            user_id,
            inventory_item_id,
            bundle_id,
            booking_period,
            status,
            rental_price,
            discount_applied,
            delivery_address,
            delivery_notes
        ) VALUES (
            p_user_id,
            v_inventory_item_id,
            p_bundle_id,
            v_booking_period,
            'pending',
            v_item.rental_price,
            v_item.rental_price * (v_bundle.discount_percent / 100),
            p_delivery_address,
            p_delivery_notes
        )
        RETURNING id INTO v_reservation_id;

        v_reservation_ids := array_append(v_reservation_ids, v_reservation_id);
        v_total_price := v_total_price + v_item.rental_price;
    END LOOP;

    RETURN QUERY SELECT true, v_reservation_ids, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, NULL::UUID[], SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Find available dates for a product
-- Returns available date ranges for next N days
-- =====================================================

CREATE OR REPLACE FUNCTION get_product_available_dates(
    p_product_id UUID,
    p_days_ahead INTEGER DEFAULT 30
) RETURNS TABLE (
    available_date DATE,
    available_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE,
            CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL,
            '1 day'::INTERVAL
        )::DATE AS check_date
    )
    SELECT 
        ds.check_date,
        (
            SELECT COUNT(*)
            FROM check_product_availability(
                p_product_id, 
                ds.check_date::TIMESTAMPTZ, 
                (ds.check_date + INTERVAL '1 day')::TIMESTAMPTZ
            )
        ) AS available_count
    FROM date_series ds
    ORDER BY ds.check_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT EXECUTE PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_product_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_bundle_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_bundle_availability_details TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reserve_bundle TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_available_dates TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION check_product_availability IS 'Returns available inventory items for a product in a date range';
COMMENT ON FUNCTION check_bundle_availability IS 'Returns true if all required bundle components are available';
COMMENT ON FUNCTION get_bundle_availability_details IS 'Returns detailed availability status for each bundle component';
COMMENT ON FUNCTION reserve_bundle IS 'Atomically reserves all items in a bundle for a user';
COMMENT ON FUNCTION get_product_available_dates IS 'Returns availability count for each date in the next N days';
