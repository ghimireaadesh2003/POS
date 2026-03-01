import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Clock, Star, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useOrders } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';
import { useMenuItems } from '@/hooks/useMenuItems';

const COLORS = [
  'hsl(0, 55%, 32%)', 'hsl(38, 85%, 55%)', 'hsl(210, 70%, 50%)',
  'hsl(142, 60%, 40%)', 'hsl(280, 50%, 50%)', 'hsl(30, 60%, 50%)',
];

const Analytics: React.FC = () => {
  const { data: orders = [] } = useOrders();
  const { data: tables = [] } = useTables();
  const { data: menuItems = [] } = useMenuItems();

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Peak hours from real data
  const peakHours = useMemo(() => {
    const hourMap: Record<string, number> = {};
    for (let h = 6; h <= 23; h++) hourMap[h.toString()] = 0;
    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours().toString();
      if (hourMap[hour] !== undefined) hourMap[hour]++;
    });
    return Object.entries(hourMap).map(([hour, count]) => ({ hour, orders: count }));
  }, [orders]);

  // Category breakdown from menu items
  const categoryBreakdown = useMemo(() => {
    const catMap: Record<string, number> = {};
    menuItems.forEach(i => { catMap[i.category] = (catMap[i.category] || 0) + 1; });
    const total = menuItems.length || 1;
    return Object.entries(catMap).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
    }));
  }, [menuItems]);

  // Table profitability from real tables
  const tableProfitability = useMemo(() => {
    return tables.slice(0, 10).map(t => ({
      table: `T${t.id}`,
      revenue: Number(t.revenue) || 0,
    }));
  }, [tables]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Data-driven insights from your orders</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign },
          { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingCart },
          { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp },
          { label: 'Tables', value: `${tables.length}`, icon: Clock },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Orders by Hour</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={h => `${h}:00`} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Menu by Category</h2>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{cat.name} ({cat.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No menu data</p>
          )}
        </div>
      </div>

      {/* Table Profitability */}
      {tableProfitability.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Table Revenue</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tableProfitability}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="table" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
