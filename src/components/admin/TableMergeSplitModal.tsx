import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Merge, Split, ArrowRight } from 'lucide-react';
import { type TableInfo } from '@/data/mockData';
import { useTables, type DbTable } from '@/hooks/useTables';

interface TableMergeSplitModalProps {
  mode: 'merge' | 'split';
  sourceTable?: TableInfo;
  onClose: () => void;
}

const TableMergeSplitModal: React.FC<TableMergeSplitModalProps> = ({ mode, sourceTable, onClose }) => {
  const { data: dbTables = [] } = useTables();
  const [selectedTables, setSelectedTables] = useState<number[]>(sourceTable ? [sourceTable.id] : []);
  const [splitParts, setSplitParts] = useState(2);

  const toggleTable = (id: number) => {
    if (mode === 'merge') {
      setSelectedTables(prev =>
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
    }
  };

  const handleConfirm = () => {
    if (mode === 'merge' && selectedTables.length >= 2) {
      alert(`Tables ${selectedTables.join(', ')} merged successfully!`);
      onClose();
    } else if (mode === 'split' && sourceTable) {
      alert(`Table ${sourceTable.id} split into ${splitParts} bills!`);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {mode === 'merge' ? <Merge className="w-5 h-5 text-primary" /> : <Split className="w-5 h-5 text-primary" />}
            <h2 className="font-display text-lg font-semibold text-foreground">
              {mode === 'merge' ? 'Merge Tables' : 'Split Bill'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'merge' ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Select tables to merge. Orders will be combined into one.
              </p>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {dbTables.map(table => {
                  const isSelected = selectedTables.includes(table.id);
                  const isDisabled = table.status === 'reserved' || table.status === 'billing';
                  return (
                    <button
                      key={table.id}
                      disabled={isDisabled}
                      onClick={() => toggleTable(table.id)}
                      className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-card'
                          : isDisabled
                            ? 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed'
                            : table.status === 'occupied'
                              ? 'bg-warning/10 text-warning border border-warning/30 hover:border-warning'
                              : 'bg-muted text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <span>{table.id}</span>
                      <span className="text-[9px] opacity-70">{table.seats}s</span>
                    </button>
                  );
                })}
              </div>

              {selectedTables.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-primary/5 rounded-xl p-3 mb-4"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTables.map((id, i) => (
                      <React.Fragment key={id}>
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-lg">
                          Table {id}
                        </span>
                        {i < selectedTables.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Combined seats: {selectedTables.reduce((sum, id) => sum + (dbTables.find(t => t.id === id)?.seats || 0), 0)}
                  </p>
                </motion.div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Split Table {sourceTable?.id}'s bill into multiple parts.
              </p>
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-foreground mb-3">Number of splits</p>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setSplitParts(n)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        splitParts === n
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-muted-foreground border border-border'
                      }`}
                    >
                      ÷ {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-foreground mb-1">Split Preview</p>
                <p className="text-xs text-muted-foreground mb-3">Each part will be billed separately</p>
                {Array.from({ length: splitParts }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">Part {i + 1}</span>
                    <span className="text-sm font-medium text-foreground">Equal share</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={mode === 'merge' && selectedTables.length < 2}
              className="flex-1 bg-gradient-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {mode === 'merge' ? `Merge ${selectedTables.length} Tables` : `Split into ${splitParts}`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TableMergeSplitModal;
