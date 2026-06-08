import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { 
  Shield, Users, Layers, Award, FileText, Calendar, Plus, UserCheck, 
  Trash2, RefreshCw, Edit, Pause, Play, CheckCircle2, XCircle,
  UserPlus, Eye, EyeOff, Check, Copy, ShieldAlert
} from 'lucide-react';

// Create a secondary Supabase client that doesn't save session state.
// This allows admins to register other accounts without signing themselves out.
const tempClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

interface TrialRequest {
  id: string;
  student_name: string;
  email: string;
  phone_number: string;
  country: string;
  gender_preference: string;
  course_interest: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  assigned_teacher_id?: string;
  scheduled_at?: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  teacher_id?: string;
  course_name: string;
  days_per_week: number;
  price_monthly: number;
  currency: string;
  status: 'active' | 'paused' | 'completed';
  teams_class_link?: string;
  class_time: string;
  created_at: string;
}

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'failed';
  billing_date: string;
  transaction_id?: string;
  created_at: string;
}

interface CreatedUserDetails {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
}

function generateRandomTransactionId(): string {
  return 'MANUAL_' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateRandomTeamsLink(): string {
  return `https://teams.microsoft.com/l/meetup-join/class_${Math.random().toString(36).substring(4)}`;
}

interface AdminDashboardProps {
  profile: UserProfile;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile }) => {
  const [loading, setLoading] = useState(true);

  
  // Analytics
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    trialsPending: 0,
    revenueTotal: 0,
  });

  // Data lists
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [trials, setTrials] = useState<TrialRequest[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Action forms state
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [assignTeacher, setAssignTeacher] = useState('');
  const [trialSchedule, setTrialSchedule] = useState('');

  // Add Enrollment Form state
  const [newStudentId, setNewStudentId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newCourse, setNewCourse] = useState('Quran Reading / Nazra');
  const [newDays, setNewDays] = useState(3);
  const [newPrice, setNewPrice] = useState(40);
  const [newTime, setNewTime] = useState('18:00 UTC');
  const [newTeamsLink, setNewTeamsLink] = useState('');

  // New states for LMS enhancements
  const [activeTrialTab, setActiveTrialTab] = useState<'pending' | 'scheduled' | 'history'>('pending');
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editClassTime, setEditClassTime] = useState('');
  const [editTeamsLink, setEditTeamsLink] = useState('');
  
  // Manual Invoice Form state
  const [invoiceStudentId, setInvoiceStudentId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState(40);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  // User creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRole, setCreateRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createCountry, setCreateCountry] = useState('United States');
  const [createGender, setCreateGender] = useState('male');
  const [createTeamsId, setCreateTeamsId] = useState('');
  
  // Student specific
  const [studentParentName, setStudentParentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentGenderPref, setStudentGenderPref] = useState('no_preference');
  
  // Teacher specific
  const [teacherBio, setTeacherBio] = useState('');
  const [teacherSpecialties, setTeacherSpecialties] = useState<string[]>(['Nazra', 'Tajweed']);
  const [teacherQualifications, setTeacherQualifications] = useState('');
  
  // UX states
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<CreatedUserDetails | null>(null); // will hold credential details
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetCreateForm = () => {
    setCreateEmail('');
    setCreatePassword('');
    setCreateFullName('');
    setCreatePhone('');
    setCreateCountry('United States');
    setCreateGender('male');
    setCreateTeamsId('');
    setStudentParentName('');
    setStudentAge('');
    setStudentGenderPref('no_preference');
    setTeacherBio('');
    setTeacherSpecialties(['Nazra', 'Tajweed']);
    setTeacherQualifications('');
    setCreateError(null);
    setCreateSuccess(null);
    setCreateLoading(false);
    setShowCreatePassword(false);
    setCopied(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCopied(false);

    try {
      // 1. Prepare user metadata based on selected role
      const metadata: Record<string, unknown> = {
        full_name: createFullName,
        role: createRole,
        country: createCountry,
        phone_number: createPhone,
        gender: createGender,
        teams_id: createTeamsId,
        skype_id: createTeamsId,
      };

      if (createRole === 'student') {
        metadata.parent_name = studentParentName || undefined;
        metadata.age = studentAge ? parseInt(studentAge, 10) : 10;
        metadata.gender_preference = studentGenderPref;
      } else if (createRole === 'teacher') {
        metadata.specialties = teacherSpecialties;
        metadata.qualifications = teacherQualifications ? teacherQualifications.split(',').map(q => q.trim()) : ['Certified Scholar'];
        metadata.bio = teacherBio || 'Quran teacher at Al Kareem Quran Institute';
      }

      // 2. Register user with temporary client so admin doesn't log out
      const { data, error } = await tempClient.auth.signUp({
        email: createEmail,
        password: createPassword,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('User creation failed. No user object returned.');

      // 3. Success! Set data for copy board
      setCreateSuccess({
        email: createEmail,
        password: createPassword,
        role: createRole,
        name: createFullName,
      });

      // 4. Reload directory data
      await fetchAdminData();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setCreateError(errorMsg || 'An error occurred during account registration.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createSuccess) return;
    const text = `Al Kareem Quran Institute Account Details:\n\nEmail: ${createSuccess.email}\nPassword: ${createSuccess.password}\nRole: ${createSuccess.role.toUpperCase()}\nName: ${createSuccess.name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Profiles
      const { data: profData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const profsList = profData as UserProfile[] || [];
      setProfiles(profsList);


      // 3. Trial Requests
      const { data: trialData } = await supabase.from('trial_requests').select('*').order('created_at', { ascending: false });
      setTrials(trialData || []);

      // 4. Enrollments
      const { data: enrollData } = await supabase.from('enrollments').select('*');
      setEnrollments(enrollData || []);

      // 5. Payments
      const { data: payData } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      setPayments(payData || []);

      // Calculate Stats
      const students = profsList.filter(p => p.role === 'student');
      const activeTeachers = profsList.filter(p => p.role === 'teacher');
      const pendingTrials = (trialData || []).filter(t => t.status === 'pending');
      const revenue = (payData || [])
        .filter(p => p.status === 'paid')
        .reduce((sum, current) => sum + Number(current.amount), 0);

      setStats({
        studentsCount: students.length,
        teachersCount: activeTeachers.length,
        trialsPending: pendingTrials.length,
        revenueTotal: revenue,
      });

      if (activeTeachers.length > 0) {
        setAssignTeacher(activeTeachers[0].id);
      }
      if (students.length > 0) {
        setNewStudentId(students[0].id);
        setInvoiceStudentId(students[0].id);
      }
      if (activeTeachers.length > 0) {
        setNewTeacherId(activeTeachers[0].id);
      }

    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [profile.id]);

  const handlePromoteUser = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      // If promoting to teacher, make sure they exist in the teachers table
      if (newRole === 'teacher') {
        const { data: teacherExists } = await supabase.from('teachers').select('id').eq('id', userId).single();
        if (!teacherExists) {
          await supabase.from('teachers').insert([
            { id: userId, gender: 'female', is_active: true }
          ]);
        }
      }
      
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to promote user.');
    }
  };

  const handleScheduleTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('trial_requests')
        .update({
          status: 'scheduled',
          assigned_teacher_id: assignTeacher,
          scheduled_at: trialSchedule,
        })
        .eq('id', selectedRequest);

      if (error) throw error;
      
      await fetchAdminData();
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      alert('Failed to schedule trial class.');
    }
  };

  const handleCreateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newTeacherId) return;

    try {
      // 1. Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: newStudentId,
            teacher_id: newTeacherId,
            course_name: newCourse,
            days_per_week: newDays,
            price_monthly: newPrice,
            currency: 'USD',
            status: 'active',
            teams_class_link: newTeamsLink || generateRandomTeamsLink(),
            class_time: newTime,
          }
        ]);

      if (enrollError) throw enrollError;

      // 2. Generate initial payment invoice automatically
      await supabase.from('payments').insert([
        {
          student_id: newStudentId,
          amount: newPrice,
          currency: 'USD',
          payment_method: 'Card',
          status: 'pending',
          billing_date: new Date().toISOString().split('T')[0],
        }
      ]);

      await fetchAdminData();
      setNewTeamsLink('');
    } catch (err) {
      console.error(err);
      alert('Failed to schedule enrollment.');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user profile? (This cannot be undone)')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  const handleUpdateTrialStatus = async (trialId: string, nextStatus: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('trial_requests')
        .update({ status: nextStatus })
        .eq('id', trialId);

      if (error) throw error;
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update trial status.');
    }
  };

  const handleDeleteTrialRequest = async (trialId: string) => {
    if (!confirm('Are you sure you want to delete this trial request record?')) return;
    try {
      const { error } = await supabase
        .from('trial_requests')
        .delete()
        .eq('id', trialId);

      if (error) throw error;
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete trial request.');
    }
  };

  const startEditEnrollment = (enroll: Enrollment) => {
    setEditingEnrollmentId(enroll.id);
    setEditTeacherId(enroll.teacher_id || '');
    setEditClassTime(enroll.class_time || '');
    setEditTeamsLink(enroll.teams_class_link || '');
  };

  const handleUpdateEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({
          teacher_id: editTeacherId || null,
          class_time: editClassTime,
          teams_class_link: editTeamsLink,
        })
        .eq('id', enrollmentId);

      if (error) throw error;
      
      await fetchAdminData();
      setEditingEnrollmentId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update enrollment.');
    }
  };

  const handleToggleEnrollmentStatus = async (enrollmentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' 
      ? 'paused' 
      : currentStatus === 'paused' 
      ? 'completed' 
      : 'active';
    
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: nextStatus })
        .eq('id', enrollmentId);

      if (error) throw error;
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update enrollment status.');
    }
  };

  const handleMarkPaymentPaid = async (paymentId: string) => {
    try {
      const transactionId = generateRandomTransactionId();
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_method: 'Manual/Offline',
          transaction_id: transactionId,
        })
        .eq('id', paymentId);

      if (error) throw error;
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to mark payment as paid.');
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceStudentId || !invoiceAmount) return;

    try {
      const { error } = await supabase.from('payments').insert([
        {
          student_id: invoiceStudentId,
          amount: invoiceAmount,
          currency: 'USD',
          payment_method: 'Manual/Offline',
          status: 'pending',
          billing_date: invoiceDate,
        }
      ]);

      if (error) throw error;
      await fetchAdminData();
      setShowInvoiceForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to generate manual invoice.');
    }
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={40} color="var(--emerald-bright)" />
        <span style={{ color: 'var(--text-muted)' }}>Loading Control Panel...</span>
      </div>
    );
  }

  const studentsList = profiles.filter(p => p.role === 'student');
  const teachersList = profiles.filter(p => p.role === 'teacher');
  const pendingTrials = trials.filter(t => t.status === 'pending');
  const scheduledTrials = trials.filter(t => t.status === 'scheduled');
  const historyTrials = trials.filter(t => t.status === 'completed' || t.status === 'cancelled');

  return (
    <div className="max-width-container animate-fade" style={{ padding: '24px 16px' }}>
      
      {/* Welcome Board */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-white)' }}>Admin Console</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage Al Kareem's database, class assignments, and payments.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="btn-accent"
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <UserPlus size={16} /> Create User / Admin
          </button>
          <span className="badge-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: 'fit-content' }}>
            <Shield size={14} /> Full Administrative Access
          </span>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid-container grid-4" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--emerald-glow)', border: '1px solid var(--emerald-bright)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <Users size={24} color="var(--emerald-bright)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Students</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.studentsCount}</span>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--emerald-glow)', border: '1px solid var(--emerald-bright)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <UserCheck size={24} color="var(--emerald-bright)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Teachers</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.teachersCount}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-accent)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <Layers size={24} color="var(--gold-accent)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Trials</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.trialsPending}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-accent)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <Award size={24} color="var(--gold-accent)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Revenue</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-bright)' }}>${stats.revenueTotal}</span>
          </div>
        </div>
      </div>

      <div className="grid-container grid-3" style={{ alignItems: 'start', marginBottom: '32px' }}>
        
        {/* Trial Request Manager */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px', minHeight: '350px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar /> Trial Requests Management
            </h3>

            {/* Trial Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              {(['pending', 'scheduled', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTrialTab(tab);
                    setSelectedRequest(null);
                  }}
                  style={{
                    background: activeTrialTab === tab ? 'var(--emerald-bright)' : 'none',
                    border: 'none',
                    color: 'var(--text-white)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'history' ? 'Completed & Cancelled' : `${tab} trials`}
                </button>
              ))}
            </div>
            
            {activeTrialTab === 'pending' && (
              pendingTrials.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending trial requests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingTrials.map((req) => (
                    <div key={req.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--text-white)' }}>{req.student_name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                            ✉️ {req.email} | 📞 {req.phone_number} | 🌍 {req.country}
                          </span>
                        </div>
                        <span className="badge-gold">{req.course_interest}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-highlight)' }}>
                          Preference: {req.gender_preference === 'no_preference' ? 'No Preference' : `${req.gender_preference} Tutor`}
                        </span>
                        <button 
                          onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)}
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Schedule Trial
                        </button>
                      </div>

                      {/* Schedule Form expand inline */}
                      {selectedRequest === req.id && (
                        <form onSubmit={handleScheduleTrial} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label className="input-label">Assign Teacher</label>
                              <select 
                                value={assignTeacher} 
                                onChange={(e) => setAssignTeacher(e.target.value)} 
                                className="input-field"
                              >
                                {teachersList.map((teacher) => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.full_name} ({teacher.gender})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="input-label">Schedule Time</label>
                              <input 
                                type="datetime-local" 
                                value={trialSchedule} 
                                onChange={(e) => setTrialSchedule(e.target.value)} 
                                className="input-field"
                                required 
                              />
                            </div>
                          </div>
                          <button type="submit" className="btn-accent" style={{ padding: '10px' }}>
                            Confirm Schedule & Assign
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTrialTab === 'scheduled' && (
              scheduledTrials.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No scheduled trials.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {scheduledTrials.map((req) => {
                    const tutorName = profiles.find(p => p.id === req.assigned_teacher_id)?.full_name || 'Assigned Tutor';
                    return (
                      <div key={req.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-white)' }}>{req.student_name}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                              ✉️ {req.email} | 📞 {req.phone_number} | 🌍 {req.country}
                            </span>
                          </div>
                          <span className="badge-gold">{req.course_interest}</span>
                        </div>
                        
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--border-emerald)', borderRadius: 'var(--radius-sm)', padding: '10px', marginTop: '10px', fontSize: '0.85rem' }}>
                          <div>🧑‍🏫 <strong>Tutor:</strong> {tutorName}</div>
                          <div style={{ marginTop: '4px' }}>📅 <strong>Time:</strong> {req.scheduled_at ? new Date(req.scheduled_at).toLocaleString() : 'Pending'}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleUpdateTrialStatus(req.id, 'completed')}
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--emerald-bright)' }}
                          >
                            <CheckCircle2 size={12} /> Mark Completed
                          </button>
                          <button 
                            onClick={() => handleUpdateTrialStatus(req.id, 'cancelled')}
                            style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#ef4444', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <XCircle size={12} /> Cancel Trial
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTrialTab === 'history' && (
              historyTrials.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No history records found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {historyTrials.map((req) => {
                    const tutorName = profiles.find(p => p.id === req.assigned_teacher_id)?.full_name || 'Tutor not assigned';
                    return (
                      <div key={req.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-white)' }}>{req.student_name}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                              ✉️ {req.email} | 🌍 {req.country} | Tutor: {tutorName}
                            </span>
                          </div>
                          <span className={req.status === 'completed' ? 'badge-emerald' : 'badge-gold'} style={{ borderColor: req.status === 'completed' ? '' : '#ef4444', color: req.status === 'completed' ? '' : '#f87171', background: req.status === 'completed' ? '' : 'rgba(239, 68, 68, 0.15)' }}>
                            {req.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button 
                            onClick={() => handleDeleteTrialRequest(req.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} /> Delete Record
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

          </div>
        </div>

        {/* Quick Scheduler (Create Enrollments) */}
        <div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus /> Create Live Enrollment
            </h3>
            
            {studentsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No student profiles registered to assign courses.</p>
            ) : (
              <form onSubmit={handleCreateEnrollment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="input-label">Student</label>
                  <select value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} className="input-field">
                    {studentsList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="input-label">Teacher</label>
                  <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} className="input-field">
                    {teachersList.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label">Course</label>
                    <select value={newCourse} onChange={(e) => setNewCourse(e.target.value)} className="input-field">
                      <option value="Quran Reading / Nazra">Nazra</option>
                      <option value="Tajweed Rules Course">Tajweed</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Days/Week</label>
                    <select value={newDays} onChange={(e) => setNewDays(Number(e.target.value))} className="input-field">
                      <option value={3}>3 Days</option>
                      <option value={5}>5 Days</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label">Price ($)</label>
                    <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Class Time</label>
                    <input type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="input-field" required />
                  </div>
                </div>

                <button type="submit" className="btn-accent" style={{ width: '100%', padding: '10px' }}>
                  Assign & Activate Enrollment
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Active Student Enrollments Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers /> Active Student Enrollments ({enrollments.length})
        </h3>
        
        {enrollments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active enrollments found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {enrollments.map((enroll) => {
              const studentName = profiles.find(p => p.id === enroll.student_id)?.full_name || 'Student';
              const teacherName = profiles.find(p => p.id === enroll.teacher_id)?.full_name || 'Tutor not assigned';
              const isEditing = editingEnrollmentId === enroll.id;
              
              return (
                <div 
                  key={enroll.id} 
                  style={{ 
                    background: 'rgba(7, 21, 16, 0.4)', 
                    border: '1px solid var(--border-glass)', 
                    padding: '20px', 
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `4px solid ${enroll.status === 'active' ? 'var(--emerald-bright)' : enroll.status === 'paused' ? 'var(--gold-accent)' : 'rgba(255, 255, 255, 0.2)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-white)', display: 'block' }}>{studentName}</strong>
                      <span className="badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: '4px', display: 'inline-block' }}>{enroll.course_name}</span>
                    </div>
                    <span 
                      className={enroll.status === 'active' ? 'badge-emerald' : enroll.status === 'paused' ? 'badge-gold' : 'badge-gold'}
                      style={{ 
                        height: 'fit-content',
                        borderColor: enroll.status === 'active' ? '' : enroll.status === 'paused' ? '' : 'rgba(255, 255, 255, 0.3)',
                        color: enroll.status === 'active' ? '' : enroll.status === 'paused' ? '' : 'rgba(255, 255, 255, 0.5)',
                        background: enroll.status === 'active' ? '' : enroll.status === 'paused' ? '' : 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {enroll.status}
                    </span>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      <div>
                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Assign Tutor</label>
                        <select 
                          value={editTeacherId} 
                          onChange={(e) => setEditTeacherId(e.target.value)} 
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          <option value="">No Tutor Assigned</option>
                          {teachersList.map((t) => (
                            <option key={t.id} value={t.id}>{t.full_name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Class Time</label>
                        <input 
                          type="text" 
                          value={editClassTime} 
                          onChange={(e) => setEditClassTime(e.target.value)} 
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Teams Class Link</label>
                        <input 
                          type="text" 
                          value={editTeamsLink} 
                          onChange={(e) => setEditTeamsLink(e.target.value)} 
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button 
                          onClick={() => handleUpdateEnrollment(enroll.id)}
                          className="btn-accent" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingEnrollmentId(null)}
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', margin: '12px 0' }}>
                        <div>🧑‍🏫 <strong>Tutor:</strong> <span style={{ color: 'var(--text-white)' }}>{teacherName}</span></div>
                        <div>📅 <strong>Schedule:</strong> <span style={{ color: 'var(--text-white)' }}>{enroll.days_per_week} days/week at {enroll.class_time}</span></div>
                        <div>💰 <strong>Rate:</strong> <span style={{ color: 'var(--text-white)' }}>${enroll.price_monthly}/mo</span></div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🌐 <strong>Teams:</strong> <a href={enroll.teams_class_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald-bright)', textDecoration: 'underline' }}>{enroll.teams_class_link || 'No Link Set'}</a></div>
                      </div>

                      <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)', margin: '12px 0' }} />

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => startEditEnrollment(enroll)}
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit size={12} /> Edit Details
                        </button>
                        
                        <button 
                          onClick={() => handleToggleEnrollmentStatus(enroll.id, enroll.status)}
                          className="btn-primary" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.75rem', 
                            background: enroll.status === 'active' ? 'var(--gold-accent)' : enroll.status === 'paused' ? 'var(--emerald-bright)' : 'var(--primary-light)',
                            color: enroll.status === 'active' ? 'var(--primary-deep)' : '#fff'
                          }}
                        >
                          {enroll.status === 'active' && <><Pause size={12} /> Pause</>}
                          {enroll.status === 'paused' && <><Play size={12} /> Resume</>}
                          {enroll.status === 'completed' && <><RefreshCw size={12} /> Reactivate</>}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Directory Section */}
      <div className="grid-container grid-3" style={{ alignItems: 'start' }}>
        
        {/* User Manager / Role promotion */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users /> User Profiles Directory ({profiles.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
              {profiles.map((p) => (
                <div 
                  key={p.id} 
                  style={{ 
                    background: 'rgba(7, 21, 16, 0.4)', 
                    border: '1px solid var(--border-glass)', 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-white)' }}>{p.full_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                      {p.email} | Teams ID: {p.teams_id || 'none'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={p.role}
                      onChange={(e) => handlePromoteUser(p.id, e.target.value as UserProfile['role'])}
                      className="input-field"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '110px' }}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    
                    {p.id !== profile.id && (
                      <button 
                        onClick={() => handleDeleteProfile(p.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payments verification */}
        <div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FileText /> Invoices Log ({payments.length})
              </h3>
              <button 
                onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                className="btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-emerald)' }}
              >
                {showInvoiceForm ? 'Close Form' : '+ Record Bill'}
              </button>
            </div>

            {showInvoiceForm && (
              <form onSubmit={handleGenerateInvoice} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-white)', fontWeight: 600 }}>Generate Student Invoice</h4>
                <div>
                  <label className="input-label" style={{ fontSize: '0.7rem' }}>Select Student</label>
                  <select 
                    value={invoiceStudentId} 
                    onChange={(e) => setInvoiceStudentId(e.target.value)} 
                    className="input-field"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  >
                    {studentsList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>Amount ($)</label>
                    <input 
                      type="number" 
                      value={invoiceAmount} 
                      onChange={(e) => setInvoiceAmount(Number(e.target.value))} 
                      className="input-field" 
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      required 
                    />
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>Billing Date</label>
                    <input 
                      type="date" 
                      value={invoiceDate} 
                      onChange={(e) => setInvoiceDate(e.target.value)} 
                      className="input-field" 
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn-accent" style={{ padding: '8px', fontSize: '0.8rem', width: '100%' }}>
                  Generate Invoice
                </button>
              </form>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto' }}>
              {payments.map((p) => {
                const sName = profiles.find(pr => pr.id === p.student_id)?.full_name || 'Student';
                return (
                  <div 
                    key={p.id} 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--border-glass)', 
                      padding: '12px', 
                      borderRadius: 'var(--radius-sm)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{sName}</span>
                      <span className={p.status === 'paid' ? 'badge-emerald' : 'badge-gold'} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Amount: ${p.amount} ({p.payment_method})
                      </span>
                      {p.status === 'pending' && (
                        <button 
                          onClick={() => handleMarkPaymentPaid(p.id)}
                          className="btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '4px', height: 'auto', background: 'var(--emerald-bright)', border: 'none', color: '#fff', boxShadow: 'none' }}
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Date: {new Date(p.billing_date).toLocaleDateString()}
                    </div>
                    {p.transaction_id && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', overflowX: 'hidden' }}>
                        TXN: {p.transaction_id}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Create User/Admin Modal Overlay */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => {
          if (!createLoading) setShowCreateModal(false);
        }}>
          <div 
            className={`modal-content ${createRole === 'admin' ? 'glowing-border-gold' : 'glowing-border-emerald'}`} 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '24px 28px 20px 28px', 
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(26, 71, 49, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  background: createRole === 'admin' ? 'var(--gold-glow)' : 'var(--emerald-glow)', 
                  border: `1px solid ${createRole === 'admin' ? 'var(--gold-accent)' : 'var(--emerald-bright)'}`,
                  padding: '8px', 
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: createRole === 'admin' ? 'var(--gold-accent)' : 'var(--emerald-bright)'
                }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-white)', margin: 0, fontWeight: 700 }}>
                    Create New Account
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Register and auto-generate database profiles
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (!createLoading) setShowCreateModal(false);
                }} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: '1',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={createLoading}
              >
                &times;
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="modal-form-scroll" style={{ flex: 1, padding: '24px 28px' }}>
              {createSuccess ? (
                /* SUCCESS SCREEN */
                <div style={{ textAlign: 'center', padding: '16px 0' }} className="animate-fade">
                  <div className="success-ripple-circle">
                    <Check size={40} strokeWidth={3} />
                  </div>
                  <h4 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '8px' }}>
                    Account Registered Successfully!
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                    The user has been registered in Supabase Auth and database tables.
                  </p>

                  <div style={{ 
                    background: 'rgba(26, 71, 49, 0.03)', 
                    border: '1px solid var(--border-emerald)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '20px', 
                    textAlign: 'left',
                    marginBottom: '28px',
                    position: 'relative'
                  }}>
                    <span className="badge-emerald" style={{ 
                      position: 'absolute', 
                      top: '16px', 
                      right: '16px', 
                      fontSize: '0.65rem' 
                    }}>
                      {createSuccess.role}
                    </span>

                    <h5 style={{ color: 'var(--text-white)', fontSize: '1rem', marginBottom: '14px', fontWeight: 600 }}>
                      User Details & Credentials
                    </h5>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-muted)' }}>Name:</strong>{' '}
                        <span style={{ color: 'var(--text-white)', fontWeight: 500 }}>{createSuccess.name}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-muted)' }}>Email:</strong>{' '}
                        <span style={{ color: 'var(--text-white)', fontWeight: 500 }}>{createSuccess.email}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-muted)' }}>Password:</strong>{' '}
                        <span style={{ color: 'var(--text-white)', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600 }}>
                          {createSuccess.password}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      type="button"
                      onClick={handleCopyCredentials}
                      className="btn-accent"
                      style={{ width: '100%', padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {copied ? (
                        <><Check size={16} /> Copied to Clipboard!</>
                      ) : (
                        <><Copy size={16} /> Copy Account Details</>
                      )}
                    </button>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <button 
                        type="button"
                        onClick={resetCreateForm}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '10px' }}
                      >
                        Create Another
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* FORM SCREEN */
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Role Selection Tabs */}
                  <div>
                    <label className="input-label" style={{ marginBottom: '8px' }}>Select Account Role</label>
                    <div style={{ 
                      display: 'flex', 
                      background: 'rgba(7, 21, 16, 0.04)', 
                      border: '1px solid var(--border-glass)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '4px',
                      position: 'relative'
                    }}>
                      {/* Sliding active line indicator */}
                      <div className="role-tab-active-line" style={{
                        width: '33.333%',
                        transform: createRole === 'student' ? 'translateX(0%)' : createRole === 'teacher' ? 'translateX(100%)' : 'translateX(200%)',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        background: createRole === 'admin' 
                          ? 'rgba(201, 168, 76, 0.15)' 
                          : 'rgba(21, 128, 61, 0.08)',
                        borderBottom: `2px solid ${createRole === 'admin' ? 'var(--gold-accent)' : 'var(--emerald-bright)'}`,
                        borderRadius: '6px',
                        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                        zIndex: 0
                      }}></div>

                      {(['student', 'teacher', 'admin'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setCreateRole(role)}
                          style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            color: createRole === role ? 'var(--text-white)' : 'var(--text-muted)',
                            padding: '10px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            zIndex: 1,
                            textTransform: 'capitalize',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Account Credentials */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="animate-fade">
                    <div>
                      <label className="input-label">Email Address</label>
                      <input 
                        type="email" 
                        value={createEmail} 
                        onChange={(e) => setCreateEmail(e.target.value)} 
                        className="input-field" 
                        placeholder="user@alkareem.com"
                        required 
                      />
                    </div>
                    <div>
                      <label className="input-label">Password</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showCreatePassword ? 'text' : 'password'} 
                          value={createPassword} 
                          onChange={(e) => setCreatePassword(e.target.value)} 
                          className="input-field" 
                          placeholder="Min 6 chars"
                          minLength={6}
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword(!showCreatePassword)}
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
                            alignItems: 'center'
                          }}
                        >
                          {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Full Name & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="input-label">Full Name</label>
                      <input 
                        type="text" 
                        value={createFullName} 
                        onChange={(e) => setCreateFullName(e.target.value)} 
                        className="input-field" 
                        placeholder="e.g. Abdullah Khan"
                        required 
                      />
                    </div>
                    <div>
                      <label className="input-label">Phone / WhatsApp</label>
                      <input 
                        type="tel" 
                        value={createPhone} 
                        onChange={(e) => setCreatePhone(e.target.value)} 
                        className="input-field" 
                        placeholder="e.g. +1 (555) 019-2834"
                        required 
                      />
                    </div>
                  </div>

                  {/* Country & Gender & Teams ID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="input-label">Country</label>
                      <select 
                        value={createCountry} 
                        onChange={(e) => setCreateCountry(e.target.value)} 
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
                        value={createGender} 
                        onChange={(e) => setCreateGender(e.target.value)} 
                        className="input-field"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Teams ID</label>
                      <input 
                        type="text" 
                        value={createTeamsId} 
                        onChange={(e) => setCreateTeamsId(e.target.value)} 
                        className="input-field" 
                        placeholder="e.g. name@outlook.com"
                        required 
                      />
                    </div>
                  </div>

                  {/* CONDITIONAL SUB-FORMS */}
                  
                  {/* STUDENT ROLE */}
                  {createRole === 'student' && (
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(21, 128, 61, 0.02)', 
                      border: '1px solid rgba(21, 128, 61, 0.15)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }} className="animate-slide-up">
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-deep)', borderBottom: '1px solid rgba(21, 128, 61, 0.1)', paddingBottom: '6px', fontWeight: 600 }}>
                        Student Enrolment Details
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', gap: '14px' }}>
                        <div>
                          <label className="input-label" style={{ fontSize: '0.75rem' }}>Parent Name (For Minors)</label>
                          <input 
                            type="text" 
                            value={studentParentName} 
                            onChange={(e) => setStudentParentName(e.target.value)} 
                            className="input-field" 
                            placeholder="Father/Mother name"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div>
                          <label className="input-label" style={{ fontSize: '0.75rem' }}>Age</label>
                          <input 
                            type="number" 
                            value={studentAge} 
                            onChange={(e) => setStudentAge(e.target.value)} 
                            className="input-field" 
                            placeholder="e.g. 10"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            min={4}
                            max={90}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Tutor Gender Preference</label>
                        <select 
                          value={studentGenderPref} 
                          onChange={(e) => setStudentGenderPref(e.target.value)} 
                          className="input-field"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          <option value="no_preference">No Preference (Male or Female Tutor)</option>
                          <option value="female">Female Tutor Only (Highly recommended for sisters)</option>
                          <option value="male">Male Tutor Only</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* TEACHER ROLE */}
                  {createRole === 'teacher' && (
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(21, 128, 61, 0.02)', 
                      border: '1px solid rgba(21, 128, 61, 0.15)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }} className="animate-slide-up">
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-deep)', borderBottom: '1px solid rgba(21, 128, 61, 0.1)', paddingBottom: '6px', fontWeight: 600 }}>
                        Teacher Profile Details
                      </h4>
                      <div>
                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Teacher Bio / Experience Summary</label>
                        <textarea 
                          value={teacherBio} 
                          onChange={(e) => setTeacherBio(e.target.value)} 
                          className="input-field" 
                          placeholder="Experienced Quran teacher specializing in Tajweed and Nazra..."
                          rows={2}
                          style={{ padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                          required
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="input-label" style={{ fontSize: '0.75rem' }}>Qualifications (Comma separated)</label>
                          <input 
                            type="text" 
                            value={teacherQualifications} 
                            onChange={(e) => setTeacherQualifications(e.target.value)} 
                            className="input-field" 
                            placeholder="e.g. Alim degree, Ijazah Certified"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            required
                          />
                        </div>
                        <div>
                          <label className="input-label" style={{ fontSize: '0.75rem' }}>Specialties</label>
                          <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-white)', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={teacherSpecialties.includes('Nazra')} 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTeacherSpecialties([...teacherSpecialties, 'Nazra']);
                                  } else {
                                    setTeacherSpecialties(teacherSpecialties.filter(s => s !== 'Nazra'));
                                  }
                                }}
                              />
                              Nazra
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-white)', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={teacherSpecialties.includes('Tajweed')} 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTeacherSpecialties([...teacherSpecialties, 'Tajweed']);
                                  } else {
                                    setTeacherSpecialties(teacherSpecialties.filter(s => s !== 'Tajweed'));
                                  }
                                }}
                              />
                              Tajweed
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADMIN ROLE */}
                  {createRole === 'admin' && (
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(201, 168, 76, 0.04)', 
                      border: '1px solid var(--gold-accent)', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }} className="animate-slide-up">
                      <ShieldAlert size={20} color="var(--gold-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--gold-hover)', fontWeight: 700, marginBottom: '4px' }}>
                          Warning: Administrative Privileges
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                          Creating an administrator account grants absolute control over all database operations, including student trial schedules, live class assignments, billing details, and active status profiles. Ensure this user is verified.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form Submission Error */}
                  {createError && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <XCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{createError}</span>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    borderTop: '1px solid var(--border-glass)', 
                    paddingTop: '20px', 
                    marginTop: '10px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn-secondary"
                      style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                      disabled={createLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ 
                        padding: '10px 24px', 
                        fontSize: '0.85rem',
                        background: createRole === 'admin' 
                          ? 'linear-gradient(135deg, var(--gold-accent) 0%, #b5933d 100%)' 
                          : 'linear-gradient(135deg, var(--primary-deep) 0%, var(--primary-light) 100%)',
                        color: createRole === 'admin' ? 'var(--primary-deep)' : '#fff',
                        fontWeight: 700
                      }}
                      disabled={createLoading}
                    >
                      {createLoading ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} />
                          <span>Registering Account...</span>
                        </>
                      ) : (
                        <>
                          {createRole === 'admin' ? <Shield size={14} /> : <UserPlus size={14} />}
                          <span>Create {createRole}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
