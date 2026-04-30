CREATE OR REPLACE FUNCTION public.create_repair_job(
  p_user_id uuid,
  p_customer_name text,
  p_customer_mobile text,
  p_device_brand text,
  p_device_model text,
  p_problem_description text,
  p_technician_name text,
  p_estimated_cost numeric,
  p_service_category text DEFAULT NULL,
  p_device_details jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _job_id text;
  _customer_id uuid;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Find or create customer
  SELECT id INTO _customer_id FROM public.customers
   WHERE user_id = p_user_id AND mobile = p_customer_mobile AND deleted = false
   LIMIT 1;

  IF _customer_id IS NULL THEN
    INSERT INTO public.customers (user_id, name, mobile)
    VALUES (p_user_id, p_customer_name, p_customer_mobile)
    RETURNING id INTO _customer_id;
  END IF;

  -- Generate tracking ID with brand code
  _job_id := public.next_job_id(p_user_id, p_device_brand);

  INSERT INTO public.repair_jobs (
    user_id, job_id, customer_id, customer_name, customer_mobile,
    device_brand, device_model, problem_description,
    technician_name, status, estimated_cost
  ) VALUES (
    p_user_id, _job_id, _customer_id, p_customer_name, p_customer_mobile,
    p_device_brand, COALESCE(p_device_model, ''), p_problem_description,
    p_technician_name, 'Received'::job_status, COALESCE(p_estimated_cost, 0)
  );

  RETURN _job_id;
END;
$$;