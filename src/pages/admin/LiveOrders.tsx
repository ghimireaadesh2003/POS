import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Clock,
  MoreHorizontal,
  Merge,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { type TableInfo } from "@/data/mockData";
import TableMergeSplitModal from "@/components/admin/TableMergeSplitModal";
import {
  useOrders,
  useUpdateOrderStatus,
  type DbOrder,
  ORDER_STATUS_STYLES,
} from "@/hooks/useOrders";

const filterTabs = ["All", "Dine-in", "Takeaway", "Delivery"];

const LiveOrders: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [mergeModal, setMergeModal] = useState(false);
  const [splitModal, setSplitModal] = useState<TableInfo | null>(null);
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const filtered = orders.filter(o => {
    if (o.status === 'cancelled' || o.status === 'paid') return false;
    return activeFilter === "All" || o.type === activeFilter.toLowerCase();
  });

  const handlePrintReceipt = (order: DbOrder) => {
    const receiptWindow = window.open("", "_blank", "width=300,height=500");
    if (!receiptWindow) return;
    receiptWindow.document.write(`
      <html><head><title>Receipt - ${order.order_number}</title>
      <style>body{font-family:monospace;padding:20px;font-size:12px;max-width:280px;margin:0 auto}
      h1{text-align:center;font-size:18px;margin:0}h2{text-align:center;font-size:12px;margin:4px 0 16px;font-weight:normal}
      .line{border-top:1px dashed #000;margin:8px 0}.row{display:flex;justify-content:space-between;margin:4px 0}
      .total{font-weight:bold;font-size:14px}.center{text-align:center;margin:12px 0}</style></head>
      <body>
      <h1>EMBER</h1><h2>Fine Dining & Bar</h2>
      <div class="line"></div>
      <div class="row"><span>Order:</span><span>${order.order_number}</span></div>
      <div class="row"><span>Table:</span><span>${order.table_id ?? "Takeaway"}</span></div>
      <div class="row"><span>Date:</span><span>${new Date(order.created_at).toLocaleDateString()}</span></div>
      <div class="row"><span>Time:</span><span>${new Date(order.created_at).toLocaleTimeString()}</span></div>
      <div class="line"></div>
      <div class="row total"><span>Total</span><span>$${Number(order.total).toFixed(2)}</span></div>
      <div class="line"></div>
      <p class="center">Thank you for dining with us!</p>
      <script>window.print();</script></body></html>
    `);
    receiptWindow.document.close();
  };

  const getTimeSince = (time: string) => {
    const mins = Math.floor((Date.now() - new Date(time).getTime()) / 60000);
    return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  const handleAccept = (orderId: string) => {
    updateStatus.mutate({ orderId, status: "preparing" });
    toast.success("Order accepted and sent to kitchen");
  };

  const handleMarkReady = (orderId: string) => {
    updateStatus.mutate({ orderId, status: "ready" });
    toast.success("Order marked as ready");
  };

  const handleMarkServed = (orderId: string) => {
    updateStatus.mutate({ orderId, status: "served" });
    toast.success("Order marked as served");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Live Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMergeModal(true)}
            className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Merge className="w-4 h-4" /> Merge Tables
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-60"
              placeholder="Search orders..."
            />
          </div>
          <button className="bg-muted p-2.5 rounded-xl text-muted-foreground">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === tab
                ? "bg-gradient-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading orders...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {order.order_number}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.type === "dine-in"
                      ? `Table ${order.table_id}`
                      : order.customer_name}{" "}
                    · {order.type}
                  </p>
                </div>
                <button className="text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    ORDER_STATUS_STYLES[order.status]?.bg || "bg-muted"
                  } ${ORDER_STATUS_STYLES[order.status]?.color || "text-muted-foreground"}`}
                >
                  {ORDER_STATUS_STYLES[order.status]?.label || order.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {getTimeSince(order.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-semibold text-foreground">
                  ${Number(order.total).toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrintReceipt(order)}
                    className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-secondary flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" /> Print
                  </button>
                  {order.status === "sent" && (
                    <button
                      onClick={() => handleAccept(order.id)}
                      className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium"
                    >
                      Accept
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      onClick={() => handleMarkReady(order.id)}
                      className="text-xs bg-success/10 text-success px-3 py-1.5 rounded-lg font-medium"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      onClick={() => handleMarkServed(order.id)}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium"
                    >
                      Mark Served
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {mergeModal && (
          <TableMergeSplitModal
            mode="merge"
            onClose={() => setMergeModal(false)}
          />
        )}
        {splitModal && (
          <TableMergeSplitModal
            mode="split"
            sourceTable={splitModal}
            onClose={() => setSplitModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveOrders;
