import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { fetchTripsByCenter } from '@/services/trips';
import { fetchBookingsForCenter, type AdminBookingWithDetails } from '@/services/bookings';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, Users, CalendarCheck, DollarSign, TrendingUp, Clock, ChevronRight, Plus, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data: trips = [] } = useQuery({
    queryKey: ['admin-trips', diveCenterId],
    queryFn: () => fetchTripsByCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings', diveCenterId],
    queryFn: () => fetchBookingsForCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  const today = new Date().toISOString().split('T')[0];
  const upcomingTrips = trips.filter(t => t.status === 'published' && t.trip_date >= today);
  const pending = bookings.filter(b => b.status === 'pending');
  /* AUDIT FIX: Replaced 'active' var name with 'confirmedBookings' for clarity */
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum: number, b: AdminBookingWithDetails) => sum + (Number(b.trips?.price_usd) || 0), 0);
  const occupancyPct = trips.length > 0
    ? Math.round(
        trips.reduce((s: number, t) => s + ((t.total_spots - t.available_spots) / t.total_spots) * 100, 0) / trips.length
      )
    : 0;

  const statCards = [
    {
      title: t('admin.dashboard.upcomingTrips'),
      value: upcomingTrips.length,
      icon: Ship,
      color: 'text-primary',
      bg: 'bg-primary/10',
      link: '/admin/trips?filter=upcoming',
    },
    {
      title: t('admin.dashboard.pendingBookings'),
      value: pending.length,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      link: '/admin/bookings',
    },
    {
      title: t('admin.dashboard.confirmedBookings'),
      value: confirmedBookings.length,
      /* AUDIT FIX: Replaced hardcoded green-500/600 with semantic success token */
      icon: CalendarCheck,
      color: 'text-success',
      bg: 'bg-success/10',
      link: '/admin/bookings?tab=confirmed',
    },
    {
      title: t('admin.dashboard.revenue'),
      value: `$${totalRevenue}`,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.dashboard')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/admin/trips?new=1')} className="gap-2">
          <Plus className="h-4 w-4" /> {t('admin.trips.create')}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, bg, link }) => (
          <Card
            key={title}
            className={`shadow-card hover:shadow-card-hover transition-shadow ${link ? 'cursor-pointer' : ''}`}
            onClick={() => link && navigate(link)}
          >
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Occupancy */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">{t('admin.dashboard.occupancy')}</p>
            <span className="text-xl font-bold text-foreground">{occupancyPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${occupancyPct}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Pending bookings preview */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">{t('admin.dashboard.pendingBookings')}</h2>
            <Link to="/admin/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t('admin.dashboard.viewAll')} <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3">
            {pending.slice(0, 3).map((b: AdminBookingWithDetails) => (
              <Card key={b.id} className="shadow-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{b.diver_profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{b.trips?.title}</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    {t('admin.bookings.pending')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
