import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Only Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [gender, setGender] = useState('male');
  const [teamsId, setTeamsId] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onNavigate('dashboard');
      } else {
        // Sign Up (Student Role)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'Student',
              role: 'student',
              country,
              phone_number: phone,
              gender,
              skype_id: teamsId,
              teams_id: teamsId,
            }
          }
        });
        if (error) throw error;
        
        setErrorMsg('Registration successful! Please log in with your credentials.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }} className="animate-fade">
      
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-card)',
      }}>
        
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'var(--primary-light)',
            padding: '12px',
            borderRadius: 'var(--radius-circle)',
            display: 'inline-flex',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <BookOpen size={32} color="var(--gold-accent)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-white)' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isLogin ? 'Access your student dashboard and classes' : 'Join Al Kareem Quran Institute as a student'}
          </p>
        </div>

        {/* Tab selection */}
        <div style={{
          display: 'flex',
          background: 'rgba(7, 21, 16, 0.8)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              background: isLogin ? 'var(--primary-light)' : 'none',
              border: 'none',
              color: isLogin ? 'var(--text-white)' : 'var(--text-muted)',
              padding: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              background: !isLogin ? 'var(--primary-light)' : 'none',
              border: 'none',
              color: !isLogin ? 'var(--text-white)' : 'var(--text-muted)',
              padding: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            Register Student
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!isLogin && (
            <>
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-000"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Teams ID / Email</label>
                  <input
                    type="text"
                    value={teamsId}
                    onChange={(e) => setTeamsId(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input-field"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="UAE">UAE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-field"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-accent"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              <><LogIn size={18} /> Sign In</>
            ) : (
              <><UserPlus size={18} /> Register Student</>
            )}
          </button>
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            backgroundColor: errorMsg.includes('successful') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${errorMsg.includes('successful') ? 'var(--emerald-bright)' : '#ef4444'}`,
            color: errorMsg.includes('successful') ? '#34d399' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
      
    </div>
  );
};
