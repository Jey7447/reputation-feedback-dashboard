CREATE OR REPLACE FUNCTION public.register_customer(
    p_full_name TEXT,
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
    customer_id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ,
    was_existing BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    normalized_name TEXT := NULLIF(BTRIM(p_full_name), '');
    normalized_email TEXT := NULLIF(LOWER(BTRIM(p_email)), '');
    normalized_phone TEXT := NULLIF(BTRIM(p_phone), '');
    existing_customer RECORD;
    new_customer RECORD;
BEGIN
    IF normalized_name IS NULL THEN
        RAISE EXCEPTION 'Customer name is required.';
    END IF;

    IF normalized_email IS NULL AND normalized_phone IS NULL THEN
        RAISE EXCEPTION 'A customer email address or phone number is required.';
    END IF;

    SELECT c.id, c.full_name, c.email, c.phone, c.created_at
    INTO existing_customer
    FROM public.customers c
    WHERE (
        normalized_email IS NOT NULL
        AND LOWER(BTRIM(c.email)) = normalized_email
    )
    OR (
        normalized_phone IS NOT NULL
        AND BTRIM(c.phone) = normalized_phone
    )
    ORDER BY c.created_at ASC
    LIMIT 1;

    IF FOUND THEN
        RETURN QUERY
        SELECT existing_customer.id, existing_customer.full_name, existing_customer.email,
               existing_customer.phone, existing_customer.created_at, TRUE;
        RETURN;
    END IF;

    INSERT INTO public.customers (full_name, email, phone)
    VALUES (normalized_name, normalized_email, normalized_phone)
    RETURNING id, public.customers.full_name, public.customers.email,
              public.customers.phone, public.customers.created_at
    INTO new_customer;

    RETURN QUERY
    SELECT new_customer.id, new_customer.full_name, new_customer.email,
           new_customer.phone, new_customer.created_at, FALSE;
END;
$function$;

REVOKE ALL ON FUNCTION public.register_customer(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_customer(TEXT, TEXT, TEXT) TO authenticated;
