# Frontend Refactoring Plan

## Current Issues
- `App.js` is ~1800 lines long
- All state management scattered in one component
- No routing system
- Mixed concerns (auth, UI, data fetching)
- Hard to maintain and test

## Refactoring Strategy

### 1. Create Route-Based Architecture
- Install React Router
- Create separate pages for each major feature
- Implement proper navigation

### 2. Extract Components
- **Auth Components**: LoginForm, RegisterForm, AuthWrapper
- **Course Components**: CourseList, CourseCard, CourseDetail
- **Material Components**: MaterialList, MaterialCard, MaterialUpload
- **User Components**: UserProfile, UserSearch, Rankings
- **Common Components**: Header, Sidebar, Modal, LoadingSpinner

### 3. State Management
- Create custom hooks for data fetching
- Implement context for global state
- Separate local component state from global state

### 4. Service Layer
- Keep API services as they are (already well structured)
- Add error boundary components
- Implement loading states consistently

## Implementation Steps

1. **Setup Routing** - Install React Router and create basic routes
2. **Extract Auth Components** - Login/Register forms
3. **Extract Course Components** - Course listing and details
4. **Extract Material Components** - File management
5. **Extract User Components** - Profile and rankings
6. **Create Layout Components** - Header, sidebar, main layout
7. **Add Error Boundaries** - Error handling
8. **Implement Loading States** - Consistent loading UX
9. **Add Tests** - Component tests

## File Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   └── AuthWrapper.js
│   ├── courses/
│   │   ├── CourseList.js
│   │   ├── CourseCard.js
│   │   └── CourseDetail.js
│   ├── materials/
│   │   ├── MaterialList.js
│   │   ├── MaterialCard.js
│   │   └── MaterialUpload.js
│   ├── users/
│   │   ├── UserProfile.js
│   │   ├── UserSearch.js
│   │   └── Rankings.js
│   ├── common/
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   ├── Modal.js
│   │   └── LoadingSpinner.js
│   └── layout/
│       ├── MainLayout.js
│       └── AuthLayout.js
├── pages/
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── CoursePage.js
│   ├── MaterialPage.js
│   └── ProfilePage.js
├── hooks/
│   ├── useAuth.js
│   ├── useCourses.js
│   ├── useMaterials.js
│   └── useUsers.js
├── context/
│   ├── AuthContext.js
│   └── AppContext.js
└── App.js (simplified)
```
