
-- Replace overly permissive notifications insert policy with a more restrictive one
DROP POLICY "System can insert notifications" ON public.notifications;

-- Only allow inserts through security definer functions (no direct client inserts)
-- We'll create a helper function for creating notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID, _type TEXT, _title TEXT, _body TEXT, _trip_id UUID DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, trip_id)
  VALUES (_user_id, _type, _title, _body, _trip_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
