-- 1) Tracking IDs without dashes
CREATE OR REPLACE FUNCTION public.next_job_id(_user_id uuid, _brand text DEFAULT 'GEN'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _counter INTEGER;
  _code text;
  _candidate text;
  _attempts int := 0;
BEGIN
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.job_counter SET counter = counter + 1 WHERE user_id = _user_id RETURNING counter INTO _counter;
  IF _counter IS NULL THEN
    INSERT INTO public.job_counter (user_id, counter) VALUES (_user_id, 1) RETURNING counter INTO _counter;
  END IF;

  _code := public._tracking_code(_brand);

  LOOP
    _candidate := 'J' || _code || LPAD(_counter::TEXT, 4, '0') || public._tracking_suffix();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.repair_jobs WHERE job_id = _candidate);
    _attempts := _attempts + 1;
    IF _attempts > 10 THEN
      _candidate := 'J' || _code || LPAD(_counter::TEXT, 4, '0') || public._tracking_suffix() || public._tracking_suffix();
      EXIT;
    END IF;
  END LOOP;

  RETURN _candidate;
END;
$function$;

CREATE OR REPLACE FUNCTION public.next_sell_id(_user_id uuid, _item_name text DEFAULT 'GEN'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _counter INTEGER;
  _code text;
  _candidate text;
  _attempts int := 0;
BEGIN
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.sell_counter SET counter = counter + 1 WHERE user_id = _user_id RETURNING counter INTO _counter;
  IF _counter IS NULL THEN
    INSERT INTO public.sell_counter (user_id, counter) VALUES (_user_id, 1) RETURNING counter INTO _counter;
  END IF;

  _code := public._tracking_code(_item_name);

  LOOP
    _candidate := 'S' || _code || LPAD(_counter::TEXT, 4, '0') || public._tracking_suffix();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.sells WHERE sell_id = _candidate);
    _attempts := _attempts + 1;
    IF _attempts > 10 THEN
      _candidate := 'S' || _code || LPAD(_counter::TEXT, 4, '0') || public._tracking_suffix() || public._tracking_suffix();
      EXIT;
    END IF;
  END LOOP;

  RETURN _candidate;
END;
$function$;

-- 2) Fix Function Search Path Mutable on helper functions
CREATE OR REPLACE FUNCTION public._tracking_suffix()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..3 LOOP
    result := result || SUBSTR(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % length(alphabet)), 1);
  END LOOP;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public._tracking_code(_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE clean text;
BEGIN
  clean := UPPER(REGEXP_REPLACE(COALESCE(_text, ''), '[^A-Za-z]', '', 'g'));
  IF LENGTH(clean) = 0 THEN RETURN 'GEN'; END IF;
  IF LENGTH(clean) >= 3 THEN RETURN SUBSTR(clean, 1, 3); END IF;
  RETURN RPAD(clean, 3, 'X');
END;
$function$;

-- 3) Tighten EXECUTE permissions on SECURITY DEFINER / helper functions.
-- Revoke from anon (and PUBLIC) on functions that should only run for signed-in users or internal use.
REVOKE EXECUTE ON FUNCTION public._tracking_suffix() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public._tracking_code(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.next_job_id(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.next_sell_id(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_repair_job(uuid, text, text, text, text, text, text, numeric, text, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_not_banned() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.next_job_id(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_sell_id(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_repair_job(uuid, text, text, text, text, text, text, numeric, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- track_order is intentionally public (anonymous tracking page), keep it executable by anon.
GRANT EXECUTE ON FUNCTION public.track_order(text) TO anon, authenticated;
