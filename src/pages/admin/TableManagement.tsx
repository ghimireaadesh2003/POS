import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, DollarSign, QrCode, Download } from 'lucide-react';
import { useTables, useUpdateTableStatus, useUpdateTableRevenue } from '@/hooks/useTables';
import { useOrders } from '@/hooks/useOrders';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  free: 'bg-success/10 border-success/30 text-success',
  occupied: 'bg-primary/10 border-primary/30 text-primary',
  billing: 'bg-warning/10 border-warning/30 text-warning',
  reserved: 'bg-info/10 border-info/30 text-info',
};

const TableManagement: React.FC = () => {
  const { data: tables = [], isLoading } = useTables();
  const { data: allOrders = [] } = useOrders();
  const updateStatus = useUpdateTableStatus();
  const updateRevenue = useUpdateTableRevenue();
  const [showQR, setShowQR] = useState<number | null>(null);

  const handleCompletePayment = async (tableId: number) => {
    // Include all active orders for this table session
    const activeStatuses = ['sent', 'preparing', 'ready', 'served', 'billing'];
    const eligibleOrders = allOrders.filter(o => o.table_id === tableId && activeStatuses.includes(o.status));
    const totalRevenue = eligibleOrders.reduce((sum, o) => sum + Number(o.total), 0);
    
    if (eligibleOrders.length === 0) {
      toast.error("No active orders found for this table");
      return;
    }
    
    try {
      await updateRevenue.mutateAsync({ tableId, revenue: totalRevenue });
      // We should also mark all those orders as 'paid' or just clear them.
      // For now, updating revenue and freeing table is the main goal.
      toast.success(`Payment completed for Table ${tableId}. Revenue: $${totalRevenue.toFixed(2)}`);
    } catch (err) {
      toast.error("Failed to complete payment");
    }
  };

  const handleClearTable = async (tableId: number) => {
    try {
      await updateStatus.mutateAsync({ tableId, status: 'free' });
      toast.success(`Table ${tableId} is now free`);
    } catch (err) {
      toast.error("Failed to clear table");
    }
  };

  const counts = {
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    billing: tables.filter(t => t.status === 'billing').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const baseUrl = window.location.origin;

  const handlePrintQR = (tableId: number) => {
    const w = window.open('', '_blank', 'width=400,height=500');
    if (!w) return;
    w.document.write(`
      <html><head><title>QR - Table ${tableId}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px}
      h1{font-size:24px;margin:0}h2{font-size:14px;color:#666;margin:8px 0 24px}
      .qr{display:inline-block;padding:20px;border:2px solid #000;border-radius:12px}
      p{margin-top:16px;font-size:12px;color:#999}</style></head>
      <body>
      <h1>EMBER</h1><h2>Table ${tableId}</h2>
      <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}/menu?table=${tableId}`)}" /></div>
      <p>Scan to view our menu</p>
      <script>setTimeout(()=>window.print(),500)</script></body></html>
    `);
    w.document.close();
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-muted-foreground text-sm">Loading tables...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Table Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{counts.occupied + counts.billing} of {tables.length} tables active</p>
        </div>
        <Button variant="outline" onClick={() => {
          const w = window.open('', '_blank', 'width=800,height=1000');
          if (!w) return;
          const qrHtml = tables.map(t => `
            <div style="display:inline-block;text-align:center;margin:20px;page-break-inside:avoid">
              <h3>Table ${t.id}</h3>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${baseUrl}/menu?table=${t.id}`)}" />
              <p style="font-size:10px;color:#666">${t.seats} seats</p>
            </div>
          `).join('');
          w.document.write(`<html><head><title>All Table QR Codes</title>
            <style>body{font-family:sans-serif;text-align:center;padding:20px}h1{margin-bottom:20px}</style></head>
            <body><h1>EMBER — Table QR Codes</h1>${qrHtml}<script>setTimeout(()=>window.print(),1000)</script></body></html>`);
          w.document.close();
        }}>
          <QrCode className="w-4 h-4 mr-2" />Print All QR Codes
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status === 'free' ? 'bg-success' : status === 'occupied' ? 'bg-primary' : status === 'billing' ? 'bg-warning' : 'bg-info'}`} />
            <span className="text-sm text-muted-foreground capitalize">{status} ({count})</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map((table, idx) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.02 }}
            className={`rounded-xl border-2 p-4 flex flex-col items-center justify-between relative group ${statusColors[table.status] || 'bg-muted border-border text-muted-foreground'}`}
          >
            <div className="text-center w-full">
              <span className="text-3xl font-display font-bold">{table.id}</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs opacity-70">
                <Users className="w-3 h-3" />{table.seats} seats
              </div>
              <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">{table.status}</p>
            </div>

            <div className="w-full mt-4 space-y-2">
              {table.status === 'billing' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCompletePayment(table.id); }}
                  className="w-full bg-warning text-warning-foreground py-2 rounded-lg text-xs font-bold shadow-sm hover:brightness-110"
                >
                  Complete Payment
                </button>
              ) : table.status !== 'free' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleClearTable(table.id); }}
                  className="w-full bg-background/50 text-foreground py-2 rounded-lg text-xs font-medium border border-current/10 hover:bg-background/80"
                >
                  Clear Table
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowQR(showQR === table.id ? null : table.id); }}
                  className="w-full bg-success/20 text-success py-2 rounded-lg text-xs font-medium border border-success/30 hover:bg-success/30"
                >
                  {showQR === table.id ? 'Close QR' : 'Show QR'}
                </button>
              )}
            </div>

            <div className="w-full mt-3 pt-3 border-t border-current/10 flex justify-between items-center text-[10px] font-medium opacity-70">
               <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{Number(table.revenue).toFixed(0)}</span>
               <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{table.avg_dine_time}m</span>
            </div>

            {showQR === table.id && table.status === 'free' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 bg-card rounded-xl border border-border p-4 flex flex-col items-center justify-center gap-2 shadow-xl"
              >
                <QRCodeSVG value={`${baseUrl}/menu?table=${table.id}`} size={120} />
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrintQR(table.id); }}
                  className="flex items-center gap-1.5 text-xs text-primary font-bold mt-2 bg-primary/5 px-3 py-1.5 rounded-full"
                >
                  <Download className="w-3 h-3" /> Print QR
                </button>
                <button onClick={() => setShowQR(null)} className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Close</button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TableManagement;
