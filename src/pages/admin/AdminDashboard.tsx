import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingCart, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, HandHelping, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useOrders, ORDER_STATUS_STYLES } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';
import { useWaiterRequests, useUpdateWaiterRequest, REQUEST_TYPE_LABELS } from '@/hooks/useWaiterRequests';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { data: orders = [] } = useOrders();
  const { data: tables = [] } = useTables();
  const { data: waiterRequests = [] } = useWaiterRequests();
  const updateWaiterRequest = useUpdateWaiterRequest();

  const activeTables = tables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Compute peak hours from real orders
  const peakHours = useMemo(() => {
    const hourMap: Record<string, number> = {};
    for (let h = 6; h <= 23; h++) hourMap[h.toString()] = 0;
    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours().toString();
      if (hourMap[hour] !== undefined) hourMap[hour]++;
    });
    return Object.entries(hourMap).map(([hour, count]) => ({ hour, orders: count }));
  }, [orders]);

  const pendingRequests = waiterRequests.filter(r => r.status === 'pending');

  const handleAcknowledge = (id: string) => {
    updateWaiterRequest.mutate({ id, status: 'acknowledged' }, {
      onSuccess: () => toast.success('Request acknowledged'),
    });
  };

  const handleResolve = (id: string) => {
    updateWaiterRequest.mutate({ id, status: 'resolved' }, {
      onSuccess: () => toast.success('Request resolved'),
    });
  };

  const getTimeSince = (time: string) => {
    const mins = Math.floor((Date.now() - new Date(time).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const stats = [
    { label: "Today's Revenue", value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, change: `${orders.length} orders`, up: true },
    { label: 'Active Tables', value: `${activeTables}/${tables.length}`, icon: Users, change: `${Math.round(activeTables / (tables.length || 1) * 100)}%`, up: activeTables > 0 },
    { label: 'Orders', value: orders.length.toString(), icon: ShoppingCart, change: `${activeOrders.length} active`, up: true },
    { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(0)}`, icon: Clock, change: orders.length > 0 ? 'per order' : '—', up: true },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-success' : 'text-warning'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-semibold text-foreground mt-3">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Waiter Requests Section */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <HandHelping className="w-4 h-4 text-warning" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">Active Waiter Requests</h2>
            </div>
            <span className="text-xs font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-full">
              {pendingRequests.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-warning/5 border border-warning/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Table {req.table_id}</span>
                    <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                      {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                    </span>
                  </div>
                  {req.note && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">"{req.note}"</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{getTimeSince(req.created_at)}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleAcknowledge(req.id)}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleResolve(req.id)}
                    className="text-xs bg-success/10 text-success px-3 py-1.5 rounded-lg font-medium hover:bg-success/20 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Resolve
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Orders by Hour</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={h => `${h}:00`} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.type === 'dine-in' ? `Table ${order.table_id}` : order.customer_name}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  ORDER_STATUS_STYLES[order.status]?.bg || 'bg-muted'
                } ${ORDER_STATUS_STYLES[order.status]?.color || 'text-muted-foreground'}`}>
                  {ORDER_STATUS_STYLES[order.status]?.label || order.status}
                </span>
              </div>
            ))}
            {activeOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No active orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

