-- RPC for efficient revenue aggregation (avoids fetching all total_amount rows)
CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_amount), 0)::NUMERIC FROM orders;
$$;

-- Grant execute to authenticated users (admin dashboard)
GRANT EXECUTE ON FUNCTION public.get_total_revenue() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_revenue() TO service_role;
