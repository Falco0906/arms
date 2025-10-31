# ARMS Platform 🎓

**Academic Resource Management System** - A modern platform for students to share and access course materials.

🔗 **Live**: [arms-drz0.onrender.com](https://arms-drz0.onrender.com)

---

## ✨ Features

- 📚 **Course Materials** - Upload/download notes, assignments, code
- 💬 **Chat** - Course-specific chat + private messaging
- 📰 **News & Events** - Exam timetables and announcements
- 🏆 **Rankings** - Leaderboard based on contributions
- 👤 **User Profiles** - View uploads and statistics
- �� **Personal Notes** - Private note-taking
- 🌙 **Dark Mode** - Full dark mode support
- 🔍 **Search** - Find courses, materials, and people

---

## 🛠️ Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: Firebase (Firestore + Auth)
- **Storage**: Supabase Storage
- **Deployment**: Render.com
- **Auth**: Google Sign-In (@klh.edu.in only)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase project
- Supabase account

### Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/Falco0906/arms.git
   cd arms-platform/frontend
   npm install
   ```

2. **Configure Firebase**
   - Create `src/firebase.js` with your config
   - Enable Google Auth
   - Create Firestore database

3. **Configure Supabase**
   - Create `src/supabaseClient.js` with your config
   - Create storage bucket

4. **Run**
   ```bash
   npm start
   ```

---

## �� Structure

```
arms-platform/
├── frontend/           # React app
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── services/   # Firebase & API
│   │   └── App.js      # Main app
│   └── package.json
└── manageCourses.js    # Admin script
```

---

## 🔑 Admin

Only `2410080079@klh.edu.in` can upload/delete news.

---

## 📚 Courses

- **OOPS** - Object Oriented Programming
- **DBMS** - Database Management Systems
- **OS** - Operating Systems
- **P&S** - Probability & Statistics
- **FEDF** - Front End Development
- **ADS** - Advanced Data Structures
- **DSV** - Data Science & Visualization

---

## 🛠️ Managing Courses

```bash
node manageCourses.js
```

---

## 🚀 Deployment

Deployed on **Render.com** with auto-deploy from `main-firebase` branch.

---

**Built for KL University students** 🎓
