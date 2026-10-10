# LearnXAI — Personalized Learning & Career Intelligence

LearnXAI is a responsive, front-end prototype that demonstrates personalized learning through skill assessment, topic-level performance, dynamic gap detection, study recommendations, quizzes, a tutor demo, and career roadmaps.

## Features

- Student dashboard with performance charts
- Java multiple-choice skill assessment and automatic scoring
- Dynamic gap detection based on topic scores
- Personalized study recommendations
- Quiz and learning progress stored in browser `localStorage`
- AI tutor interface with **predefined demo responses** (not connected to a live AI API)
- Career roadmaps for Java, Full-Stack, and AI/ML
- Skill wallet and demo achievements
- Responsive desktop and mobile layout

## Run locally

**Option 1: Open directly**
1. Download or clone this repository.
2. Open `index.html` in a modern browser.

**Option 2: VS Code Live Server**
1. Open the project folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and select **Open with Live Server**.

The dashboard chart loads Chart.js from a CDN, so an internet connection is needed for that chart.

## Demo behavior and limitations

- This is a **front-end prototype**, not a production application.
- The default student name and initial statistics are sample data.
- Assessment scores, learning activities, roadmap checkboxes, and progress are saved in the current browser using `localStorage`.
- The tutor uses predefined responses. It does not call Gemini or any live AI service.
- Login is represented as a demo experience; there is no real authentication, backend, or MySQL database.
- Browser storage is not a secure place for sensitive personal data.

## Main files

- `index.html` — page structure and navigation
- `style.css` — responsive UI and styling
- `script.js` — demo state, quiz logic, gap detection, recommendations, charts, tutor responses, and roadmaps

## GitHub upload

1. Create a repository named `LearnXAI` on GitHub.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and `.gitignore` to the repository root.
3. Commit the files to the `main` branch.

You can also publish the site using GitHub Pages:
1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under the build/deployment section, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`, then save.
5. Wait for GitHub Pages to publish the site. The published URL will appear in the Pages settings.

## Suggested next steps

For a full-stack version, add a Java 17 + Spring Boot REST API, MySQL persistence, secure authentication, and a server-side Gemini integration. Keep all API keys on the server.
