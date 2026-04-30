-- 1. Patch any existing duplicate job_ids or sell_ids by appending a random suffix
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT id, job_id FROM public.repair_jobs
    WHERE job_id IN (SELECT job_id FROM public.repair_jobs GROUP BY job_id HAVING COUNT(*) > 1)
    AND ctid NOT IN (
      SELECT MIN(ctid) FROM public.repair_jobs GROUP BY job_id HAVING COUNT(*) > 1
    )
  ) LOOP
    UPDATE public.repair_jobs SET job_id = r.job_id || '-' || UPPER(SUBSTR(md5(random()::text), 1, 4)) WHERE id = r.id;
  END LOOP;

  FOR r IN (
    SELECT id, sell_id FROM public.sells
    WHERE sell_id IN (SELECT sell_id FROM public.sells GROUP BY sell_id HAVING COUNT(*) > 1)
    AND ctid NOT IN (
      SELECT MIN(ctid) FROM public.sells GROUP BY sell_id HAVING COUNT(*) > 1
    )
  ) LOOP
    UPDATE public.sells SET sell_id = r.sell_id || '-' || UPPER(SUBSTR(md5(random()::text), 1, 4)) WHERE id = r.id;
  END LOOP;
END $$;

-- 2. Add global unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS repair_jobs_job_id_unique ON public.repair_jobs(job_id);
CREATE UNIQUE INDEX IF NOT EXISTS sells_sell_id_unique ON public.sells(sell_id);

-- 3. Helper: build a 3-char crypto-safe random suffix (no confusing 0/O/1/I)
CREATE OR REPLACE FUNCTION public._tracking_suffix()
RETURNS text
LANGUAGE plpgsql
AS $$
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
$$;

-- 4. Helper: extract a 3-letter uppercase code from a name, fallback GEN
CREATE OR REPLACE FUNCTION public._tracking_code(_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE clean text;
BEGIN
  clean := UPPER(REGEXP_REPLACE(COALESCE(_text, ''), '[^A-Za-z]', '', 'g'));
  IF LENGTH(clean) = 0 THEN RETURN 'GEN'; END IF;
  IF LENGTH(clean) >= 3 THEN RETURN SUBSTR(clean, 1, 3); END IF;
  RETURN RPAD(clean, 3, 'X');
END;
$$;

-- 5. Replace next_job_id with new format: J-<BRAND3>-<SEQ4>-<RAND3>
DROP FUNCTION IF EXISTS public.next_job_id(uuid);
DROP FUNCTION IF EXISTS public.next_job_id(uuid, text);

CREATE OR REPLACE FUNCTION public.next_job_id(_user_id uuid, _brand text DEFAULT 'GEN')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    _candidate := 'J-' || _code || '-' || LPAD(_counter::TEXT, 4, '0') || '-' || public._tracking_suffix();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.repair_jobs WHERE job_id = _candidate);
    _attempts := _attempts + 1;
    IF _attempts > 10 THEN
      _candidate := 'J-' || _code || '-' || LPAD(_counter::TEXT, 4, '0') || '-' || public._tracking_suffix() || public._tracking_suffix();
      EXIT;
    END IF;
  END LOOP;

  RETURN _candidate;
END;
$$;

-- 6. Replace next_sell_id with new format: S-<ITEM3>-<SEQ4>-<RAND3>
DROP FUNCTION IF EXISTS public.next_sell_id(uuid);
DROP FUNCTION IF EXISTS public.next_sell_id(uuid, text);

CREATE OR REPLACE FUNCTION public.next_sell_id(_user_id uuid, _item_name text DEFAULT 'GEN')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    _candidate := 'S-' || _code || '-' || LPAD(_counter::TEXT, 4, '0') || '-' || public._tracking_suffix();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.sells WHERE sell_id = _candidate);
    _attempts := _attempts + 1;
    IF _attempts > 10 THEN
      _candidate := 'S-' || _code || '-' || LPAD(_counter::TEXT, 4, '0') || '-' || public._tracking_suffix() || public._tracking_suffix();
      EXIT;
    END IF;
  END LOOP;

  RETURN _candidate;
END;
$$;