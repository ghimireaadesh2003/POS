import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bell,
  Droplets,
  Receipt,
  HelpCircle,
  Utensils,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useCreateWaiterRequest } from "@/hooks/useWaiterRequests";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  tableNumber?: string | number;
}

const SERVICE_OPTIONS = [
  {
    id: "water",
    label: "Refill Water",
    icon: Droplets,
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: "bill",
    label: "Bring Bill",
    icon: Receipt,
    color: "text-emerald-500 bg-emerald-50",
  },
  {
    id: "silverware",
    label: "Silverware",
    icon: Utensils,
    color: "text-orange-500 bg-orange-50",
  },
  {
    id: "help",
    label: "I need help",
    icon: HelpCircle,
    color: "text-purple-500 bg-purple-50",
  },
];

const CallWaiterModal: React.FC<Props> = ({ onClose, tableNumber = "12" }) => {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const createRequest = useCreateWaiterRequest();

  const handleCall = async () => {
    if (!selectedRequest && !note.trim()) return;

    const parsedTable = typeof tableNumber === 'string' ? parseInt(tableNumber, 10) : tableNumber;
    if (!parsedTable || isNaN(parsedTable) || parsedTable <= 0) {
      toast.error("No table assigned. Please scan the QR code at your table.");
      return;
    }

    setIsSending(true);

    try {
      await createRequest.mutateAsync({
        tableId: parsedTable,
        requestType: selectedRequest,
        note: note,
      });

      setIsSending(false);
      setIsSent(true);

      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setIsSending(false);
      toast.error(err.message || "Failed to send request. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-card w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              key="request-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">Call Waiter</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Table {tableNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {SERVICE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRequest === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedRequest(opt.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2 ${
                        isSelected
                          ? "border-primary bg-primary/[0.03] scale-[0.98]"
                          : "border-border bg-background hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${opt.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Extra Note */}
              <div className="mb-6">
                <label className="text-sm font-bold mb-2 block">
                  Additional Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Can we get extra napkins?"
                  className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm resize-none h-24 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCall}
                disabled={isSending || (!selectedRequest && !note.trim())}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            /* Success State */
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Waitstaff Notified!</h3>
              <p className="text-muted-foreground px-8">
                Someone will be at **Table {tableNumber}** shortly to assist
                you.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CallWaiterModal;
