# Student Management Dashboard - Supabase Setup Guide

## Overview

This is a professional Student Management Dashboard built with:
- **Frontend**: Next.js 16 with React and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time Data**: All changes persist immediately to the database

## Database Schema

The application uses two main tables:

### Students Table
```sql
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  roll_no VARCHAR(50) NOT NULL UNIQUE,
  class VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE,
  attendance_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Marks Table
```sql
CREATE TABLE marks (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  marks_obtained DECIMAL(5, 2) NOT NULL,
  grade CHAR(2),
  homework_status VARCHAR(20) DEFAULT 'Incomplete',
  teacher_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### Step 1: Verify Supabase Connection

The Supabase integration is already configured. Your environment variables should include:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are automatically set from your Supabase integration.

### Step 2: Database Tables

The database tables have already been created via migration. You can verify them in your Supabase dashboard:
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. You should see `students` and `marks` tables

### Step 3: Start the Development Server

```bash
# Install dependencies (if not already done)
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Usage Guide

### Dashboard

**Access**: `http://localhost:3000/dashboard`

The dashboard shows:
- Overview statistics
- Quick access to student management
- Recent student entries
- Average attendance across all students

### Adding a Student

1. **Click "Add New Student"** on the dashboard or navigate to `/students/new`
2. **Fill in the form:**
   - **Full Name**: Student's complete name
   - **Roll No**: Unique roll number (must be unique)
   - **Class**: Select from dropdown (10A, 10B, 11A, 11B, 12A, 12B)
   - **Email**: Student's email address
   - **Attendance %**: Attendance percentage (0-100)
3. **Click "Save"** → Student is immediately saved to database

### Viewing All Students

**Access**: `http://localhost:3000/students`

Features:
- Search by name or roll number
- Filter by class
- View all students in a data table
- See attendance percentage with visual progress bar
- Quick actions: View, Edit, Delete

### Viewing Student Profile

1. **Click on any student** from the list
2. **View the profile** with all details
3. **Add marks** using the "Add Marks" button
4. **View marks history** in the marks table below
5. **Edit student info** using the Edit button

### Adding Marks for a Student

1. **Open student profile** → `/students/[id]`
2. **Click "Add Marks Entry"** button
3. **Fill in the marks form:**
   - **Subject**: Select from predefined subjects (Math, English, Science, etc.)
   - **Marks Obtained**: Enter marks (0-100)
   - **Grade**: Auto-calculated from marks
     - 90-100: A+
     - 85-89: A
     - 75-84: B
     - 65-74: C
     - 55-64: D
     - Below 55: F
   - **Homework Status**: Complete or Incomplete (radio buttons)
   - **Teacher Comments**: Optional feedback
4. **Click "Save"** → Grade is auto-calculated and marks are saved

### Editing Marks

1. **From student profile**, click edit icon next to any marks entry
2. **Update the fields**
3. **Grade auto-updates** based on marks
4. **Click "Save"**

### Deleting Records

**Students**:
- From student list table, click trash icon
- Confirm deletion - all associated marks are automatically deleted

**Marks**:
- From student profile, click trash icon next to marks entry
- Confirm deletion

## Features

✅ **Real-time Data Persistence** - All changes saved to PostgreSQL immediately
✅ **Auto-calculated Grades** - Letter grades calculated based on marks (A+, A, B, C, D, F)
✅ **Search & Filter** - Find students by name, roll number, or class
✅ **Attendance Tracking** - Visual progress bars showing attendance percentage
✅ **Homework Status** - Track complete/incomplete homework for each subject
✅ **Teacher Comments** - Add notes and feedback for students
✅ **Professional UI** - Minimalist corporate design with soft whites, slate greys, and accent blues
✅ **Responsive Design** - Works on desktop and tablet (optimized for 4K displays)
✅ **Cascading Deletes** - Deleting a student automatically removes all related marks

## API Endpoints

The application uses Next.js API routes that directly connect to Supabase:

### Students API
- `GET /api/students` - Get all students (supports search & class filter)
- `POST /api/students` - Create a new student
- `GET /api/students/[id]` - Get specific student
- `PUT /api/students/[id]` - Update student information
- `DELETE /api/students/[id]` - Delete student

### Marks API
- `GET /api/marks` - Get all marks (supports student_id filter)
- `POST /api/marks` - Create new marks entry (auto-calculates grade)
- `GET /api/marks/[id]` - Get specific marks entry
- `PUT /api/marks/[id]` - Update marks (auto-recalculates grade)
- `DELETE /api/marks/[id]` - Delete marks entry

## File Structure

```
app/
  ├── api/
  │   ├── students/
  │   │   ├── route.ts          (GET, POST)
  │   │   └── [id]/route.ts     (GET, PUT, DELETE)
  │   └── marks/
  │       ├── route.ts          (GET, POST)
  │       └── [id]/route.ts     (GET, PUT, DELETE)
  ├── dashboard/page.tsx        (Main dashboard)
  ├── students/
  │   ├── page.tsx              (Student list)
  │   ├── new/page.tsx          (New student form)
  │   └── [id]/
  │       ├── page.tsx          (Student detail)
  │       └── edit/page.tsx     (Edit student)
  ├── marks/page.tsx            (Marks list)
  └── classes/page.tsx          (Classes view)

components/
  ├── Sidebar.tsx               (Navigation sidebar)
  ├── TopSearchBar.tsx          (Search & filter bar)
  ├── StudentTable.tsx          (Students data table)
  ├── StudentForm.tsx           (Student form)
  ├── MarksForm.tsx             (Marks form)
  └── MarksTable.tsx            (Marks data table)

lib/
  └── supabase/
      ├── client.ts             (Browser client)
      └── server.ts             (Server client)
```

## Troubleshooting

### "Cannot connect to Supabase"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase project is active
- Ensure database tables exist (check in Supabase dashboard)

### Data not showing up
- Refresh the page (Ctrl+R / Cmd+R)
- Check browser console (F12) for errors
- Verify database tables have data (check in Supabase SQL editor)

### Grade not auto-calculating
- Ensure marks_obtained is a valid number (0-100)
- Grade calculation happens automatically when form is submitted

### Roll number already exists error
- Each student must have a unique roll number
- Change the roll number to a different value

## Deployment

To deploy to Vercel:

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy** - Vercel will automatically build and deploy your app

Your live dashboard will be accessible at your Vercel domain.

## Notes

- All data is stored in PostgreSQL (Supabase)
- Grade calculation is done server-side on API
- Attendance is stored as percentage (0-100)
- Homework status is either "Complete" or "Incomplete"
- All timestamps are automatically managed by the database
- Delete operations cascade (deleting a student removes all marks)

