# Assignment & Submission Management System

A role-based full-stack web application designed for school/college assignment management, evaluation, student submissions, and role authorization.

---

## 📌 Project Overview
This system allows teachers to create and grade assignments, students to view deadlines and submit responses, and admins to manage user roles and system operations.

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** ASP.NET Core Web API (C#)
- **Database:** SQL Server / PostgreSQL with Entity Framework Core
- **Authentication:** JWT (JSON Web Token) with Role-Based Access Control (RBAC)

---

## 🔑 Demo Credentials

Evaluators can test the application using the pre-configured demo accounts below:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `Password123!` |
| **Teacher** | `teacher@school.com` | `Password123!` |
| **Student** | `student@school.com` | `Password123!` |

---

## ✨ Key Features

### 🛠️ Admin Module
- System dashboard with user & class statistics.
- View user list and assigned class details.

### 👨‍🏫 Teacher Module
- Create assignments with titles, descriptions, total marks, and deadlines.
- View list of student submissions.
- Assign marks and provide text feedback to students.

### 👨‍🎓 Student Module
- View active assignments assigned to their class.
- Submit responses via text or external file links.
- View assigned marks and teacher evaluation comments.

### 👤 Profile & Common Features
- Role-based protected routes (`ProtectedRoute`).
- Profile editor with compressed image upload (LocalStorage persistence).
- Dark-themed responsive interface.

---

## ⚙️ How to Run Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- .NET 8 / 9 SDK
- SQL Server or PostgreSQL

---

### 2. Frontend Setup (`assignment-ui`)

```bash
# Navigate to the frontend folder
cd assignment-ui

# Install dependencies
npm install

# Run the Next.js development server
npm run dev