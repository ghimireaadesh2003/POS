import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedDatabase } from '@/scripts/seedDatabase';
import { toast } from '@/hooks/use-toast';
import { Database } from 'lucide-react';

const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedDatabase();
      toast({ title: 'Database seeded!', description: '19 menu items and 20 tables added.' });
    } catch (e: any) {
      toast({ title: 'Seed failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={loading} variant="outline" className="gap-2">
      <Database className="w-4 h-4" />
      {loading ? 'Seeding...' : 'Seed Database'}
    </Button>
  );
};

export default SeedButton;
