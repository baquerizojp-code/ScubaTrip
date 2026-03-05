import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Ship, CalendarCheck, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return { trips: 0, pendingBookings: 0, confirmedThisMonth: 0 };

      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [tripsRes, tripsAll] = await Promise.all([
        supabase.from('trips').select('id', { count: 'exact', head: true })
          .eq('dive_center_id', diveCenterId).gte('trip_date', today).eq('status', 'published'),
        supabase.from('trips').select('id').eq('dive_center_id', diveCenterId),
      ]);

      const tripIds = tripsAll.data?.map(t => t.id) || [];
      let pendingBookings = 0;
      let confirmedThisMonth = 0;

      if (tripIds.length) {
        const [pendingRes, confirmedRes] = await Promise.all([
          supabase.from('bookings').select('id', { count: 'exact', head: true })
            .in('trip_id', tripIds).eq('status', 'pending'),
          supabase.from('bookings').select('id', { count: 'exact', head: true })
            .in('trip_id', tripIds).eq('status', 'confirmed').gte('updated_at', monthStart),
        ]);
        pendingBookings = pendingRes.count || 0;
        confirmedThisMonth = confirmedRes.count || 0;
      }

      return { trips: tripsRes.count || 0, pendingBookings, confirmedThisMonth };
    },
    enabled: !!diveCenterId,
  });

  const cards = [
    { icon: Ship, label: t('admin.dashboard.upcomingTrips'), value: stats?.trips ?? 0 },
    { icon: CalendarCheck, label: t('admin.dashboard.pendingBookings'), value: stats?.pendingBookings ?? 0 },
    { icon: Users, label: t('admin.dashboard.confirmedMonth'), value: stats?.confirmedThisMonth ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t('admin.dashboard.title')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('admin.dashboard.subtitle')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
