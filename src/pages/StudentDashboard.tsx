import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';
import { Calendar, Video, Clock, DollarSign, Award, AlertCircle, RefreshCw, CreditCard, CheckCircle2 } from 'lucide-react';

interface StudentDashboardProps {
  profile: UserProfile;
}

interface EnrollmentWithTeacher {
  id: string;
  course_name: string;
  days_per_week: number;
  price_monthly: number;
  currency: string;
  status: string;
  teams_class_link: string;
  class_time: string;
  teacher: {
    full_name: string;
    teams_id: string;
  } | null;
}

interface AttendanceLog {
  id: string;
  class_date: string;
  status: 'present' | 'absent' | 'cancelled';
  notes: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'failed';
  billing_date: string;
  transaction_id: string | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ profile }) => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentWithTeacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  
  // Payment Modal state
  const [showPayModal, setShowPayModal] = useState<string | null>(null); // payment ID
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Active Enrollments
      const { data: enrollData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_name,
          days_per_week,
          price_monthly,
          currency,
          status,
          teams_class_link,
          class_time,
          teacher_id
        `)
        .eq('student_id', profile.id);

      if (enrollError) throw enrollError;

      const formattedEnrollments: EnrollmentWithTeacher[] = [];
      if (enrollData && enrollData.length > 0) {
        for (const enroll of enrollData) {
          let teacherInfo = null;
          if (enroll.teacher_id) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('full_name, teams_id')
              .eq('id', enroll.teacher_id)
              .single();
            if (profData) {
              teacherInfo = {
                full_name: profData.full_name,
                teams_id: profData.teams_id || '',
              };
            }
          }
          formattedEnrollments.push({
            id: enroll.id,
            course_name: enroll.course_name,
            days_per_week: enroll.days_per_week,
            price_monthly: enroll.price_monthly,
            currency: enroll.currency,
            status: enroll.status,
            teams_class_link: enroll.teams_class_link || '',
            class_time: enroll.class_time || 'Not Scheduled',
            teacher: teacherInfo,
          });
        }
      }
      setEnrollments(formattedEnrollments);

      // 2. Fetch Attendance Logs (for first active enrollment)
      if (formattedEnrollments.length > 0) {
        const { data: attData } = await supabase
          .from('attendance_logs')
          .select('id, class_date, status, notes')
          .eq('enrollment_id', formattedEnrollments[0].id)
          .order('class_date', { ascending: false })
          .limit(10);
        
        if (attData) setAttendance(attData as AttendanceLog[]);
      }

      // 3. Fetch Payments
      const { data: payData } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_method, status, billing_date, transaction_id')
        .eq('student_id', profile.id)
        .order('billing_date', { ascending: false });
      
      if (payData) setPayments(payData as PaymentRecord[]);

      // 4. Fetch Trials if no enrollment
      if (formattedEnrollments.length === 0) {
        const { data: trialData } = await supabase
          .from('trial_requests')
          .select('id, course_interest, status, scheduled_at, created_at')
          .eq('email', profile.email);
        if (trialData) setTrials(trialData);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [profile.id]);

  const handleMockPayment = async () => {
    if (!showPayModal) return;
    setPaying(true);

    try {
      const transactionId = 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          transaction_id: transactionId,
        })
        .eq('id', showPayModal);

      if (error) throw error;
      
      // Refresh
      await fetchDashboardData();
      setShowPayModal(null);
    } catch (err) {
      console.error(err);
      alert('Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  };

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'GBP') return '£';
    if (cur === 'PKR') return 'Rs. ';
    return '$';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={40} color="var(--emerald-bright)" />
        <span style={{ color: 'var(--text-muted)' }}>Loading Student Data...</span>
        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const activeEnrollment = enrollments[0];
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalSlots = activeEnrollment ? (activeEnrollment.days_per_week === 3 ? 72 : 120) : 72;
  const completionPercentage = activeEnrollment ? Math.min(100, Math.round((presentCount / totalSlots) * 100)) : 0;

  return (
    <div className="max-width-container animate-fade" style={{ padding: '24px 16px' }}>
      
      {/* Welcome Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-white)' }}>Assalam-o-Alaikum, {profile.full_name}!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to your student learning portal.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge-emerald">Student Profile</span>
          {activeEnrollment && <span className="badge-gold">Enrolled</span>}
        </div>
      </div>

      {!activeEnrollment ? (
        /* No active enrollment: Show trial options */
        <div className="grid-container grid-2" style={{ alignItems: 'start' }}>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--gold-accent)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle /> No Active Subscription
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              You are currently registered but do not have an active subscription package. 
            </p>
            <div style={{ background: 'rgba(20, 62, 47, 0.25)', borderTop: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-white)', marginBottom: '8px' }}>How to start learning:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <li>1. Book a Free Trial and verify class timings.</li>
                <li>2. Upon trial completion, check this portal to pay the initial invoice.</li>
                <li>3. Once payment is confirmed, your tutor and Teams links will appear here immediately.</li>
              </ul>
            </div>
            <button onClick={() => window.scrollTo(0,0)} className="btn-accent" style={{ width: '100%' }}>
              Book Free Trial on Website
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-white)', marginBottom: '16px' }}>My Trial Requests</h3>
            {trials.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No trial registrations found. Use the landing page form to request one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trials.map((trial) => (
                  <div key={trial.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{trial.course_interest}</span>
                      <span className={trial.status === 'pending' ? 'badge-gold' : 'badge-emerald'}>{trial.status}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Requested on: {new Date(trial.created_at).toLocaleDateString()}
                    </span>
                    {trial.scheduled_at && (
                      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
                        📅 Scheduled at: {new Date(trial.scheduled_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      ) : (
        /* Enrolled Student View */
        <div className="grid-container grid-3" style={{ alignItems: 'start' }}>
          
          {/* Main: Classes Card & Calendar */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Teams Live Classes Card */}
            <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--primary-mid) 0%, var(--primary-deep) 100%)', border: '1px solid var(--border-emerald)', boxShadow: 'var(--shadow-glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>{activeEnrollment.course_name}</span>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--text-white)', fontWeight: 700 }}>1-on-1 Live Class</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-highlight)' }}>
                  <Clock size={16} />
                  <span>Time: {activeEnrollment.class_time}</span>
                </div>
              </div>
              
              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Video size={24} color="var(--gold-accent)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-white)' }}>Assigned Tutor</h4>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {activeEnrollment.teacher ? activeEnrollment.teacher.full_name : 'Assigning Scholar...'}
                  </span>
                </div>
              </div>

              {activeEnrollment.teacher && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeEnrollment.teams_class_link && (
                    <a 
                      href={activeEnrollment.teams_class_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent"
                      style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Video size={18} /> Join Teams Class Meeting
                    </a>
                  )}
                  <a 
                    href={`https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(activeEnrollment.teacher.teams_id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Video size={18} /> Call Teacher on Teams
                  </a>
                </div>
              )}
            </div>

            {/* Attendance Logs & Comments List */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar /> Lesson History & Homework
              </h3>
              
              {attendance.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No lessons recorded yet. Your teacher will log status and homework here.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {attendance.map((log) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        background: 'rgba(7, 21, 16, 0.4)', 
                        border: '1px solid var(--border-glass)', 
                        padding: '16px', 
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: `4px solid ${log.status === 'present' ? 'var(--emerald-bright)' : log.status === 'absent' ? '#ef4444' : '#6b7280'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(log.class_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase',
                          color: log.status === 'present' ? 'var(--emerald-bright)' : log.status === 'absent' ? '#ef4444' : '#9ca3af'
                        }}>
                          {log.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-white)' }}>
                        <strong>Notes/Homework:</strong> {log.notes || 'No homework assigned.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Side: Progress & Payments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Progress Circular/Slider representation */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} color="var(--gold-accent)" /> Course Progress
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Syllabus Coverage</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold-accent)' }}>{completionPercentage}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald-bright), var(--gold-accent))', transition: 'var(--transition-smooth)' }}></div>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Present: {presentCount} of {totalSlots} curriculum milestones completed.
              </div>
            </div>

            {/* Invoices & Invoices portal */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={18} color="var(--emerald-bright)" /> Invoices & Billing
              </h3>
              
              {payments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No bills found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {payments.map((pay) => (
                    <div 
                      key={pay.id} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid var(--border-glass)', 
                        padding: '12px', 
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>
                          {getCurrencySymbol(pay.currency)}{pay.amount}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Due: {new Date(pay.billing_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {pay.status === 'paid' ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--emerald-bright)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <button 
                          onClick={() => setShowPayModal(pay.id)}
                          className="btn-accent" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Mock Payment Checkout Wizard Modal */}
      {showPayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            backgroundColor: 'var(--bg-dark)',
            border: '1px solid var(--border-emerald)',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard color="var(--gold-accent)" /> Secure Mock Checkout
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Simulate card payment to activate/renew your Al Kareem account instantly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Select Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="input-field"
                >
                  <option value="Card">Credit / Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>

              <div>
                <label className="input-label">Mock Card Number</label>
                <input 
                  type="text" 
                  placeholder="4111 2222 3333 4444" 
                  className="input-field" 
                  disabled={paymentMethod !== 'Card'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="input-field" disabled={paymentMethod !== 'Card'} />
                </div>
                <div>
                  <label className="input-label">CVV</label>
                  <input type="text" placeholder="123" className="input-field" disabled={paymentMethod !== 'Card'} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  onClick={() => setShowPayModal(null)} 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMockPayment} 
                  className="btn-accent" 
                  style={{ flex: 1 }}
                  disabled={paying}
                >
                  {paying ? 'Processing...' : 'Pay Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
