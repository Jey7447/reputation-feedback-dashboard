DROP FUNCTION IF EXISTS public.create_visit(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.create_visit(
    p_customer_id UUID,
    p_location_id UUID
)
RETURNS TABLE (
    visit_id UUID,
    customer_id UUID,
    location_id UUID,
    job_reference TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    generated_job_reference TEXT;
    next_job_number INTEGER;
    new_visit RECORD;
BEGIN
    IF p_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer is required.';
    END IF;

    IF p_location_id IS NULL THEN
        RAISE EXCEPTION 'Location is required.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.customers c WHERE c.id = p_customer_id
    ) THEN
        RAISE EXCEPTION 'Customer not found.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.locations l
        WHERE l.id = p_location_id
          AND l.is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'Location not found or inactive.';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(1441001);

    SELECT COALESCE(
        MAX((substring(v.job_reference FROM '^JOB-([0-9]+)$'))::INTEGER),
        1000
    ) + 1
    INTO next_job_number
    FROM public.visits v
    WHERE v.job_reference ~ '^JOB-[0-9]+$';

    generated_job_reference := 'JOB-' || next_job_number::TEXT;

    INSERT INTO public.visits (
        customer_id,
        location_id,
        job_reference
    )
    VALUES (
        p_customer_id,
        p_location_id,
        generated_job_reference
    )
    RETURNING
        id,
        public.visits.customer_id,
        public.visits.location_id,
        public.visits.job_reference,
        public.visits.completed_at,
        public.visits.created_at
    INTO new_visit;

    RETURN QUERY
    SELECT
        new_visit.id,
        new_visit.customer_id,
        new_visit.location_id,
        new_visit.job_reference,
        new_visit.completed_at,
        new_visit.created_at;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_visit(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_visit(UUID, UUID) TO authenticated;
