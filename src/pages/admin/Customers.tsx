import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Gift, TrendingUp, Crown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCustomers, useCoupons } from '@/hooks/useCustomers';

const tierColors: Record<string, string> = {
  Bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Silver: 'bg-secondary text-secondary-foreground',
  Gold: 'bg-accent/20 text-accent-foreground',
  Platinum: 'bg-primary/10 text-primary',
};

const Customers: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
  const { data: coupons = [], isLoading: loadingCoupons } = useCoupons();

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalLoyaltyPoints = customers.reduce((s, c) => s + c.points, 0);
  const avgSpend = totalCustomers > 0 ? Math.round(customers.reduce((s, c) => s + Number(c.total_spent), 0) / totalCustomers) : 0;

  if (loadingCustomers) {
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
          <h1 className="font-display text-2xl font-semibold text-foreground">CRM & Loyalty</h1>
          <p className="text-muted-foreground text-sm mt-1">Customer relationships and rewards</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: totalCustomers.toString(), icon: Users },
          { label: 'Avg Spend/Customer', value: `$${avgSpend}`, icon: TrendingUp },
          { label: 'Active Loyalty Points', value: totalLoyaltyPoints.toLocaleString(), icon: Crown },
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Customer Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Customer</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Tier</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Visits</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Total Spent</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Points</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Favorite</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => (
                <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><Badge className={tierColors[customer.tier] || 'bg-muted text-muted-foreground'}>{customer.tier}</Badge></td>
                  <td className="p-4 text-foreground">{customer.total_visits}</td>
                  <td className="p-4 font-medium text-foreground">${Number(customer.total_spent).toLocaleString()}</td>
                  <td className="p-4 text-foreground">{customer.points.toLocaleString()}</td>
                  <td className="p-4 text-muted-foreground">{customer.favorite_item || '—'}</td>
                  <td className="p-4 text-muted-foreground">{customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">No customers found. Seed the database to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Coupons */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Gift className="w-4 h-4 text-accent" />Active Coupons</h2>
        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coupons.map(coupon => (
              <div key={coupon.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">{coupon.code}</p>
                  <p className="text-xs text-muted-foreground">{coupon.discount} · {coupon.usage_count} used</p>
                </div>
                <Badge variant="secondary">{coupon.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No coupons yet. Seed the database to add sample coupons.</p>
        )}
      </div>
    </div>
  );
};

export default Customers;
