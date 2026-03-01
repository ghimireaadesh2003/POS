import React from 'react';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="font-display text-4xl font-bold text-foreground">EMBER</h1>
        <p className="text-muted-foreground">Frictionless Dining & Revenue Optimization Platform</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/menu?table=5')} className="w-full bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-semibold shadow-elevated">
            Customer Menu
          </button>
          <button onClick={() => navigate('/admin')} className="w-full bg-card border border-border text-foreground py-4 rounded-2xl font-semibold shadow-card">
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
