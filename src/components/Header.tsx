import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';
import { BookOpen, LogOut, Menu, X, User, LayoutDashboard, Shield } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile | null;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ profile, onNavigate, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Courses', id: 'courses' },
    { label: 'Fees', id: 'fees' },
    { label: 'Tutors', id: 'tutors' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: isScrolled ? '8px' : '16px',
      left: '16px',
      right: '16px',
      margin: '12px auto',
      width: 'calc(100% - 32px)',
      maxWidth: '1200px',
      zIndex: 100,
      borderRadius: 'var(--radius-md)',
      padding: isScrolled ? '10px 24px' : '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid var(--border-glass)',
      backgroundColor: isScrolled ? 'rgba(249, 246, 240, 0.92)' : 'rgba(255, 255, 255, 0.85)',
      boxShadow: isScrolled ? '0 10px 30px rgba(26, 71, 49, 0.08)' : 'var(--shadow-card)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Logo */}
      <div 
        onClick={() => onNavigate('home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          background: 'rgba(201, 168, 76, 0.1)',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        }}>
          <BookOpen size={24} color="var(--gold-accent)" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-deep)' }}>
            AL Kareem
          </h1>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', color: 'var(--gold-accent)', marginTop: '-4px', fontWeight: 700 }}>
            Quran Institute
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav style={{ display: 'none', gap: '30px' }} className="desktop-nav">
        {currentPage === 'home' ? (
          navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-deep)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {link.label}
            </a>
          ))
        ) : (
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-deep)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Back to Website
          </button>
        )}
      </nav>

      {/* User Actions */}
      <div style={{ display: 'none', alignItems: 'center', gap: '16px' }} className="desktop-actions">
        {profile ? (
          <>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {profile.role === 'admin' ? (
                <Shield size={16} color="var(--gold-accent)" />
              ) : (
                <LayoutDashboard size={16} />
              )}
              {profile.role === 'admin' ? 'Admin Portal' : profile.role === 'teacher' ? 'Teacher Dashboard' : 'My Dashboard'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-circle)',
                backgroundColor: 'var(--primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-emerald)',
              }}>
                <User size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-deep)' }}>
                {profile.full_name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
              title="Logout"
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onNavigate('auth')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-deep)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary-deep)'}
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="btn-accent"
              style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            >
              Free Trial
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        style={{
          display: 'block',
          background: 'none',
          border: 'none',
          color: 'var(--primary-deep)',
          cursor: 'pointer',
        }}
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '10px',
          background: 'var(--bg-dark)',
          border: '1px solid var(--border-emerald)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-glow)',
          zIndex: 99,
        }}>
          {currentPage === 'home' ? (
            navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--primary-deep)',
                }}
              >
                {link.label}
              </a>
            ))
          ) : (
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-deep)',
                fontSize: '1rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              Back to Website
            </button>
          )}

          <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)' }} />

          {profile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={18} color="var(--gold-accent)" />
                <span style={{ fontWeight: 700, color: 'var(--primary-deep)' }}>{profile.full_name}</span>
              </div>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: '#ef4444' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  onNavigate('auth');
                  setMobileMenuOpen(false);
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onNavigate('auth');
                  setMobileMenuOpen(false);
                }}
                className="btn-accent"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Free Trial
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global CSS injection to support responsive classes inside Vanilla CSS header */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
