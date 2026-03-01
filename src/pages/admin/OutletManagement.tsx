import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, TrendingUp, TrendingDown, DollarSign, Users, UtensilsCrossed, BarChart3, ChevronDown, Check, ArrowUpRight } from 'lucide-react';

interface Outlet {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  revenue: number;
  revenueChange: number;
  orders: number;
  avgTicket: number;
  staff: number;
  topItems: string[];
  pricingMultiplier: number;
}

const outlets: Outlet[] = [
  {
    id: 'main',
    name: 'EMBER Downtown',
    location: '45 King Street West, Toronto',
    status: 'active',
    revenue: 48260,
    revenueChange: 12.5,
    orders: 672,
    avgTicket: 71.82,
    staff: 24,
    topItems: ['Wagyu Ribeye', 'Lobster Linguine', 'Truffle Burrata'],
    pricingMultiplier: 1.0,
  },
  {
    id: 'midtown',
    name: 'EMBER Midtown',
    location: '120 Bloor Street East, Toronto',
    status: 'active',
    revenue: 35890,
    revenueChange: 8.3,
    orders: 498,
    avgTicket: 72.07,
    staff: 18,
    topItems: ['Pan-Seared Salmon', 'Cacio e Pepe', 'Tiramisu'],
    pricingMultiplier: 1.1,
  },
  {
    id: 'waterfront',
    name: 'EMBER Waterfront',
    location: '10 Queens Quay West, Toronto',
    status: 'active',
    revenue: 52140,
    revenueChange: -2.1,
    orders: 589,
    avgTicket: 88.52,
    staff: 28,
    topItems: ['Wagyu Ribeye', 'Negroni', 'Panna Cotta'],
    pricingMultiplier: 1.2,
  },
  {
    id: 'suburbs',
    name: 'EMBER Scarborough',
    location: '300 Borough Drive, Scarborough',
    status: 'inactive',
    revenue: 0,
    revenueChange: 0,
    orders: 0,
    avgTicket: 0,
    staff: 0,
    topItems: [],
    pricingMultiplier: 0.9,
  },
];

const sampleMenuPricing = [
  { name: 'Wagyu Ribeye', base: 58 },
  { name: 'Lobster Linguine', base: 32 },
  { name: 'Truffle Burrata', base: 16.5 },
  { name: 'Margherita DOP', base: 18 },
  { name: 'Tiramisu', base: 14 },
  { name: 'Espresso Martini', base: 16 },
];

const OutletManagement: React.FC = () => {
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [view, setView] = useState<'overview' | 'pricing' | 'comparison'>('overview');

  const activeOutlets = outlets.filter(o => o.status === 'active');
  const totalRevenue = activeOutlets.reduce((s, o) => s + o.revenue, 0);
  const totalOrders = activeOutlets.reduce((s, o) => s + o.orders, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Outlets</h1>
          <p className="text-muted-foreground text-sm mt-1">{activeOutlets.length} active branches</p>
        </div>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground shadow-card hover:bg-muted transition-colors min-w-[200px]"
          >
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 text-left">
              {selectedOutlet === 'all' ? 'All Outlets' : outlets.find(o => o.id === selectedOutlet)?.name}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden"
            >
              <button
                onClick={() => { setSelectedOutlet('all'); setDropdownOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-muted transition-colors ${selectedOutlet === 'all' ? 'text-primary font-medium' : 'text-foreground'}`}
              >
                All Outlets
                {selectedOutlet === 'all' && <Check className="w-4 h-4" />}
              </button>
              {outlets.map(o => (
                <button
                  key={o.id}
                  onClick={() => { setSelectedOutlet(o.id); setDropdownOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-muted transition-colors border-t border-border ${selectedOutlet === o.id ? 'text-primary font-medium' : 'text-foreground'}`}
                >
                  <div>
                    <p>{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${o.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                    {selectedOutlet === o.id && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-2">
        {(['overview', 'pricing', 'comparison'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              view === v ? 'bg-gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {v === 'pricing' ? 'Outlet Pricing' : v === 'comparison' ? 'Branch Comparison' : v}
          </button>
        ))}
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Total Revenue</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UtensilsCrossed className="w-4 h-4" />
                <span className="text-xs font-medium">Total Orders</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalOrders.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Total Staff</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{activeOutlets.reduce((s, o) => s + o.staff, 0)}</p>
            </div>
          </div>

          {/* Outlet Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {outlets.map((outlet, idx) => (
              <motion.div
                key={outlet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-card rounded-xl border border-border p-5 shadow-card ${outlet.status === 'inactive' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-foreground">{outlet.name}</h3>
                      <span className={`w-2 h-2 rounded-full ${outlet.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {outlet.location}
                    </p>
                  </div>
                  {outlet.status === 'active' && (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                      outlet.revenueChange >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {outlet.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(outlet.revenueChange)}%
                    </span>
                  )}
                </div>

                {outlet.status === 'active' ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-sm font-semibold text-foreground">${outlet.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="text-sm font-semibold text-foreground">{outlet.orders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Ticket</p>
                        <p className="text-sm font-semibold text-foreground">${outlet.avgTicket.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Top Items</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {outlet.topItems.map(item => (
                          <span key={item} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{item}</span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Opening soon</p>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Outlet-wise Pricing */}
      {view === 'pricing' && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-[1fr,repeat(4,auto)] gap-4 px-5 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
            <span>Menu Item</span>
            {outlets.map(o => (
              <span key={o.id} className="text-center min-w-[100px]">{o.name.replace('EMBER ', '')}</span>
            ))}
          </div>
          {sampleMenuPricing.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-[1fr,repeat(4,auto)] gap-4 items-center px-5 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              {outlets.map(o => (
                <span key={o.id} className="text-sm text-center min-w-[100px]">
                  {o.status === 'active' ? (
                    <span className="font-semibold text-foreground">
                      ${(item.base * o.pricingMultiplier).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              ))}
            </motion.div>
          ))}
          <div className="px-5 py-3 bg-muted/30 text-xs text-muted-foreground">
            * Prices based on outlet multipliers: {outlets.filter(o => o.status === 'active').map(o => `${o.name.replace('EMBER ', '')} (×${o.pricingMultiplier})`).join(', ')}
          </div>
        </div>
      )}

      {/* Branch Comparison */}
      {view === 'comparison' && (
        <div className="space-y-4">
          {/* Comparison Table */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="grid grid-cols-[1fr,repeat(3,auto)] gap-4 px-5 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
              <span>Metric</span>
              {activeOutlets.map(o => (
                <span key={o.id} className="text-center min-w-[120px]">{o.name.replace('EMBER ', '')}</span>
              ))}
            </div>
            {[
              { label: 'Revenue', key: 'revenue', format: (v: number) => `$${v.toLocaleString()}` },
              { label: 'Orders', key: 'orders', format: (v: number) => v.toString() },
              { label: 'Avg Ticket', key: 'avgTicket', format: (v: number) => `$${v.toFixed(2)}` },
              { label: 'Staff', key: 'staff', format: (v: number) => v.toString() },
              { label: 'Revenue/Staff', key: 'revPerStaff', format: (v: number) => `$${v.toFixed(0)}` },
            ].map((metric, idx) => {
              const values = activeOutlets.map(o => {
                if (metric.key === 'revPerStaff') return o.staff > 0 ? o.revenue / o.staff : 0;
                return (o as any)[metric.key] as number;
              });
              const maxVal = Math.max(...values);
              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="grid grid-cols-[1fr,repeat(3,auto)] gap-4 items-center px-5 py-3.5 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  {values.map((val, i) => (
                    <span key={i} className={`text-sm text-center min-w-[120px] font-semibold ${val === maxVal ? 'text-success' : 'text-foreground'}`}>
                      {metric.format(val)}
                      {val === maxVal && <ArrowUpRight className="w-3 h-3 inline ml-1 text-success" />}
                    </span>
                  ))}
                </motion.div>
              );
            })}
          </div>

          {/* Growth comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeOutlets.map(outlet => (
              <div key={outlet.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{outlet.name.replace('EMBER ', '')}</h3>
                <p className="text-xs text-muted-foreground mb-3">{outlet.location}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full"
                      style={{ width: `${(outlet.revenue / 60000) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${outlet.revenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {outlet.revenueChange >= 0 ? '+' : ''}{outlet.revenueChange}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletManagement;
