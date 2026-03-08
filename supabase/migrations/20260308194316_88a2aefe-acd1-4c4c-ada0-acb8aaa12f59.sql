-- Revoke public execute on create_notification to prevent notification injection
-- Triggers use SECURITY DEFINER context and bypass this restriction
REVOKE EXECUTE ON FUNCTION public.create_notification FROM authenticated, anon;