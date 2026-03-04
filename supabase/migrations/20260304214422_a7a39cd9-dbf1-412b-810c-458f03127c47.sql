
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Enums
CREATE TYPE public.app_role AS ENUM ('diver', 'dive_center_admin', 'dive_center_staff');
CREATE TYPE public.staff_role AS ENUM ('admin', 'staff');
CREATE TYPE public.certification_level AS ENUM ('open_water', 'advanced_open_water', 'rescue_diver', 'divemaster', 'instructor', 'none');
CREATE TYPE public.trip_status AS ENUM ('draft', 'published', 'completed', 'cancelled');
CREATE TYPE public.trip_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'rejected');

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own role once" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dive centers
CREATE TABLE public.dive_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, whatsapp_number TEXT, logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dive_centers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_dive_centers_updated_at BEFORE UPDATE ON public.dive_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Staff members
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dive_center_id UUID REFERENCES public.dive_centers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role staff_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dive_center_id, user_id)
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_dive_center_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT dive_center_id FROM public.staff_members WHERE user_id = _user_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.is_dive_center_admin(_user_id UUID, _center_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = _user_id AND dive_center_id = _center_id AND role = 'admin') $$;

CREATE OR REPLACE FUNCTION public.is_dive_center_staff(_user_id UUID, _center_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = _user_id AND dive_center_id = _center_id) $$;

CREATE POLICY "Dive centers are publicly viewable" ON public.dive_centers FOR SELECT USING (true);
CREATE POLICY "Staff can update their own dive center" ON public.dive_centers FOR UPDATE USING (public.is_dive_center_staff(auth.uid(), id));
CREATE POLICY "Authenticated users can create dive centers" ON public.dive_centers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can view their own center's staff" ON public.staff_members FOR SELECT USING (public.is_dive_center_staff(auth.uid(), dive_center_id));
CREATE POLICY "Admin can insert staff" ON public.staff_members FOR INSERT WITH CHECK (public.is_dive_center_admin(auth.uid(), dive_center_id) OR auth.uid() = user_id);
CREATE POLICY "Admin can delete staff" ON public.staff_members FOR DELETE USING (public.is_dive_center_admin(auth.uid(), dive_center_id));

-- Diver profiles
CREATE TABLE public.diver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL, avatar_url TEXT,
  certification certification_level DEFAULT 'none',
  logged_dives INT DEFAULT 0, emergency_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diver_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_diver_profiles_updated_at BEFORE UPDATE ON public.diver_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Diver profiles are publicly viewable" ON public.diver_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.diver_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.diver_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dive_center_id UUID REFERENCES public.dive_centers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT, departure_point TEXT NOT NULL, dive_site TEXT NOT NULL,
  trip_date DATE NOT NULL, trip_time TIME NOT NULL,
  total_spots INT NOT NULL CHECK (total_spots > 0), available_spots INT NOT NULL CHECK (available_spots >= 0),
  price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd >= 0),
  whatsapp_group_url TEXT, status trip_status NOT NULL DEFAULT 'draft',
  difficulty trip_difficulty, gear_rental_available BOOLEAN DEFAULT false,
  min_certification certification_level,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  diver_id UUID REFERENCES public.diver_profiles(id) ON DELETE CASCADE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending', notes TEXT, rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, diver_id)
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Functions that depend on bookings
CREATE OR REPLACE FUNCTION public.is_confirmed_diver(_user_id UUID, _trip_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.bookings WHERE diver_id = (SELECT id FROM public.diver_profiles WHERE user_id = _user_id) AND trip_id = _trip_id AND status = 'confirmed') $$;

CREATE OR REPLACE FUNCTION public.confirm_booking(_booking_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_trip_id UUID;
BEGIN
  SELECT trip_id INTO v_trip_id FROM public.bookings WHERE id = _booking_id AND status = 'pending';
  IF v_trip_id IS NULL THEN RETURN FALSE; END IF;
  UPDATE public.trips SET available_spots = available_spots - 1 WHERE id = v_trip_id AND available_spots > 0;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  UPDATE public.bookings SET status = 'confirmed', updated_at = now() WHERE id = _booking_id;
  RETURN TRUE;
END; $$;

-- Trip & booking policies
CREATE POLICY "Published trips are publicly viewable" ON public.trips FOR SELECT USING (status = 'published' OR public.is_dive_center_staff(auth.uid(), dive_center_id));
CREATE POLICY "Staff can create trips" ON public.trips FOR INSERT WITH CHECK (public.is_dive_center_staff(auth.uid(), dive_center_id));
CREATE POLICY "Staff can update their trips" ON public.trips FOR UPDATE USING (public.is_dive_center_staff(auth.uid(), dive_center_id));
CREATE POLICY "Staff can delete their trips" ON public.trips FOR DELETE USING (public.is_dive_center_admin(auth.uid(), dive_center_id));

CREATE POLICY "Divers can view their own bookings" ON public.bookings FOR SELECT USING (diver_id IN (SELECT id FROM public.diver_profiles WHERE user_id = auth.uid()) OR public.is_dive_center_staff(auth.uid(), (SELECT dive_center_id FROM public.trips WHERE id = trip_id)));
CREATE POLICY "Divers can create bookings" ON public.bookings FOR INSERT WITH CHECK (diver_id IN (SELECT id FROM public.diver_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE USING (public.is_dive_center_staff(auth.uid(), (SELECT dive_center_id FROM public.trips WHERE id = trip_id)));

-- Group messages
CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL, message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Confirmed divers and staff can view messages" ON public.group_messages FOR SELECT USING (public.is_confirmed_diver(auth.uid(), trip_id) OR public.is_dive_center_staff(auth.uid(), (SELECT dive_center_id FROM public.trips WHERE id = trip_id)));
CREATE POLICY "Confirmed divers and staff can send messages" ON public.group_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND (public.is_confirmed_diver(auth.uid(), trip_id) OR public.is_dive_center_staff(auth.uid(), (SELECT dive_center_id FROM public.trips WHERE id = trip_id))));

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Staff invites
CREATE TABLE public.staff_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dive_center_id UUID REFERENCES public.dive_centers(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL, role staff_role NOT NULL DEFAULT 'staff',
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage invites" ON public.staff_invites FOR SELECT USING (public.is_dive_center_admin(auth.uid(), dive_center_id));
CREATE POLICY "Admin can create invites" ON public.staff_invites FOR INSERT WITH CHECK (public.is_dive_center_admin(auth.uid(), dive_center_id));
CREATE POLICY "Admin can update invites" ON public.staff_invites FOR UPDATE USING (public.is_dive_center_admin(auth.uid(), dive_center_id));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Logo images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_date ON public.trips(trip_date);
CREATE INDEX idx_trips_dive_center ON public.trips(dive_center_id);
CREATE INDEX idx_bookings_trip ON public.bookings(trip_id);
CREATE INDEX idx_bookings_diver ON public.bookings(diver_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_group_messages_trip ON public.group_messages(trip_id);
CREATE INDEX idx_staff_members_center ON public.staff_members(dive_center_id);
CREATE INDEX idx_staff_members_user ON public.staff_members(user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
