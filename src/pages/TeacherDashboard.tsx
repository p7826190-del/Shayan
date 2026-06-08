import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';
import { Users, Video, Calendar, AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface TeacherDashboardProps {
  profile: UserProfile;
}

interface AssignedStudent {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  student_teams: string;
  course_name: string;
  days_per_week: number;
  class_time: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ profile }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  
  // Attendance logging form state
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'present' | 'absent' | 'cancelled'>('present');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Teacher Profile state
  const [bio, setBio] = useState('');
  const [specialtiesInput, setSpecialtiesInput] = useState('');
  const [qualificationsInput, setQualificationsInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    const specs = specialtiesInput.split(',').map(s => s.trim()).filter(Boolean);
    const quals = qualificationsInput.split(',').map(q => q.trim()).filter(Boolean);

    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          bio,
          specialties: specs,
          qualifications: quals,
        })
        .eq('id', profile.id);

      if (error) throw error;
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error(err);
      setProfileMessage({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const { data: enrollData, error: enrollError } = await supabase
        .from('enrollments')
        .select('id, student_id, course_name, days_per_week, class_time')
        .eq('teacher_id', profile.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      const list: AssignedStudent[] = [];
      if (enrollData && enrollData.length > 0) {
        for (const enroll of enrollData) {
          const { data: studentProf } = await supabase
            .from('profiles')
            .select('full_name, teams_id')
            .eq('id', enroll.student_id)
            .single();
          
          if (studentProf) {
            list.push({
              enrollment_id: enroll.id,
              student_id: enroll.student_id,
              student_name: studentProf.full_name,
              student_teams: studentProf.teams_id || '',
              course_name: enroll.course_name,
              days_per_week: enroll.days_per_week,
              class_time: enroll.class_time || 'Not set',
            });
          }
        }
      }
      setStudents(list);
      if (list.length > 0) {
        setSelectedEnrollment(list[0].enrollment_id);
      }

      // Fetch teacher metadata
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('bio, specialties, qualifications')
        .eq('id', profile.id)
        .single();
      
      if (teacherData) {
        setBio(teacherData.bio || '');
        setSpecialtiesInput((teacherData.specialties || []).join(', '));
        setQualificationsInput((teacherData.qualifications || []).join(', '));
      }
    } catch (err) {
      console.error('Error loading teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [profile.id]);

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) {
      setSubmitMessage({ type: 'error', text: 'Please select a student.' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const { error } = await supabase.from('attendance_logs').insert([
        {
          enrollment_id: selectedEnrollment,
          class_date: classDate,
          status,
          notes,
        }
      ]);

      if (error) throw error;

      setSubmitMessage({ type: 'success', text: 'Attendance and homework logged successfully!' });
      setNotes('');
    } catch (err: any) {
      console.error(err);
      setSubmitMessage({ type: 'error', text: err.message || 'Error logging attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={40} color="var(--emerald-bright)" />
        <span style={{ color: 'var(--text-muted)' }}>Loading Teacher Portal...</span>
      </div>
    );
  }

  return (
    <div className="max-width-container animate-fade" style={{ padding: '24px 16px' }}>
      
      {/* Welcome Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-white)' }}>Teacher Portal - {profile.full_name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Log your classes and communicate homework to students.</p>
        </div>
        <span className="badge-gold">Teacher / Scholar</span>
      </div>

      {students.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--gold-accent)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Assigned Students</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            You do not currently have any active student enrollments assigned by the administration.
          </p>
        </div>
      ) : (
        <div className="grid-container grid-3" style={{ alignItems: 'start' }}>
          
          {/* List of Students */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users /> Active Student Roster ({students.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {students.map((student) => (
                <div key={student.enrollment_id} className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-white)' }}>{student.student_name}</h4>
                      <span className="badge-emerald" style={{ marginTop: '6px', display: 'inline-block' }}>{student.course_name}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-highlight)' }}>Days: {student.days_per_week} days/week</span>
                      <span style={{ color: 'var(--text-muted)' }}>Time slot: {student.class_time}</span>
                    </div>
                  </div>
                  
                  <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)', margin: '16px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Teams ID / Email: <strong style={{ color: 'var(--text-white)' }}>{student.student_teams || 'Not set'}</strong>
                    </div>
                    {student.student_teams && (
                      <a 
                        href={`https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(student.student_teams)}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Video size={14} /> Call Student on Teams
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Logging & Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Form to Log Attendance */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar /> Log Class Activity
              </h3>
              
              <form onSubmit={handleLogAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">Select Student</label>
                  <select
                    value={selectedEnrollment}
                    onChange={(e) => setSelectedEnrollment(e.target.value)}
                    className="input-field"
                  >
                    {students.map((student) => (
                      <option key={student.enrollment_id} value={student.enrollment_id}>
                        {student.student_name} ({student.course_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Class Date</label>
                  <input
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Attendance Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="present">Present (Milestone Achieved)</option>
                    <option value="absent">Absent (Student No-Show)</option>
                    <option value="cancelled">Cancelled (Teacher Off / Rescheduled)</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Homework / Progress Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Read Qaida page 12, practiced Makharaj rules. Needs reviews."
                    className="input-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-accent" 
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Logging...' : <><Send size={16} /> Save Lesson Logs</>}
                </button>
              </form>

              {submitMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  backgroundColor: submitMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${submitMessage.type === 'success' ? 'var(--emerald-bright)' : '#ef4444'}`,
                  color: submitMessage.type === 'success' ? '#34d399' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <CheckCircle2 size={16} />
                  <span>{submitMessage.text}</span>
                </div>
              )}
            </div>

            {/* Form to Edit Teacher Profile */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users /> Tutor Profile Settings
              </h3>
              
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">My Biography</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your teaching experience, philosophy, and background..."
                    className="input-field"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Teaching Specialties</label>
                  <input
                    type="text"
                    value={specialtiesInput}
                    onChange={(e) => setSpecialtiesInput(e.target.value)}
                    placeholder="Nazra, Tajweed (comma separated)"
                    className="input-field"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Separate specialties with a comma (e.g. Nazra, Tajweed).
                  </span>
                </div>

                <div>
                  <label className="input-label">Qualifications</label>
                  <input
                    type="text"
                    value={qualificationsInput}
                    onChange={(e) => setQualificationsInput(e.target.value)}
                    placeholder="Ijazah Certified, Alimah Degree (comma separated)"
                    className="input-field"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Separate qualifications with a comma (e.g. Ijazah Certified, Arabic Native).
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Settings'}
                </button>
              </form>

              {profileMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  backgroundColor: profileMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${profileMessage.type === 'success' ? 'var(--emerald-bright)' : '#ef4444'}`,
                  color: profileMessage.type === 'success' ? '#34d399' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <CheckCircle2 size={16} />
                  <span>{profileMessage.text}</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
