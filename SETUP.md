# Student Management Dashboard - Setup Guide

## Project Overview
A professional MERN stack (MongoDB, Express, React, Node.js) Student Management Dashboard with a clean, minimalist corporate design. Features include:

- Student profile management with editable fields
- Marks entry and auto-calculated grades
- Homework status tracking
- Attendance tracking
- Real-time data synchronization
- Search and filtering capabilities
- Responsive dashboard with sidebar navigation

## Prerequisites
- Node.js v18+
- MongoDB (local or cloud instance like MongoDB Atlas)
- pnpm package manager

## Installation & Setup

### 1. Install Dependencies
All dependencies have been pre-installed. Verify by checking `package.json`:
```bash
pnpm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Default connection will be: `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

### 3. Environment Configuration
Create or update `.env.local` in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/student-management
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-management

# Backend Server
API_URL=http://localhost:5000

# Node Environment
NODE_ENV=development
```

### 4. Start the Backend Server

The backend Express server runs on port 5000:

```bash
# In one terminal:
pnpm run server
```

The server will:
- Connect to MongoDB
- Initialize database connection
- Start listening on port 5000
- Log connection status

### 5. Start the Frontend (Next.js)

In another terminal:
```bash
# In a second terminal:
pnpm run dev
```

The frontend will:
- Start on http://localhost:3000
- Connect to the backend at http://localhost:5000
- Display the dashboard

### 6. Run Both Simultaneously (Optional)

In one terminal, run both servers:
```bash
pnpm run dev:all
```

This uses `concurrently` to run both servers side-by-side.

## Project Structure

```
project-root/
├── app/
│   ├── api/                           # Next.js API routes (proxy to Express)
│   │   ├── students/
│   │   │   ├── route.ts              # GET/POST all students
│   │   │   └── [id]/route.ts         # GET/PUT/DELETE single student
│   │   └── marks/
│   │       ├── route.ts              # GET/POST all marks
│   │       └── [id]/route.ts         # GET/PUT/DELETE single marks
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── students/
│   │   ├── page.tsx                  # Student list
│   │   ├── new/page.tsx              # Add new student
│   │   └── [id]/
│   │       ├── page.tsx              # Student detail view
│   │       └── edit/page.tsx         # Edit student
│   ├── marks/
│   │   └── page.tsx                  # Marks overview
│   ├── classes/
│   │   └── page.tsx                  # Classes overview
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Design tokens & styles
│   └── page.tsx                      # Home redirect
│
├── components/
│   ├── Sidebar.tsx                   # Navigation sidebar
│   ├── TopSearchBar.tsx              # Search & filter bar
│   ├── StudentTable.tsx              # Student list table
│   ├── StudentForm.tsx               # Add/Edit student form
│   ├── MarksForm.tsx                 # Add/Edit marks form
│   └── MarksTable.tsx                # Marks display table
│
├── server/
│   ├── models/
│   │   ├── Student.js                # Student schema & model
│   │   └── Marks.js                  # Marks schema & model
│   ├── routes/
│   │   ├── students.js               # Student CRUD routes
│   │   └── marks.js                  # Marks CRUD routes
│   ├── config/
│   │   └── database.js               # MongoDB connection config
│   └── server.js                     # Express server entry point
│
├── .env.local                        # Environment variables
├── package.json                      # Project dependencies
├── next.config.js                    # Next.js configuration
└── SETUP.md                          # This file
```

## API Endpoints

### Students

**GET /api/students**
- Fetch all students with marks averages
- Response: `[{ _id, name, rollNo, class, email, attendance, marksAverage }, ...]`

**POST /api/students**
- Create new student
- Body: `{ name, rollNo, class, email, attendance }`

**GET /api/students/:id**
- Fetch single student
- Response: `{ _id, name, rollNo, class, email, attendance }`

**PUT /api/students/:id**
- Update student
- Body: `{ name, rollNo, class, email, attendance }`

**DELETE /api/students/:id**
- Delete student

### Marks

**GET /api/marks**
- Fetch all marks (optional: ?studentId=xxx to filter by student)

**POST /api/marks**
- Create marks entry
- Body: `{ studentId, subject, marksObtained, grade, homeworkStatus, comments }`

**GET /api/marks/:id**
- Fetch single marks entry

**PUT /api/marks/:id**
- Update marks entry

**DELETE /api/marks/:id**
- Delete marks entry

## Database Models

### Student Schema
```javascript
{
  name: String (required),
  rollNo: Number (required, unique),
  class: String (required),
  email: String (required),
  attendance: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### Marks Schema
```javascript
{
  studentId: ObjectId (required, references Student),
  subject: String (required),
  marksObtained: Number (0-100, required),
  grade: String (auto-calculated: A+, A, B, C, D, F),
  homeworkStatus: String (Complete/Incomplete),
  comments: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Features Implemented

### Frontend
- ✅ Clean, minimalist corporate UI with soft whites, slate greys, accent blues
- ✅ Responsive dashboard with fixed sidebar
- ✅ Top search bar with filters (Name, Class, Roll No)
- ✅ Student table with inline actions (View, Edit, Delete)
- ✅ Student detail pages with profile cards
- ✅ Add/Edit student forms with validation
- ✅ Marks entry forms with auto-grade calculation
- ✅ Marks display table with homework status indicators
- ✅ Real-time data synchronization
- ✅ Search and filter functionality

### Backend
- ✅ Express.js REST API
- ✅ MongoDB integration with Mongoose
- ✅ Full CRUD operations for Students and Marks
- ✅ Automatic grade calculation
- ✅ Data validation
- ✅ Error handling

## Usage Guide

### Adding a Student
1. Click "Add Student" button from dashboard or students page
2. Fill in student details (name, roll number, class, email, attendance)
3. Click "Add Student" to save

### Editing Student Profile
1. Click on a student row to view their profile
2. Click "Edit Profile" button
3. Update information and click "Update Student"

### Adding Marks
1. Go to student's profile page
2. Click "Add Marks" button
3. Select subject and enter marks (0-100)
4. Grade will auto-calculate based on marks
5. Select homework status
6. Add optional comments
7. Click "Save Marks"

### Searching Students
1. Use the top search bar
2. Search by name, class, or roll number
3. Results update in real-time

## Design System

### Color Palette
- **Background**: Soft white (`#f8f9fa`)
- **Foreground**: Dark slate (`#1a2332`)
- **Primary**: Medium slate (`#4a5568`)
- **Accent**: Professional blue (`#3b82f6`)
- **Borders**: Light grey (`#e5e7eb`)

### Typography
- **Font Family**: Geist (sans-serif)
- **Headings**: Bold weights
- **Body**: Regular weight, 14px base size
- **Line Height**: 1.5-1.6 for readability

## Troubleshooting

### Backend Connection Error
If you see "API connection failed":
1. Ensure backend is running: `pnpm run server`
2. Check API_URL in `.env.local` is correct
3. Verify MongoDB is running
4. Check backend logs for errors

### MongoDB Connection Error
1. Verify MongoDB is installed and running
2. Check MONGODB_URI in `.env.local`
3. For Atlas, ensure IP whitelist includes your machine
4. Test connection: `mongosh` command

### Port Already in Use
- Backend (5000): `lsof -i :5000` then kill process
- Frontend (3000): `lsof -i :3000` then kill process

### Data Not Appearing
1. Check MongoDB has data: `db.students.find()`
2. Verify API calls in Network tab
3. Check browser console for errors
4. Restart both servers

## Future Enhancements

- User authentication & authorization
- Teacher roles and permissions
- Advanced reporting and analytics
- Bulk student import (CSV)
- Email notifications
- Print reports
- Grade distribution charts
- Performance analytics
- Parent portal
- Attendance QR code

## Support

For issues or questions:
1. Check the logs in both frontend and backend terminals
2. Verify environment configuration
3. Ensure MongoDB is accessible
4. Check API endpoints are responding

---

Created with Next.js 16, Express.js, MongoDB, and Tailwind CSS
