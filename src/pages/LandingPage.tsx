import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Check, Star, HelpCircle, Phone, Calendar, ArrowRight, Video, Sparkles, Send } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

// CalligraphyDivider component using symmetrical Islamic design
const CalligraphyDivider: React.FC = () => (
  <div className="scroll-reveal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '50px 0', opacity: 0.85 }}>
    <svg width="240" height="34" viewBox="0 0 240 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M120 17 C115 10, 105 2, 90 17 C105 32, 115 24, 120 17 Z" fill="var(--gold-accent)" />
      <path d="M120 17 C125 10, 135 2, 150 17 C135 32, 125 24, 120 17 Z" fill="var(--gold-accent)" />
      <circle cx="120" cy="17" r="4" fill="var(--primary-deep)" />
      <path d="M10 17 Q50 7, 90 17" stroke="var(--gold-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M230 17 Q190 7, 150 17" stroke="var(--gold-accent)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
      <circle cx="5" cy="17" r="2.5" fill="var(--gold-accent)" />
      <circle cx="235" cy="17" r="2.5" fill="var(--gold-accent)" />
    </svg>
  </div>
);

// Animated counter that triggers when visible
const AnimatedCounter: React.FC<{ end: number; suffix?: string }> = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1800; // 1.8 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuad = (x: number): number => {
        return x * (2 - x);
      };

      const current = Math.floor(easeOutQuad(progress) * end);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end]);

  return <span ref={elementRef}>{count}{suffix}</span>;
};

// 3D Rotating Medallion graphic
const RotatingMedallion: React.FC = () => (
  <div className="three-d-medallion-container floating" style={{ margin: '20px auto' }}>
    <div className="three-d-medallion">
      <div className="medallion-face medallion-front">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5 L58 35 L88 35 L64 53 L73 83 L50 65 L27 83 L36 53 L12 35 L42 35 Z" fill="none" stroke="var(--gold-accent)" strokeWidth="2.5" />
          <path d="M50 15 L56 38 L80 38 L61 52 L68 75 L50 61 L32 75 L39 52 L20 38 L44 38 Z" fill="none" stroke="var(--gold-accent)" strokeWidth="1" opacity="0.6" />
          <circle cx="50" cy="50" r="10" stroke="var(--gold-accent)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="4" fill="var(--gold-accent)" />
          <circle cx="50" cy="12" r="1.5" fill="var(--gold-accent)" />
          <circle cx="50" cy="88" r="1.5" fill="var(--gold-accent)" />
          <circle cx="12" cy="50" r="1.5" fill="var(--gold-accent)" />
          <circle cx="88" cy="50" r="1.5" fill="var(--gold-accent)" />
          <circle cx="23" cy="23" r="1.5" fill="var(--gold-accent)" />
          <circle cx="77" cy="77" r="1.5" fill="var(--gold-accent)" />
          <circle cx="23" cy="77" r="1.5" fill="var(--gold-accent)" />
          <circle cx="77" cy="23" r="1.5" fill="var(--gold-accent)" />
        </svg>
      </div>
      <div className="medallion-face medallion-back">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="50" height="50" rx="6" stroke="var(--gold-accent)" strokeWidth="2" transform="rotate(45 50 50)" />
          <rect x="25" y="25" width="50" height="50" rx="6" stroke="var(--gold-accent)" strokeWidth="2" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="var(--gold-accent)" strokeWidth="1.5" />
          <path d="M44 48 C44 42, 56 42, 56 48 C56 54, 44 54, 44 48" stroke="var(--gold-accent)" strokeWidth="1.5" />
          <path d="M50 38 L50 62" stroke="var(--gold-accent)" strokeWidth="1" />
          <path d="M38 50 L62 50" stroke="var(--gold-accent)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Free Trial Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [country, setCountry] = useState('United States');
  const [course, setCourse] = useState('Quran Reading / Nazra');
  const [genderPref, setGenderPref] = useState('no_preference');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Pricing currency state
  const [currency, setCurrency] = useState<'USD' | 'GBP' | 'CAD' | 'PKR'>('USD');

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll reveal setup
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.05 });

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setSubmitMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      // Supabase is completely bypassed to prevent profile infinite recursion RLS errors
      setSubmitMessage({
        type: 'success',
        text: 'Alhamdulillah! Your request details are processed. Redirecting to WhatsApp...',
      });

      // Construct WhatsApp pre-filled text in the exact requested format
      const whatsappMsg = encodeURIComponent(
        `Hello! I'd like to book a Free Trial.
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message || 'Assalamu Alaikum. I would like to schedule my free trial classes.'}
Please confirm my free trial session.`
      );

      // Clear form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');

      // Redirect to WhatsApp link in a new tab
      setTimeout(() => {
        window.open(`https://wa.me/923482648719?text=${whatsappMsg}`, '_blank');
        setSubmitting(false);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setSubmitMessage({
        type: 'error',
        text: err.message || 'An error occurred. Please try again.',
      });
      setSubmitting(false);
    }
  };

  // Pricing configs updated: Plan 1 = $28 (3 days), Plan 2 = $39.99 (5 days). Other currencies scaled proportionally.
  const pricingPlans = {
    USD: { symbol: '$', rate3: '28', rate5: '39.99' },
    GBP: { symbol: '£', rate3: '20', rate5: '30' },
    CAD: { symbol: 'C$', rate3: '38', rate5: '55' },
    PKR: { symbol: 'Rs.', rate3: '5,500', rate5: '8,000' },
  };

  const coursesList = [
    {
      title: 'Quran Reading & Recitation (Nazra)',
      description: 'Ideal for beginners and children. Learn the foundations of Arabic letters, proper pronunciation, and start reciting the Quran fluently.',
      duration: '6 Months',
      timeline: '30 Mins / Session',
      features: ['Basic Qaida rules', 'Recitation fluency training', 'Daily revision slot', 'Basic Duas & Salah steps'],
    },
    {
      title: 'Tajweed Rules Course',
      description: 'Master the science of recitation. Focuses on articulation points of letters, rules of elongation, silent letters, and melodic recitation rules.',
      duration: '6 Months',
      timeline: '30 Mins / Session',
      features: ['Makharij & Sifat rules', 'Advanced vocal practices', 'Experienced Tajweed tutors', 'Authentic certifications'],
    },
    {
      title: 'Quran Memorization (Hifz)',
      description: 'Structured memorization of selected Surahs or the entire Quran under expert supervision. Focuses on daily retention and long-term review.',
      duration: 'Flexible',
      timeline: '30-60 Mins / Session',
      features: ['Personalized Hifz plan', 'Advanced retention training', 'Daily assessment loop', 'Revision techniques (Dohr)'],
    },
    {
      title: 'Arabic Language Basics',
      description: 'Master reading, writing, and basic conversational Arabic. Understand Quranic grammar and vocabulary step-by-step.',
      duration: '6 Months',
      timeline: '30 Mins / Session',
      features: ['Quranic vocabulary', 'Grammar (Nahw & Sarf)', 'Spoken conversation basics', 'Writing & script parsing'],
    },
    {
      title: 'Islamic Studies for Kids & Adults',
      description: 'Comprehensive Islamic curriculum covering Hadith, Aqeedah (theology), Seerah (prophetic biography), Fiqh (jurisprudence), and daily etiquettes.',
      duration: 'Ongoing',
      timeline: '30 Mins / Session',
      features: ['Hadith study & morals', 'Prophetic history (Seerah)', 'Practical Fiqh guides', 'Aqeedah & Salah lessons'],
    },
  ];

  const faqs = [
    {
      q: 'How do the 3 free trial classes work?',
      a: 'Completely free with no commitment! Register with your details and Teams Email/ID, we will connect you to one of our certified teachers, and you schedule 3 interactive sessions over one week.',
    },
    {
      q: 'Are female tutors available?',
      a: 'Yes, absolutely. We have dedicated and qualified female Quran teachers specifically for female students and kids for maximum privacy and comfortable learning.',
    },
    {
      q: 'What platforms do you use for live classes?',
      a: 'We use Microsoft Teams as our primary delivery channel. Teams calls provide stable audio/video and desktop screen sharing for viewing digital materials. You will launch classes directly from your student portal.',
    },
    {
      q: 'What are the class timings?',
      a: 'Class scheduling is highly flexible. Once you register or subscribe, you can specify your time availability, and we assign a tutor to match your preferred local time slot.',
    },
    {
      q: 'Do you offer a discount for multiple students?',
      a: 'Yes! We offer a 10% Family Discount on the monthly fee for the second or subsequent student in the same household.',
    },
  ];

  return (
    <div className="animate-fade" style={{ minHeight: '100vh' }}>
      {/* SEO JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Al Kareem Quran Institute",
            "url": "https://alkareemquraninstitute.com",
            "logo": "https://alkareemquraninstitute.com/logo.jpg",
            "description": "Online live 1-on-1 Quran and Islamic education classes for children, sisters, and adults. Learn Quran recitation, Tajweed, Hifz, and Arabic basics from native scholars.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+923482648719",
              "contactType": "customer support"
            }
          })
        }}
      />
      
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": coursesList.map((course, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "item": {
                "@type": "Course",
                "name": course.title,
                "description": course.description,
                "provider": {
                  "@type": "EducationalOrganization",
                  "name": "Al Kareem Quran Institute",
                  "sameAs": "https://alkareemquraninstitute.com"
                }
              }
            }))
          })
        }}
      />
      
      {/* Quranic Verse Banner Marquee */}
      <div style={{
        background: 'var(--primary-deep)',
        borderBottom: '2px solid var(--gold-accent)',
        padding: '10px 0',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <div className="marquee-container">
          <div className="marquee-content" style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
            <span style={{ color: 'var(--gold-accent)', fontFamily: 'serif', fontWeight: 600, fontSize: '1.1rem' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'serif' }}>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</span>
            <span style={{ color: '#cbdad0', fontSize: '0.95rem', fontWeight: 500 }}>"And recite the Quran with measured recitation." (Surah Al-Muzzammil 73:4)</span>
            <span style={{ color: 'var(--gold-accent)' }}>✦</span>
            <span style={{ color: 'var(--gold-accent)', fontFamily: 'serif', fontWeight: 600, fontSize: '1.1rem' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'serif' }}>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</span>
            <span style={{ color: '#cbdad0', fontSize: '0.95rem', fontWeight: 500 }}>"And recite the Quran with measured recitation." (Surah Al-Muzzammil 73:4)</span>
            <span style={{ color: 'var(--gold-accent)' }}>✦</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="section-padding islamic-pattern" style={{ paddingTop: '50px', position: 'relative', overflow: 'hidden' }}>
        {/* Floating background graphic shapes */}
        <div className="floating" style={{ position: 'absolute', top: '10%', left: '4%', opacity: 0.15, pointerEvents: 'none' }}>
          <svg width="60" height="60" viewBox="0 0 100 100" fill="var(--gold-accent)">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </div>
        <div className="floating" style={{ position: 'absolute', bottom: '15%', right: '6%', opacity: 0.12, pointerEvents: 'none', animationDelay: '2.5s' }}>
          <svg width="85" height="85" viewBox="0 0 100 100" fill="var(--primary-deep)">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </div>

        <div className="max-width-container hero-grid">
          
          {/* Hero Left Content */}
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--gold-glow)', border: '1px solid var(--gold-accent)', borderRadius: '20px', width: 'fit-content' }}>
              <Sparkles size={14} color="#a3821a" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a3821a', textTransform: 'uppercase' }}>
                4+ Years of Educational Trust
              </span>
            </div>
            
            <h1 style={{ fontSize: '3rem', color: 'var(--primary-deep)', fontWeight: 800, lineHeight: 1.15 }}>
              Learn the Holy Quran with <span style={{ color: 'var(--gold-accent)' }}>Tajweed</span> from Home
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Online live 1-on-1 Quran and Islamic education classes for children, sisters, and adults. Customized scheduling, verified scholars, and qualified female tutors available.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-deep)' }}>
                <div style={{ background: 'var(--emerald-glow)', border: '1px solid var(--emerald-bright)', padding: '2px', borderRadius: '50%', display: 'flex' }}><Check size={14} color="var(--emerald-bright)" /></div>
                <span>Qualified Tutors</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-deep)' }}>
                <div style={{ background: 'var(--emerald-glow)', border: '1px solid var(--emerald-bright)', padding: '2px', borderRadius: '50%', display: 'flex' }}><Check size={14} color="var(--emerald-bright)" /></div>
                <span>Female Tutors Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-deep)' }}>
                <div style={{ background: 'var(--emerald-glow)', border: '1px solid var(--emerald-bright)', padding: '2px', borderRadius: '50%', display: 'flex' }}><Check size={14} color="var(--emerald-bright)" /></div>
                <span>3-Day Free Trial</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '15px' }}>
              <a href="#courses" className="btn-secondary">
                Explore Courses
              </a>
              <a href="#fees" className="btn-accent">
                View Fees Structure <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Hero Middle: 3D Rotating Geometric Medallion */}
          <div className="three-d-medallion-container animate-fade" style={{ animationDelay: '0.1s' }}>
            <RotatingMedallion />
          </div>
          
          {/* Hero Right: Lead Gen Form */}
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-glass)', position: 'relative', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 15px 35px rgba(26, 71, 49, 0.05)' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '20px' }}>
                <span className="badge-gold" style={{ boxShadow: 'var(--shadow-gold)' }}>Free Admission</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--primary-deep)' }}>Book Your 3 Free Trial Classes</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                No credit card required. Experience 1-on-1 tutoring.
              </p>
              
              <form onSubmit={handleTrialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter student name"
                    className="input-field"
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field"
                      required
                    />
                  </div>
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
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input-field"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="United Arab Emirates">UAE</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Tutor Preference</label>
                    <select
                      value={genderPref}
                      onChange={(e) => setGenderPref(e.target.value)}
                      className="input-field"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="no_preference">No Preference</option>
                      <option value="female">Female Tutor Required</option>
                      <option value="male">Male Tutor Required</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="input-label">Select Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Quran Reading / Nazra">Quran Reading / Nazra</option>
                    <option value="Tajweed Rules Course">Tajweed Rules Course</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter any specific class requirements..."
                    className="input-field"
                    style={{ minHeight: '75px', resize: 'vertical' }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn-accent" 
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : <><Send size={16} /> Register for Free Trial</>}
                </button>
              </form>
              
              {submitMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  backgroundColor: submitMessage.type === 'success' ? 'rgba(21, 128, 61, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${submitMessage.type === 'success' ? 'var(--emerald-bright)' : '#ef4444'}`,
                  color: submitMessage.type === 'success' ? 'var(--primary-deep)' : '#ef4444',
                  fontWeight: 600,
                }}>
                  {submitMessage.text}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </section>

      <CalligraphyDivider />

      {/* 3-Step Process Card */}
      <section className="section-padding scroll-reveal" style={{ background: 'rgba(26, 71, 49, 0.03)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-width-container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px', color: 'var(--primary-deep)' }}>Your Onboarding Funnel</h2>
          <div className="grid-container grid-3">
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--emerald-glow)', border: '1.5px solid var(--emerald-bright)', color: 'var(--emerald-bright)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>1</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary-deep)' }}>Free Registration</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill in the trial form with your details to trigger direct WhatsApp support routing.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gold-glow)', border: '1.5px solid var(--gold-accent)', color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>2</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary-deep)' }}>Attend 3 Free Classes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Learn 1-on-1 with your assigned teacher over Teams. Get analyzed & tested.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--emerald-glow)', border: '1.5px solid var(--emerald-bright)', color: 'var(--emerald-bright)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>3</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary-deep)' }}>Enroll & Schedule</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>If satisfied, choose a subscription plan, select your weekly hours, and start.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with animated counter */}
      <section className="section-padding scroll-reveal islamic-pattern" style={{ background: 'var(--primary-deep)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-width-container">
          <div className="grid-container grid-4" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                <AnimatedCounter end={500} suffix="+" />
              </div>
              <p style={{ color: '#b3cbbd', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Students Enrolled</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <p style={{ color: '#b3cbbd', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Certified Tutors</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <p style={{ color: '#b3cbbd', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Success Rate</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                <AnimatedCounter end={4} suffix="+" />
              </div>
              <p style={{ color: '#b3cbbd', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Years of Trust</p>
            </div>
          </div>
        </div>
      </section>

      <CalligraphyDivider />

      {/* Courses Catalog Section with 3D Flip Card Effect */}
      <section id="courses" className="section-padding scroll-reveal">
        <div className="max-width-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-gold" style={{ marginBottom: '10px', display: 'inline-block' }}>Courses</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-deep)' }}>Offered Learning Programs</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '10px auto 0' }}>
              Explore our core structures designed for kids, sisters, and complete beginners. Hover cards to flip and view features.
            </p>
          </div>
          
          <div className="grid-container grid-3">
            {coursesList.map((course, idx) => (
              <div key={idx} className="flip-card scroll-reveal">
                <div className="flip-card-inner">
                  {/* Front Face */}
                  <div className="flip-card-front">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        background: 'var(--gold-glow)',
                        padding: '16px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        marginTop: '20px',
                        border: '1px solid var(--gold-accent)',
                      }}>
                        <BookOpen size={36} color="var(--primary-deep)" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.7rem', color: 'var(--primary-deep)', marginBottom: '14px' }}>
                          {course.title}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                          {course.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-deep)', marginBottom: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={16} color="var(--gold-accent)" /> {course.duration}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Video size={16} color="var(--gold-accent)" /> {course.timeline}
                        </span>
                      </div>
                      <div style={{ color: 'var(--gold-accent)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        ✦ Hover to flip & view details ✦
                      </div>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="flip-card-back">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--gold-accent)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={20} color="var(--gold-accent)" /> Features & Focus Areas
                        </h3>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {course.features.map((feat, fidx) => (
                            <li key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#ffffff' }}>
                              <Check size={18} color="var(--gold-accent)" style={{ flexShrink: 0 }} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button 
                        onClick={() => {
                          const el = document.getElementById('home');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }} 
                        className="btn-primary" 
                        style={{ width: '100%' }}
                      >
                        Start Free Trial
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CalligraphyDivider />

      {/* Fees / Pricing Section with entrance stagger */}
      <section id="fees" className="section-padding scroll-reveal" style={{ background: 'rgba(26, 71, 49, 0.03)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-width-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-emerald" style={{ marginBottom: '10px', display: 'inline-block' }}>Plans & Pricing</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-deep)' }}>Affordable Pricing Structure</h2>
            <p style={{ color: 'var(--text-muted)', margin: '10px auto 30px', maxWidth: '600px' }}>
              We keep our rates equal to the global standard. Select your preferred currency:
            </p>
            
            {/* Currency toggler */}
            <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(26, 71, 49, 0.08)', border: '1px solid var(--border-glass)', borderRadius: '30px', padding: '6px' }}>
              {(['USD', 'GBP', 'CAD', 'PKR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  style={{
                    background: currency === curr ? 'var(--primary-deep)' : 'none',
                    border: 'none',
                    color: currency === curr ? '#ffffff' : 'var(--primary-deep)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: '20px',
                    padding: '8px 20px',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid-container grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Card 1: 3 Days/Week */}
            <div className="glass-panel scroll-reveal" style={{ padding: '36px', textAlign: 'center', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-deep)', marginBottom: '8px' }}>3 Days / Week</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>12 Classes per Month (30 Mins Daily)</p>
              <div style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                {pricingPlans[currency].symbol}{pricingPlans[currency].rate3}<span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', margin: '24px 0 32px', textAlign: 'left', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> 1-on-1 private Teams lessons</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> Male / Female tutor availability</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> Flexible slot scheduling</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> Dashboard attendance & logs</li>
              </ul>
              <button 
                onClick={() => onNavigate('auth')} 
                className="btn-primary" 
                style={{ width: '100%' }}
              >
                Sign Up & Subscribe
              </button>
            </div>
            
            {/* Card 2: 5 Days/Week (Stagger delay applied) */}
            <div className="glass-panel scroll-reveal" style={{ padding: '36px', textAlign: 'center', border: '1.5px solid var(--gold-accent)', boxShadow: 'var(--shadow-gold)', position: 'relative', transitionDelay: '0.2s' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '50%', transform: 'translateX(50%)' }}>
                <span className="badge-gold" style={{ background: 'var(--gold-accent)', color: '#ffffff' }}>Most Popular</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-deep)', marginBottom: '8px' }}>5 Days / Week</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>20 Classes per Month (30 Mins Daily)</p>
              <div style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--gold-accent)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                {pricingPlans[currency].symbol}{pricingPlans[currency].rate5}<span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', margin: '24px 0 32px', textAlign: 'left', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> 1-on-1 private Teams lessons</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> Male / Female tutor availability</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> High intensity progress speed</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--emerald-bright)" /> 10% family discount for 2nd kid</li>
              </ul>
              <button 
                onClick={() => onNavigate('auth')} 
                className="btn-accent" 
                style={{ width: '100%' }}
              >
                Sign Up & Subscribe
              </button>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px', color: 'var(--gold-hover)', fontWeight: 700, fontSize: '0.95rem' }}>
            💡 Family Discount: Get 10% OFF on the monthly fee for the second student in your family!
          </div>
        </div>
      </section>

      <CalligraphyDivider />

      {/* About Us section */}
      <section id="about" className="section-padding scroll-reveal">
        <div className="max-width-container grid-container grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="badge-gold" style={{ marginBottom: '10px', display: 'inline-block' }}>Our Academy</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--primary-deep)' }}>Learn from Certified Native Arabic & Quran Tutors</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Al Kareem Quran Institute has been offering live 1-on-1 Quran and Islamic education for over 4 years. We select only the most qualified, certified scholars with Ijazah credentials.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              We understand the safety and comfort requirements of our global students. Therefore, we maintain a dedicated directory of professional female Quran scholars to tutor female students and young children.
            </p>
            <div className="grid-container grid-2" style={{ gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--gold-accent)' }}><Star size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)' }}>4+ Years Experience</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Established since 2022</span>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--gold-accent)' }}><Star size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)' }}>Ijazah Certificates</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified credentials only</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial block */}
          <div className="glass-panel" style={{ padding: '40px', background: 'var(--primary-deep)', borderLeft: '4px solid var(--gold-accent)' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: 'var(--gold-accent)' }}>
              <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '24px', lineHeight: 1.7, color: '#ffffff' }}>
              "Alhamdulillah, my 8-year-old daughter has been learning Tajweed with a female teacher from Al Kareem Quran Institute for the last 6 months. Her pronunciation has improved massively, and she loves her lessons. The Teams classes are always on time, and the Student Dashboard makes it so easy to check her progress notes."
            </p>
            <div>
              <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>Sister Fatima</h4>
              <span style={{ fontSize: '0.8rem', color: '#b3cbbd' }}>Parent from London, UK</span>
            </div>
          </div>
        </div>
      </section>

      <CalligraphyDivider />

      {/* Tutors & Credentials Section */}
      <section id="tutors" className="section-padding scroll-reveal" style={{ borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-width-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-gold" style={{ marginBottom: '10px', display: 'inline-block' }}>Tutors Directory</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-deep)' }}>Our Certified Native Arabic Scholars</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '10px auto 0' }}>
              Learn from qualified male and female teachers with active Ijazahs and educational trust.
            </p>
          </div>

          <div className="grid-container grid-3">
            {/* Tutor 1 */}
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-deep)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--gold-accent)',
                boxShadow: 'var(--shadow-gold)',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700
              }}>
                SA
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '4px' }}>Sheikh Ahmed Al-Azhar</h3>
              <span className="badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Ijazah Certified</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px', fontStyle: 'italic' }}>
                "Graduated from Al-Azhar University, specializing in Tajweed Rules and Quran Recitation pedagogy with over 8 years of teaching experience."
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-hover)', fontWeight: 700, marginTop: '12px' }}>
                [CONFIRM: tutor bio needed]
              </div>
            </div>

            {/* Tutor 2 */}
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-deep)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--gold-accent)',
                boxShadow: 'var(--shadow-gold)',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700
              }}>
                UF
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '4px' }}>Ustadha Fatima</h3>
              <span className="badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Female Tutor Directory</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px', fontStyle: 'italic' }}>
                "Specialist Quran memorization (Hifz) tutor for children and sisters. Holds multiple Ijazahs in Hafs 'an 'Asim recitation."
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-hover)', fontWeight: 700, marginTop: '12px' }}>
                [CONFIRM: tutor bio needed]
              </div>
            </div>

            {/* Tutor 3 */}
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-deep)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--gold-accent)',
                boxShadow: 'var(--shadow-gold)',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700
              }}>
                SY
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '4px' }}>Sheikh Yasir</h3>
              <span className="badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Islamic Studies Lead</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px', fontStyle: 'italic' }}>
                "Completed higher studies in Medina, teaching Islamic theology (Aqeedah), jurisprudential basics (Fiqh), and prophetic history (Seerah)."
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-hover)', fontWeight: 700, marginTop: '12px' }}>
                [CONFIRM: tutor bio needed]
              </div>
            </div>
          </div>
        </div>
      </section>

      <CalligraphyDivider />

      {/* FAQ Accordion Section */}
      <section id="faq" className="section-padding scroll-reveal" style={{ background: 'rgba(26, 71, 49, 0.03)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="max-width-container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-emerald" style={{ marginBottom: '10px', display: 'inline-block' }}>Support FAQ</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-deep)' }}>Frequently Asked Questions</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel" 
                style={{ 
                  padding: '20px 24px', 
                  cursor: 'pointer',
                  borderColor: openFaq === idx ? 'var(--gold-accent)' : 'var(--border-glass)',
                  backgroundColor: openFaq === idx ? '#ffffff' : 'var(--bg-card)',
                }}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', flex: 1, color: 'var(--primary-deep)' }}>
                    <HelpCircle size={18} color="var(--gold-accent)" />
                    {faq.q}
                  </h3>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </div>
                
                {openFaq === idx && (
                  <div style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid var(--border-glass)', 
                    color: 'var(--text-muted)', 
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CalligraphyDivider />

      {/* Floating Call to Action with 3D Tilt Effect */}
      <section id="contact" className="section-padding scroll-reveal">
        <div className="max-width-container" style={{ maxWidth: '900px' }}>
          <div className="glass-panel cta-tilt" style={{ padding: '50px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-mid) 0%, var(--primary-deep) 100%)', border: '1px solid var(--gold-accent)', boxShadow: 'var(--shadow-glow)' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', color: '#ffffff' }}>Have Any Questions?</h2>
            <p style={{ color: '#b3cbbd', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 30px' }}>
              If you want custom plan pricing or have technical queries, send us a WhatsApp message or speak with our support representatives on Teams.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              <a href="https://wa.me/923482648719" className="btn-accent" target="_blank" rel="noopener noreferrer">
                <Phone size={18} /> Chat on WhatsApp
              </a>
              <button onClick={() => {
                const el = document.getElementById('home');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} className="btn-primary" style={{ background: '#ffffff', color: 'var(--primary-deep) !important' }}>
                Book a Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero layout styling */}
      <style>{`
        .hero-grid {
          display: grid;
          gap: 30px;
          grid-template-columns: 1fr;
          align-items: center;
          width: 100%;
        }
        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.2fr 0.8fr 1fr;
          }
        }
        @media (max-width: 991px) {
          .three-d-medallion-container {
            display: none;
          }
        }
      `}</style>
      
    </div>
  );
};
