# Train Your Brain — Fixes and Verification

## Fixes applied

1. Fixed the local-storage fallback so in-memory values are used when browser storage is unavailable or a write fails.
2. Made streak date keys deterministic using local year/month/day values instead of relying on locale-specific date formatting.
3. Moved the optional Anthropic API key out of the persistent account database into session storage (and migrated keys saved by older versions when possible).
4. Updated the default Anthropic model to `claude-sonnet-5`, which is listed as an active model in Anthropic's model lifecycle documentation at the time this project was updated.
5. Improved AI API error handling for invalid keys, forbidden requests, rate limiting, invalid model/request errors, malformed responses, and empty responses.
6. Fixed recovery-code clipboard handling by awaiting the clipboard promise and handling rejected operations.
7. Improved the service worker: caches both PWA icons, uses a new cache version, cleans up only this app's old caches, and only falls back to the app HTML for navigation requests. Missing offline scripts/styles now return a 503 text response instead of HTML.
8. Updated the feedback button and message so they accurately explain that feedback is saved locally, not sent to the developer.
9. Updated README and settings copy to explain browser-only security and data-storage limitations.
10. Added dependency-free smoke tests under `tests/smoke-test.js`.

## Verification performed

- `node --check store.js` — passed.
- `node --check script.js` — passed.
- `node --check sw.js` — passed.
- `node tests/smoke-test.js` — passed for registration/login, course enrolment, lesson retrieval, quiz scoring/XP, AI response handling, and ensuring the AI key is not saved in the persistent account database.
- Static HTML check — no duplicate IDs or missing local script/stylesheet assets detected.

A full interactive browser test could not be completed in the execution environment because its browser policy blocked local-file and loopback navigation.

## Important limitations that cannot be fully solved in a browser-only app

- Authentication, password hashing, and login-attempt limits still run in the browser. This is suitable for a college demo, not real production accounts. A production version needs a server-side authentication API and proper password hashing (for example Argon2id).
- A client-side API key is still visible to a user with access to browser developer tools. Session storage reduces persistent exposure but does not make the key secret. For production, use a backend proxy and keep the API key in a server-side environment variable.
- Feedback and analytics remain local to the device because this version has no backend/database.
- Accounts and progress do not synchronize between devices.

## Run

Open `index.html` for local demo use. For PWA installation/offline testing, serve this folder over localhost or HTTPS. To run the smoke tests, use `node tests/smoke-test.js` from the project folder.
