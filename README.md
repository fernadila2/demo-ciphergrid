# CIPHERGRID (front-end prototype)

Open `index.html` in a browser (or serve the folder with any static server). Click "Open the demo account" for a pre-populated profile, or register a new account (the verification code is shown on screen).

## Structure
- `index.html` landing, `auth.html` login/register/verify/forgot/reset/success (hash routes)
- `dashboard, courses, course, labs, lab, challenges, leaderboard, profile, shop .html`
- `css/style.css` design system, `css/pages.css` screens, `css/landing.css` homepage
- `js/data-courses.js`, `js/data.js` fictional content (22 courses, 44 modules, 88 lessons, 16 labs, 32 challenges, 24 achievements, 24 users)
- `js/store.js` all state, XP/levels, Cubes, streaks, achievements, daily missions, auth (LocalStorage)
- `js/ui.js` shell, search, notifications, modals, effects; `js/pages/*.js` one script per page

## Backend hand-off
Every mutation goes through `CG.*` in `store.js` (`CG.auth.*`, `CG.award`, `CG.spend`, `CG.completeLesson`, `CG.completeLab`, `CG.submitFlag`, `CG.buy`). Replace those with API calls; challenge flags should be validated server-side. Passwords are only hashed for demo purposes.

## Safety
Labs are scripted text simulations. No command makes a network request. Cubes are virtual points with no cash value.
