import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { fetchTripsByCenter, createTrip, updateTrip, deleteTrip } from '@/services/trips';
import { tripSchema } from '@/lib/schemas';
import ImageUpload from '@/components/ImageUpload';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Ship, FileText, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type TripStatus = Database['public']['Enums']['trip_status'];
type TripDifficulty = Database['public']['Enums']['trip_difficulty'];
type CertLevel = Database['public']['Enums']['certification_level'];

interface TripFormData {
  title: string;
  description: string;
  dive_site: string;
  departure_point: string;
  trip_date: string;
  trip_time: string;
  total_spots: number;
  price_usd: number;
  difficulty: TripDifficulty | '';
  min_certification: CertLevel | '';
  gear_rental_available: boolean;
  whatsapp_group_url: string;
  image_url: string;
}

const emptyForm: TripFormData = {
  title: '', description: '', dive_site: '', departure_point: '',
  trip_date: '', trip_time: '08:00', total_spots: 10, price_usd: 0,
  difficulty: '', min_certification: '', gear_rental_available: false,
  whatsapp_group_url: '', image_url: '',
};

const AdminTrips = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<TripStatus>('draft');
  const [form, setForm] = useState<TripFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null);
      setForm(emptyForm);
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filterParam = searchParams.get('filter');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['admin-trips', diveCenterId],
    queryFn: () => fetchTripsByCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  // Apply filter if coming from dashboard
  const filteredTrips = (() => {
    if (!trips) return [];
    if (filterParam === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      return trips
        .filter(t => t.status === 'published' && t.trip_date >= today)
        .sort((a, b) => a.trip_date.localeCompare(b.trip_date));
    }
    return trips;
  })();

  const saveMutation = useMutation({
    mutationFn: async ({ formData, targetStatus }: { formData: TripFormData; targetStatus: TripStatus }) => {
      const payload = {
        dive_center_id: diveCenterId!,
        title: formData.title,
        description: formData.description || null,
        dive_site: formData.dive_site,
        departure_point: formData.departure_point,
        trip_date: formData.trip_date,
        trip_time: formData.trip_time,
        total_spots: formData.total_spots,
        price_usd: formData.price_usd,
        difficulty: formData.difficulty || null,
        min_certification: formData.min_certification || null,
        gear_rental_available: formData.gear_rental_available,
        whatsapp_group_url: formData.whatsapp_group_url || null,
        image_url: formData.image_url || null,
        status: targetStatus,
      };

      if (editingId) {
        const { dive_center_id, ...updatePayload } = payload;
        await updateTrip(editingId, updatePayload);
      } else {
        await createTrip({ ...payload, available_spots: formData.total_spots });
      }
      return targetStatus;
    },
    onSuccess: (targetStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      setDialogOpen(false);
      setEditingId(null);
      setEditingStatus('draft');
      setForm(emptyForm);
      toast.success(targetStatus === 'published' ? t('admin.trips.published') : t('admin.trips.savedDraft'));
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error');
    },
  });

  const handleSave = (targetStatus: TripStatus) => {
    const result = tripSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      });
      setFormErrors(errors);
      toast.error(t('common.fixErrors'));
      return;
    }
    setFormErrors({});
    saveMutation.mutate({ formData: form, targetStatus });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      toast.success(t('admin.trips.deleted'));
    },
  });

  const openEdit = (trip: any) => {
    setEditingId(trip.id);
    setEditingStatus(trip.status);
    setForm({
      title: trip.title, description: trip.description || '', dive_site: trip.dive_site,
      departure_point: trip.departure_point, trip_date: trip.trip_date, trip_time: trip.trip_time,
      total_spots: trip.total_spots, price_usd: Number(trip.price_usd),
      difficulty: trip.difficulty || '', min_certification: trip.min_certification || '',
      gear_rental_available: trip.gear_rental_available || false,
      whatsapp_group_url: trip.whatsapp_group_url || '', 
      image_url: trip.image_url || '',
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setEditingStatus('draft');
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const isEditingPublished = editingId && editingStatus === 'published';

  const statusColor = (s: TripStatus) => {
    const map: Record<TripStatus, string> = {
      draft: 'bg-muted text-muted-foreground',
      published: 'bg-primary/10 text-primary',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return map[s];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.trips')}</h1>
          <p className="text-sm text-muted-foreground">
            {filterParam === 'upcoming' ? t('admin.dashboard.upcomingTrips') : t('admin.trips.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          {filterParam && (
            <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
              {t('admin.nav.trips')}
            </Button>
          )}
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : !filteredTrips.length ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Ship className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">{t('admin.trips.empty')}</p>
          <Button onClick={openCreate} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{trip.title}</h3>
                  <Badge variant="outline" className={statusColor(trip.status)}>{trip.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trip.dive_site} · {format(new Date(trip.trip_date), 'dd/MM/yyyy')} · {trip.trip_time?.slice(0, 5)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${Number(trip.price_usd)} · {trip.available_spots}/{trip.total_spots} {t('common.spots')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(trip)} aria-label={t('admin.trips.edit')}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  aria-label={t('admin.trips.confirmDelete')}
                  onClick={() => setDeleteId(trip.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('admin.trips.edit') : t('admin.trips.create')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>{t('admin.trips.field.image') || 'Imagen del Viaje'}</Label>
                <ImageUpload 
                  value={form.image_url} 
                  onChange={(url) => setForm({ ...form, image_url: url })} 
                  bucket="trip-images"
                />
              </div>
              <div className="md:col-span-2">
                <Label>{t('admin.trips.field.title')}</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="md:col-span-2">
                <Label>{t('admin.trips.field.description')}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>{t('admin.trips.field.diveSite')}</Label>
                <Input value={form.dive_site} onChange={(e) => setForm({ ...form, dive_site: e.target.value })} required />
              </div>
              <div>
                <Label>{t('admin.trips.field.departure')}</Label>
                <Input value={form.departure_point} onChange={(e) => setForm({ ...form, departure_point: e.target.value })} required />
              </div>
              <div>
                <Label>{t('common.date')}</Label>
                <Input type="date" value={form.trip_date} onChange={(e) => setForm({ ...form, trip_date: e.target.value })} required />
              </div>
              <div>
                <Label>{t('common.time')}</Label>
                <Input type="time" value={form.trip_time} onChange={(e) => setForm({ ...form, trip_time: e.target.value })} required />
              </div>
              <div>
                <Label>{t('common.price')} (USD)</Label>
                <Input type="number" min={0} step={0.01} value={form.price_usd || ''} onChange={(e) => setForm({ ...form, price_usd: Number(e.target.value) })} onFocus={(e) => e.target.select()} required />
              </div>
              <div>
                <Label>{t('admin.trips.field.spots')}</Label>
                <Input type="number" min={1} value={form.total_spots || ''} onChange={(e) => setForm({ ...form, total_spots: Number(e.target.value) })} onFocus={(e) => e.target.select()} required />
              </div>
              <div>
                <Label>{t('admin.trips.field.difficulty')}</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as TripDifficulty })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('admin.trips.difficulty.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('admin.trips.difficulty.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('admin.trips.difficulty.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.trips.field.minCert')}</Label>
                <Select value={form.min_certification} onValueChange={(v) => setForm({ ...form, min_certification: v as CertLevel })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('profile.cert.none')}</SelectItem>
                    <SelectItem value="open_water">{t('profile.cert.openWater')}</SelectItem>
                    <SelectItem value="advanced_open_water">{t('profile.cert.advanced')}</SelectItem>
                    <SelectItem value="rescue_diver">{t('profile.cert.rescue')}</SelectItem>
                    <SelectItem value="divemaster">{t('profile.cert.divemaster')}</SelectItem>
                    <SelectItem value="instructor">{t('profile.cert.instructor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.gear_rental_available} onCheckedChange={(v) => setForm({ ...form, gear_rental_available: v })} />
                <Label>{t('admin.trips.field.gearRental')}</Label>
              </div>
              <div className="md:col-span-2">
                <Label>WhatsApp Group URL</Label>
                <Input value={form.whatsapp_group_url} onChange={(e) => setForm({ ...form, whatsapp_group_url: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              {isEditingPublished ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saveMutation.isPending}
                    onClick={() => handleSave('draft')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {saveMutation.isPending ? t('common.loading') : t('admin.trips.unpublish')}
                  </Button>
                  <Button
                    type="button"
                    disabled={saveMutation.isPending}
                    onClick={() => handleSave('published')}
                    className="gap-2 bg-gradient-ocean text-primary-foreground hover:opacity-90"
                  >
                    {saveMutation.isPending ? t('common.loading') : t('admin.trips.saveChanges')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saveMutation.isPending}
                    onClick={() => handleSave('draft')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {saveMutation.isPending ? t('common.loading') : t('admin.trips.saveDraft')}
                  </Button>
                  <Button
                    type="button"
                    disabled={saveMutation.isPending}
                    onClick={() => handleSave('published')}
                    className="gap-2 bg-gradient-ocean text-primary-foreground hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                    {saveMutation.isPending ? t('common.loading') : t('admin.trips.publish')}
                  </Button>
                </>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.trips.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.trips.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTrips;
