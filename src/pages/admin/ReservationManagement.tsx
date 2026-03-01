import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Users, Phone, Mail, Plus, X, Check, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReservations, useCreateReservation, useUpdateReservationStatus } from '@/hooks/useReservations';
import { useTables } from '@/hooks/useTables';
import { toast } from 'sonner';

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'bg-muted text-muted-foreground',
  'no-show': 'bg-warning/10 text-warning',
};

const ReservationManagement: React.FC = () => {
  const { data: reservations = [], isLoading } = useReservations();
  const { data: tables = [] } = useTables();
  const createReservation = useCreateReservation();
  const updateStatus = useUpdateReservationStatus();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    party_size: 2,
    table_id: null as number | null,
    reservation_date: new Date().toISOString().split('T')[0],
    time_slot: '19:00',
    notes: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReservation.mutateAsync({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        party_size: form.party_size,
        table_id: form.table_id,
        reservation_date: form.reservation_date,
        time_slot: form.time_slot,
        notes: form.notes || null,
      });
      toast.success('Reservation created');
      setShowForm(false);
      setForm({ customer_name: '', customer_phone: '', customer_email: '', party_size: 2, table_id: null, reservation_date: new Date().toISOString().split('T')[0], time_slot: '19:00', notes: '' });
    } catch {
      toast.error('Failed to create reservation');
    }
  };

  const today = reservations.filter(r => r.reservation_date === new Date().toISOString().split('T')[0]);
  const upcoming = reservations.filter(r => r.reservation_date > new Date().toISOString().split('T')[0]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Reservations</h1>
          <p className="text-muted-foreground text-sm mt-1">{today.length} today · {upcoming.length} upcoming</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Reservation</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Reservations", value: today.length.toString(), icon: CalendarDays },
          { label: 'Upcoming', value: upcoming.length.toString(), icon: Clock },
          { label: 'Total Guests Today', value: today.reduce((s, r) => s + r.party_size, 0).toString(), icon: Users },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reservation List */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Guest</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Date & Time</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Party</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Table</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...today, ...upcoming].map(res => (
                <tr key={res.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-foreground">{res.customer_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {res.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{res.customer_phone}</span>}
                      {res.customer_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{res.customer_email}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{new Date(res.reservation_date).toLocaleDateString()} · {res.time_slot}</td>
                  <td className="p-4 text-foreground">{res.party_size} guests</td>
                  <td className="p-4 text-foreground">{res.table_id ? `Table ${res.table_id}` : '—'}</td>
                  <td className="p-4"><Badge className={statusColors[res.status] || 'bg-muted text-muted-foreground'}>{res.status}</Badge></td>
                  <td className="p-4 text-right">
                    {res.status === 'confirmed' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-success" onClick={() => updateStatus.mutate({ id: res.id, status: 'completed' })}>
                          <Check className="w-3 h-3 mr-1" />Complete
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => updateStatus.mutate({ id: res.id, status: 'cancelled' })}>
                          <Ban className="w-3 h-3 mr-1" />Cancel
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">No upcoming reservations</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold text-foreground">New Reservation</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guest Name *</label>
                  <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required placeholder="John Smith" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                    <Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="+1 555-0100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                    <Input value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} placeholder="guest@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
                    <Input type="date" value={form.reservation_date} onChange={e => setForm(f => ({ ...f, reservation_date: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Time *</label>
                    <select value={form.time_slot} onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))} className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Party Size *</label>
                    <Input type="number" min={1} max={20} value={form.party_size} onChange={e => setForm(f => ({ ...f, party_size: parseInt(e.target.value) || 2 }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Table (optional)</label>
                    <select value={form.table_id || ''} onChange={e => setForm(f => ({ ...f, table_id: e.target.value ? parseInt(e.target.value) : null }))} className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Auto-assign</option>
                      {tables.filter(t => t.seats >= form.party_size).map(t => (
                        <option key={t.id} value={t.id}>Table {t.id} ({t.seats} seats)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                  <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Allergies, special requests..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={createReservation.isPending} className="flex-1">
                    {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationManagement;
