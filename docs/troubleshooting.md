---
title: Troubleshooting
---

# Troubleshooting

## GitHub Pages doesn’t update
- Ensure the `docs/` folder is selected in Settings → Pages.
- Confirm the branch (usually `main`) is correct.
- Check Pages build logs under Actions or Pages panel.

## Assets not loading
- Use relative paths (`assets/...`) in HTML/JS.
- Ensure files are committed and in the repository.

## Local file restrictions
- Browsers can block local file access when opening `index.html` directly.
- Serve the folder with a local server (e.g., `npx serve`, Live Server) for consistent behavior.

## Styling looks different on Pages
- GitHub Pages applies the selected Jekyll theme (Cayman here).
- Your app styles (`styles.css`) affect the app, not the wiki. If desired, add custom CSS for this wiki in `docs/style.css` and reference it via HTML includes.
