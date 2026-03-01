import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingCart, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useOrders, ORDER_STATUS_STYLES } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';

const AdminDashboard: React.FC = () => {
  const { data: orders = [] } = useOrders();
  const { data: tables = [] } = useTables();

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
