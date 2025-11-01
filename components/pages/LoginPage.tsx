
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { signIn, signUp, signInWithGoogle } from '../../services/firebase';
import { Button, Input, Label, Spinner } from '../ui';
import Icon from '../Icons';
import brandLogo from "../../brand/galpek.png";

const LoginPage: React.FC = () => {
  const [view, setView] = useState<'options' | 'login' | 'signup'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/spaces');
    }
  }, [user, authLoading, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (view === 'login') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      navigate('/spaces');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
        await signInWithGoogle();
        navigate('/spaces');
    } catch (err: any) {
        setError(err.message || 'Failed to sign in with Google.');
    } finally {
        setLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderForm = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in">
       <button type="button" onClick={() => setView('options')} className="text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4">&larr; Back to options</button>
      {view === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-primary-foreground">Name</Label>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required className="bg-white/20 border-white/30 text-white placeholder:text-white/60"/>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-primary-foreground">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required className="bg-white/20 border-white/30 text-white placeholder:text-white/60"/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-primary-foreground">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/20 border-white/30 text-white placeholder:text-white/60" />
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" className="w-full bg-background text-foreground hover:bg-background/90" disabled={loading}>
        {loading ? <Spinner size="sm" /> : (view === 'login' ? 'Log in' : 'Sign up with email')}
      </Button>
    </form>
  );

  const renderOptions = () => (
     <div className="space-y-4 animate-fade-in">
        <Button onClick={handleGoogleSignIn} className="w-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center gap-2" disabled={loading}>
            <Icon name="google" className="w-5 h-5" /> Continue with Google
        </Button>
        <Button onClick={() => setView('signup')} className="w-full bg-white/20 border border-white/30 text-white hover:bg-white/30" disabled={loading}>
            Sign up with email
        </Button>
        <p className="text-center text-sm text-primary-foreground/80">
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="font-semibold underline text-primary-foreground">Log in</button>
        </p>
     </div>
  );


  return (
    <div className="flex flex-col h-screen bg-background">
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <img src={brandLogo} alt="Logo" className="w-40 h-auto mx-auto" />

                <h1 className="text-4xl font-bold mt-4 text-foreground">Noya</h1>
                <p className="text-sm text-muted-foreground mt-1">Track your research journey, simply.</p>
            </div>
        </div>
        <div className="bg-primary rounded-t-3xl p-8 text-primary-foreground shadow-2xl animate-slide-in-up">
            <div className="w-full max-w-md mx-auto">
                {view === 'options' ? renderOptions() : renderForm()}
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
