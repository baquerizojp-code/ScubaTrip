import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface BookingWithTrip {
  id: string;
  status: string;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  trips: {
    id: string;
    title: string;
    dive_site: string;
    trip_date: string;
    trip_time: string;
    dive_centers: { name: string } | null;
  } | null;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const MyBookings = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [bookings, setBookings] = useState<BookingWithTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase
        .from('diver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!profile) { setLoading(false); return; }

      const { data } = await supabase
        .from('bookings')
        .select('id, status, notes, rejection_reason, created_at, trips(id, title, dive_site, trip_date, trip_time, dive_centers(name))')
        .eq('diver_id', profile.id)
        .order('created_at', { ascending: false });

      setBookings((data as BookingWithTrip[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const renderList = (status: string) => {
    const filtered = bookings.filter(b => b.status === status);
    if (filtered.length === 0) {
      return <p className="text-center text-muted-foreground py-12">{t('diver.bookings.empty')}</p>;
    }
    return (
      <div className="space-y-3">
        {filtered.map(b => (
          <Link key={b.id} to={`/app/trip/${b.trips?.id}`}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{b.trips?.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{b.trips?.dive_centers?.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.trips?.dive_site}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.trips?.trip_date ? format(new Date(b.trips.trip_date), 'dd MMM') : ''}</span>
                  </div>
                  {b.rejection_reason && (
                    <p className="text-xs text-destructive mt-1">{b.rejection_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusBadge[b.status]}>{t(`diver.trip.status${b.status.charAt(0).toUpperCase() + b.status.slice(1)}`)}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t('nav.myBookings')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('diver.bookings.subtitle')}</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">{t('admin.bookings.pending')}</TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-1">{t('admin.bookings.confirmedTab')}</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">{t('admin.bookings.rejectedTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">{renderList('pending')}</TabsContent>
          <TabsContent value="confirmed" className="mt-4">{renderList('confirmed')}</TabsContent>
          <TabsContent value="rejected" className="mt-4">{renderList('rejected')}</TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MyBookings;
