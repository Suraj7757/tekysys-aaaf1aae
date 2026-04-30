-- Award/deduct loyalty points when a payment is inserted
CREATE OR REPLACE FUNCTION public._loyalty_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _settings record;
  _customer_id uuid;
  _points int;
  _is_refund boolean;
BEGIN
  SELECT * INTO _settings FROM public.loyalty_settings WHERE user_id = NEW.user_id;
  IF _settings IS NULL OR _settings.enabled = false THEN
    RETURN NEW;
  END IF;

  -- Find customer via repair_job
  IF NEW.repair_job_id IS NOT NULL THEN
    SELECT customer_id INTO _customer_id FROM public.repair_jobs WHERE id = NEW.repair_job_id;
  END IF;
  IF _customer_id IS NULL THEN RETURN NEW; END IF;

  _is_refund := (NEW.method::text = 'Refunded') OR (NEW.amount < 0);
  _points := FLOOR(ABS(NEW.amount) * _settings.points_per_rupee);
  IF _points <= 0 THEN RETURN NEW; END IF;

  IF _is_refund THEN
    UPDATE public.customers SET points = GREATEST(0, points - _points) WHERE id = _customer_id;
    INSERT INTO public.loyalty_transactions (user_id, customer_id, type, points, reference_type, reference_id, note)
    VALUES (NEW.user_id, _customer_id, 'adjust', -_points, 'payment', NEW.id::text, 'Refund deduction');
  ELSE
    UPDATE public.customers SET points = COALESCE(points, 0) + _points WHERE id = _customer_id;
    INSERT INTO public.loyalty_transactions (user_id, customer_id, type, points, reference_type, reference_id, note)
    VALUES (NEW.user_id, _customer_id, 'earn', _points, 'payment', NEW.id::text, 'Earned on payment ₹' || NEW.amount);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_loyalty_on_payment ON public.payments;
CREATE TRIGGER trg_loyalty_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public._loyalty_on_payment();

-- Redeem points RPC
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(_customer_id uuid, _points int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _customer record;
  _settings record;
  _value numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT * INTO _customer FROM public.customers WHERE id = _customer_id AND user_id = auth.uid();
  IF _customer IS NULL THEN RAISE EXCEPTION 'Customer not found'; END IF;

  SELECT * INTO _settings FROM public.loyalty_settings WHERE user_id = auth.uid();
  IF _settings IS NULL OR _settings.enabled = false THEN
    RAISE EXCEPTION 'Loyalty disabled';
  END IF;

  IF _points < _settings.min_redeem_points THEN
    RAISE EXCEPTION 'Minimum % points required to redeem', _settings.min_redeem_points;
  END IF;
  IF _points > COALESCE(_customer.points, 0) THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  _value := _points * _settings.rupee_per_point;

  UPDATE public.customers SET points = points - _points WHERE id = _customer_id;
  INSERT INTO public.loyalty_transactions (user_id, customer_id, type, points, reference_type, note)
  VALUES (auth.uid(), _customer_id, 'redeem', -_points, 'manual', 'Redeemed for ₹' || _value);

  RETURN jsonb_build_object('points_redeemed', _points, 'rupee_value', _value, 'remaining', COALESCE(_customer.points,0) - _points);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.redeem_loyalty_points(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_points(uuid, int) TO authenticated;

-- Convert booking to job RPC
CREATE OR REPLACE FUNCTION public.convert_booking_to_job(_booking_id uuid, _technician_name text DEFAULT NULL, _estimated_cost numeric DEFAULT 0)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _booking record;
  _job_id text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT * INTO _booking FROM public.booking_requests WHERE id = _booking_id AND user_id = auth.uid();
  IF _booking IS NULL THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF _booking.status = 'converted' THEN RAISE EXCEPTION 'Already converted'; END IF;

  _job_id := public.create_repair_job(
    auth.uid(),
    _booking.customer_name,
    _booking.customer_mobile,
    _booking.device_brand,
    _booking.device_model,
    _booking.problem_description,
    _technician_name,
    _estimated_cost,
    NULL,
    '{}'::jsonb
  );

  UPDATE public.booking_requests
    SET status = 'converted', converted_job_id = _job_id, updated_at = now()
    WHERE id = _booking_id;

  RETURN _job_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.convert_booking_to_job(uuid, text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_booking_to_job(uuid, text, numeric) TO authenticated;
