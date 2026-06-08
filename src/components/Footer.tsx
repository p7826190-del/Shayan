import React from 'react';
import { BookOpen, Mail, MessageSquare, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    onNavigate('home');
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer style={{
      background: 'var(--primary-deep)',
      borderTop: '1px solid var(--border-glass)',
      padding: '60px 24px 30px',
      marginTop: '80px',
    }}>
      <div className="max-width-container grid-container grid-3" style={{ marginBottom: '40px' }}>
        {/* Col 1: Logo & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={20} color="var(--gold-accent)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>AL Kareem Quran Institute</h3>
          </div>
          <p style={{ color: '#b3cbbd', fontSize: '0.9rem', marginBottom: '20px' }}>
            Providing professional 1-on-1 online Quran classes. Offering qualified female tutors, flexible schedules, and customized learning structures for students globally.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Direct WhatsApp Call */}
            <a 
              href="https://wa.me/923482648719" 
              className="btn-accent" 
              style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '20px' }}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <MessageSquare size={14} /> WhatsApp Support
            </a>
          </div>
        </div>

        {/* Col 2: Courses */}
        <div style={{ paddingLeft: '20px' }} className="footer-col-nav">
          <h4 style={{ fontSize: '1rem', color: 'var(--text-highlight)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Our Courses
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#b3cbbd' }}>
            <li>
              <a href="#courses" onClick={(e) => handleFooterLinkClick(e, 'courses')} className="footer-link">
                Quran Reading / Nazra
              </a>
            </li>
            <li>
              <a href="#courses" onClick={(e) => handleFooterLinkClick(e, 'courses')} className="footer-link">
                Tajweed Rules Course
              </a>
            </li>
            <li>
              <a href="#courses" onClick={(e) => handleFooterLinkClick(e, 'courses')} className="footer-link">
                Quran Memorization (Hifz)
              </a>
            </li>
            <li>
              <a href="#courses" onClick={(e) => handleFooterLinkClick(e, 'courses')} className="footer-link">
                Islamic Studies for Children
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact info */}
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-highlight)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contact Us
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#b3cbbd' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={16} color="var(--gold-accent)" />
              <a href="https://wa.me/923482648719" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>
                +92 348 264 8719 (WhatsApp)
              </a>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--gold-accent)" />
              <span style={{ color: '#ffffff' }}>alkareemquraninstitute548@gmail.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.3)', borderRadius: '4px', color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={12} />
                <span>Verified SSL & Secure Backend</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)', marginBottom: '20px' }} />

      <div className="max-width-container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#b3cbbd',
      }}>
        <span>© {new Date().getFullYear()} Al Kareem Quran Institute. All rights reserved.</span>
        <span>Trusted Islamic Education Online since 2022</span>
      </div>

      <style>{`
        .footer-link {
          color: #b3cbbd !important;
          transition: var(--transition-fast);
        }
        .footer-link:hover {
          color: #ffffff !important;
          padding-left: 2px;
        }
        @media (max-width: 768px) {
          .footer-col-nav { padding-left: 0 !important; }
        }
      `}</style>
    </footer>
  );
};
