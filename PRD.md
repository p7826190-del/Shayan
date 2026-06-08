# Product Requirements Document (PRD) - Al Kareem Quran Institute

## 1. Product Overview
Al Kareem Quran Institute is a professional online Quran academy offering live 1-on-1 Quran tutoring and Islamic education. Having operated for 4+ years, the academy is transitioning from manual operation and static landing pages to a modern, full-stack web application with a built-in Learning Management System (LMS) and student portal.

### Mission
To deliver accessible, high-quality, and personalized Quranic and Islamic education globally, ensuring students (especially children and sisters) learn Tajweed and Nazra in an engaging, secure, and structured environment.

### Target Audience
- **Children (ages 5–15)** seeking basic Quran recitation (Nazra) and Tajweed.
- **Sisters / Female Students** requiring qualified female tutors for comfort and privacy.
- **Diaspora Muslims in Western countries (USA, UK, Canada, Australia, Europe)** seeking reliable, structured Islamic tutoring.

---

## 2. Core Value Proposition & Competitive Edge
- **Live 1-on-1 Tutoring**: Interactive, student-paced lessons.
- **Female Tutors Available**: Dedicated, certified female scholars to teach sisters and children.
- **Free Trial Classes**: 3 free trial classes (1-week trial) with no commitment.
- **Affordable Regional Pricing**:
  - $40/month: 3 days/week (30-minute sessions)
  - $50/month: 5 days/week (30-minute sessions)
- **Teams Integration**: Classes delivered via Microsoft Teams for robust, zero-lag calls.
- **Modern LMS Portal**: Structured student progress tracking, scheduling, and admin panel (which competitor Quran Mubarak lacks).

---

## 3. Site Architecture & Pages

### 3.1 Public Landing Pages
1. **Home**: High-converting hero section with an embedded 3-step Free Trial registration form. Features core advantages, statistics, quick course previews, parent testimonials, and FAQs.
2. **Courses**: Detailed view of offered programs:
   - **Quran Reading / Nazra**: For beginners to read Quran fluently.
   - **Tajweed Course**: Advanced rules of pronunciation and articulation.
3. **Fee Structure**: Clear regional pricing plans (USD, GBP, CAD, PKR) and family discounts (10% off for the second student).
4. **About Us**: Academy history (4+ years), teaching philosophy, and tutor qualifications.
5. **Contact Us**: Contact form, WhatsApp direct link, phone numbers, and Teams support handle.

### 3.2 Authenticated Student Portal (LMS)
- **Dashboard**: Overview of upcoming classes, assigned teacher, Teams class link, and attendance.
- **My Classes**: Detailed schedule, history of past sessions, and teacher notes/homework.
- **Progress Tracking**: Visual progress bars, Tajweed milestone achievements, and monthly reports.
- **Payments**: Subscription status, bill generation, and payment submission (Card/Stripe/EasyPaisa/JazzCash).

### 3.3 Authenticated Admin Portal
- **Dashboard**: Analytics (total students, active classes, pending trial requests, monthly revenue).
- **Trial Manager**: View and manage incoming trial registrations; assign a tutor and schedule the trials.
- **Student & Tutor Directory**: Profile management, course enrollments, active status toggles.
- **Class scheduler**: Link students with tutors, assign Teams group/call links, and set session times.
- **Payments Manager**: Record/verify subscription payments, view paid/unpaid invoices.

---

## 4. Technical Architecture & Database Schema

### Tech Stack
- **Frontend**: React (v19) + TypeScript + Vite + Vanilla CSS (highly polished custom styling).
- **Backend & Database**: Supabase (Postgres, Auth, Storage, and Edge Functions).
- **Icons**: Lucide React for consistent vector iconography.
- **Live Classes**: Teams integration (direct link launch).

### Database Schema (Supabase)

#### `profiles` (User metadata extending Supabase Auth)
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `role` (text: 'student', 'teacher', 'admin')
- `phone_number` (text)
- `country` (text)
- `gender` (text)
- `teams_id` (text)
- `created_at` (timestamp)

#### `teachers`
- `id` (uuid, primary key, references profiles)
- `bio` (text)
- `gender` (text: 'male', 'female')
- `specialties` (text[])
- `qualifications` (text[])
- `is_active` (boolean)

#### `students`
- `id` (uuid, primary key, references profiles)
- `parent_name` (text, optional for minors)
- `age` (integer, optional)
- `gender_preference` (text: 'male', 'female', 'no_preference')
- `level` (text: 'beginner', 'intermediate', 'advanced')

#### `trial_requests`
- `id` (uuid, primary key)
- `student_name` (text)
- `email` (text)
- `phone_number` (text)
- `country` (text)
- `gender_preference` (text)
- `course_interest` (text)
- `status` (text: 'pending', 'scheduled', 'completed', 'cancelled')
- `assigned_teacher_id` (uuid, references teachers)
- `scheduled_at` (timestamp, optional)
- `created_at` (timestamp)

#### `enrollments`
- `id` (uuid, primary key)
- `student_id` (uuid, references profiles)
- `teacher_id` (uuid, references teachers)
- `course_name` (text: 'Nazra', 'Tajweed')
- `days_per_week` (integer: 3, 5)
- `price_monthly` (numeric)
- `currency` (text)
- `status` (text: 'active', 'paused', 'completed')
- `teams_class_link` (text)
- `class_time` (time)
- `created_at` (timestamp)

#### `attendance_logs`
- `id` (uuid, primary key)
- `enrollment_id` (uuid, references enrollments)
- `class_date` (date)
- `status` (text: 'present', 'absent', 'cancelled')
- `notes` (text, teacher comments/homework)
- `created_at` (timestamp)

#### `payments`
- `id` (uuid, primary key)
- `student_id` (uuid, references profiles)
- `amount` (numeric)
- `currency` (text)
- `payment_method` (text)
- `status` (text: 'pending', 'paid', 'failed')
- `billing_date` (date)
- `transaction_id` (text, optional)
- `created_at` (timestamp)

---

## 5. Security & Privacy
- **Row Level Security (RLS)**: Enforced on all Supabase tables so students can only view their own dashboard, attendance, and payments, while teachers can view their assigned students' logs.
- **Children's Privacy**: Account details managed securely, with parental contact fields.
- **Obfuscation**: Contact details hidden for non-logged-in users.
