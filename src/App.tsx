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
    </div>
  );
}

export default App;
