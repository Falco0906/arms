# ARMS Platform Frontend

Academic Resource Management System with Obsidian-inspired dark theme

## 🎨 Theme

The app now features a clean obsidian dark theme:
- **Background**: Near-black neutral (`neutral-950`)
- **Cards**: Dark gray (`neutral-900`)  
- **Borders**: Subtle gray (`neutral-800`/`neutral-700`)
- **Text**: High contrast white/gray for readability
- **No color accents** - Pure neutral palette throughout

## 🚀 Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config
   ```

3. **Start dev server**:
   ```bash
   npm start
   ```
   Opens at http://localhost:3000

### Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## 📦 Quick Deploy

### Vercel (Fastest)

```bash
npm install -g vercel
vercel
```

Then add environment variables in Vercel dashboard.

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Firebase

```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

## 📝 Full Deployment Guide

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed instructions including:
- Environment variable setup
- Platform-specific configuration  
- Troubleshooting tips
- Post-deployment checklist

## 🔧 Environment Variables

Required variables (add to `.env`):

```
REACT_APP_USE_FIREBASE=true
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

## 🛠️ Tech Stack

- **React** 18.2
- **Tailwind CSS** 3.4 (with dark mode)
- **Firebase** 10.5 (auth, firestore, storage)
- **Lucide React** (icons)
- **Axios** (HTTP client)

## 📂 Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   │   ├── auth/
│   │   ├── common/
│   │   ├── dashboard/
│   │   └── rankings/
│   ├── services/    # API & Firebase services
│   ├── firebase.js  # Firebase config
│   └── App.js       # Main app component
├── .env             # Environment variables (not committed)
├── .env.example     # Environment template
└── package.json     # Dependencies
```

## 🌐 Features

- ✅ Firebase authentication (Google OAuth)
- ✅ Course material upload/download
- ✅ User rankings and profiles
- ✅ Real-time messaging
- ✅ Personal notes (local storage)
- ✅ Dark/light theme toggle
- ✅ Responsive design
- ✅ Search functionality

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🐛 Troubleshooting

### Dark mode not working
- Clear browser cache
- Check localStorage for `arms_dark_mode` key
- Verify Tailwind config has `darkMode: 'class'`

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase errors
- Check `.env` variables are correct
- Verify Firebase project settings
- Check browser console for detailed errors

## 📄 License

Private project - All rights reserved

## 👥 Support

For issues or questions, contact the development team.
