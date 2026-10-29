# Train Your Brain (HTML, CSS and JavaScript only)

No Python, no server, no install. Just open `index.html` in a browser.

## Features
- Login and register (accounts stored in this browser, passwords hashed)
- Recovery code to reset a forgotten password (shown once at sign-up)
- Choose your study line, enrol in courses, lessons with quizzes (16 courses)
- XP, levels, 8 badges, daily goals and streaks, "streak at risk" banner and optional browser notification
- Typing training (3 levels) with live WPM, accuracy, and a weak-key drill built from the keys you miss
- Dashboard with speed and accuracy charts and a leaderboard of the accounts on this device
- AI tutor:
  - Built-in tutor (no key needed): study plans, quizzes on weak topics, lesson explanations, typing tips
  - Optional Anthropic API integration (API key kept for the current browser-tab session; still not safe for public deployment)
- Onboarding quiz, dark mode, course ratings, feedback form, thumbs up/down on tutor answers
- Download your data as JSON
- Installable phone app that works offline (needs the site served over http/https, see below)

## Files
- index.html: the page
- style.css: styling (light and dark)
- script.js: user interface
- store.js: the data layer (accounts, progress, XP, streaks, badges, tutor). It replaces a server and saves everything in localStorage.
- lessons.js: courses, lessons, quiz questions and typing words. Edit this file to add or change content.
- sw.js, manifest.json, icons/: phone-app (PWA) files
- Train_Your_Brain.pptx: project presentation

## Run
- Simple: double-click `index.html` for local demo features. Some browser APIs (including service workers and clipboard access) require localhost or HTTPS.
- To test installing it as an app and offline mode: run `python -m http.server 8000` in this folder and open http://localhost:8000
- To publish the static demo: upload the folder to GitHub Pages, Netlify or any static host. Do not use browser-only authentication or client-side AI keys for a public production service.

## Limits of a browser-only app (important for your report)
- Data lives in one browser on one device. Clearing browser data deletes accounts and progress.
- The leaderboard only includes accounts created in the same browser.
- No email: password reset uses the recovery code instead; there is no email verification, Google sign-in or emailed reminders.
- Password hashing and login attempt limits run in the browser. This is a demo-grade login, not production authentication; users can inspect or modify browser storage and bypass client-side limits. Use a backend for real accounts.
- The optional AI key is kept in session storage for the current tab session and is not written to the persistent user database. It is still accessible to browser users and is sent directly to Anthropic. Use a server-side proxy and environment variable before public deployment.
- Feedback and usage events are saved locally on this device; they are not sent to the developer or a central database.
- Streak days use the device's local date.
- The service worker caches the complete app shell, including both PWA icons, and only uses the app page as a fallback for navigation requests.
