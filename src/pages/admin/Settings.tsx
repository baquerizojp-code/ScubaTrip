import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const { data: center } = useQuery({
    queryKey: ['dive-center', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return null;
      const { data, error } = await supabase
        .from('dive_centers')
        .select('*')
        .eq('id', diveCenterId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!diveCenterId,
  });

  useEffect(() => {
    if (center) {
      setName(center.name);
      setDescription(center.description || '');
      setWhatsapp(center.whatsapp_number || '');
    }
  }, [center]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('dive_centers')
        .update({ name, description, whatsapp_number: whatsapp })
        .eq('id', diveCenterId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dive-center'] });
      toast({ title: t('admin.settings.saved') });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.settings')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('admin.settings.centerInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-4">
            <div>
              <Label>{t('admin.settings.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>{t('admin.settings.description')}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1234567890" />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
