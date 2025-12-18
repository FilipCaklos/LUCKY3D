---
title: Getting Started
---

# Getting Started

This guide helps you run LUCKY3D locally and prepare it for distribution.

## Prerequisites
- A modern browser (Chrome, Edge, Firefox) for simple static usage.
- Node.js (optional) if the app uses `npm` scripts or Electron (see below).

## Run Locally (Static)
1. Clone or download the repository.
2. Open `index.html` directly in your browser.
3. Drag and drop compatible files into the drop zone.

> Tip: If local file access is restricted by your browser, serve the folder via a tiny local server (e.g. `npx serve` or VS Code Live Server).

## Run via Node/Electron (If Available)
If `package.json` contains a `start` script, you can run:

```bash
npm install
npm start
```

If the app is Electron-based, the above will launch the desktop viewer. If not, `npm start` may serve the site for local development.

## Development
- Edit UI styles in `styles.css`.
- Update logic in `main.js` and `renderer.js`.
- Keep assets in `assets/`.

## Deployment to GitHub Pages
- Push the repository to GitHub.
- In GitHub: Settings → Pages → Source: "Deploy from a branch".
- Select branch: `main` (or `master`) and folder: `/docs`.
- Save; wait for the build to finish. Your site will be available at `https://<your-username>.github.io/<repo-name>/`.
