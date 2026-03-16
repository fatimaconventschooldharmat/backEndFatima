# Server Configuration

This document outlines important environment variables used by the backend, including credentials for the seller and teacher roles.

## Required Environment Variables

```text
MONGODB_URI=...
JWT_SECRET=...
VITE_BACKEND_URL=...
# other existing variables

# credentials for the admin-type users
SELLER_EMAIL=your-seller-email@example.com
SELLER_PASSWORD=your-seller-password
TEACHER_EMAIL=your-teacher-email@example.com
TEACHER_PASSWORD=your-teacher-password
```

- **SELLER_*** variables allow someone to log in as a seller via `/seller` and manage students.
- **TEACHER_*** variables allow a teacher to log in at `/teacher` and update exam numbers, attendance, and enter subject‑wise marks (monthly tests out of 20 and quarterly/half‑yearly/annual exams out of 100).

> Sellers can still add student personal details but **cannot** supply performance marks; those fields are reserved for teachers.

Make sure to add these to your `.env` file or deployment configuration before starting the server.
