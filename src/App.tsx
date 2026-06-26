import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { UserProfile } from './lib/supabase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RefreshCw } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        setCurrentPage('dashboard');
      } else {
        setLoadingProfile(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        setCurrentPage('dashboard');
      } else {
        setProfile(null);
        setLoadingProfile(false);
        setCurrentPage('home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (loadingProfile) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
          <RefreshCw className="animate-spin" size={40} color="var(--emerald-bright)" />
          <span style={{ color: 'var(--text-muted)' }}>Syncing Authentication...</span>
          <style>{`
            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'dashboard':
        if (!profile) return <AuthPage onNavigate={handleNavigate} />;
        if (profile.role === 'admin') {
          return <AdminDashboard profile={profile} />;
        } else if (profile.role === 'teacher') {
          return <TeacherDashboard profile={profile} />;
        } else {
          return <StudentDashboard profile={profile} />;
        }
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Aurora Ambient Background */}
      <div className="aurora-bg"></div>

      {/* Main Header */}
      <Header profile={profile} onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Dynamic View Content */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {renderPage()}
      </main>

      {/* Main Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating WhatsApp Widget */}
      <a 
        href="https://wa.me/923482648719" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <span className="whatsapp-pulse"></span>
        <span className="whatsapp-tooltip">Chat with us on WhatsApp</span>
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.013-5.101-2.86-6.95C16.63 1.953 14.159.93 11.53.93c-5.439 0-9.863 4.42-9.867 9.853-.001 1.77.463 3.5 1.34 5.02L2.005 22l6.3-1.654-.358-.22zm9.838-6.175c-.244-.122-1.444-.712-1.668-.794-.223-.081-.385-.122-.547.122-.162.244-.629.794-.771.956-.142.162-.284.183-.528.061-.244-.122-1.03-.38-1.962-1.211-.725-.647-1.215-1.446-1.357-1.69-.142-.244-.015-.376.107-.497.111-.11.244-.284.365-.426.122-.142.162-.244.243-.406.081-.162.041-.305-.02-.427-.06-.122-.547-1.319-.75-1.808-.197-.475-.397-.411-.547-.419-.142-.008-.305-.009-.467-.009-.162 0-.427.061-.65.305-.224.244-.854.834-.854 2.031 0 1.197.872 2.351.994 2.514.122.162 1.716 2.62 4.158 3.678.58.252 1.034.402 1.386.514.584.185 1.116.159 1.537.096.47-.07 1.444-.59 1.648-1.159.203-.569.203-1.057.142-1.159-.06-.101-.223-.162-.467-.284z"/>
        </svg>
      </a>
    </div>
  );
}

export default App;

