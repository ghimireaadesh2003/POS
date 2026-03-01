import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SeedButton from '@/pages/admin/SeedButton';

const AdminLogin: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! Ask an existing admin to assign you the admin role, then sign in.');
        setMode('signin');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-primary-foreground">EMBER</h1>
          <p className="text-primary-foreground/50 text-sm mt-1">Management Portal</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-elevated">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signin' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-success/10 text-success text-sm p-3 rounded-xl mb-4">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ember.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') : (
                <span className="flex items-center gap-2">
                  {mode === 'signin' ? <><LogIn className="w-4 h-4" /> Sign In</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <SeedButton />
          <p className="text-primary-foreground/40 text-xs mt-2">Click to populate menu items & tables</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
