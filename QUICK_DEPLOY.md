# Deploy to Render - Quick Steps

## 1. Push to GitHub

```bash
cd /Users/macbookair/Downloads/arms-platform
git add .
git commit -m "Deploy to Render"
git push origin main2
```

## 2. Deploy Backend

1. Go to https://dashboard.render.com/
2. New → Web Service
3. Connect GitHub → arms-platform
4. Settings:
   - Name: arms-backend
   - Root: backend
   - Build: `mvn clean package -DskipTests`
   - Start: `java -jar target/platform-0.0.1-SNAPSHOT.jar`
   - Add env vars:
     - SERVER_PORT=8080
     - FIREBASE_PROJECT_ID=arms-8a8b8
     - FIREBASE_STORAGE_BUCKET=arms-8a8b8.firebasestorage.app

## 3. Deploy Frontend

1. New → Static Site
2. Select arms-platform
3. Settings:
   - Name: arms-frontend
   - Root: frontend
   - Build: `npm install && npm run build && echo "/*    /index.html   200" > build/_redirects`
   - Publish: build
   - Add all REACT_APP_* env vars from .env

## 4. Update CORS

Add to backend env:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

Done! Your app is live.
