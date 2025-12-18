# 🎲 Lucky3D Viewer

Electron aplikácia pre prezeranie 3D modelov určených na 3D tlač.

## ✨ Funkcie

- 🔍 Prezeranie STL a OBJ súborov
- 🖱️ Interaktívne ovládanie (otáčanie, posúvanie, zoom)
- 📊 Zobrazenie informácií o modeli (vertices, faces, rozmery)
- 🔲 Wireframe režim
- 📏 Prepínateľná mriežka
- 🎯 Drag & Drop podpora
- 🌙 Tmavý moderný dizajn

## 🚀 Inštalácia a spustenie

### 1. Nainštaluj Node.js
Stiahni a nainštaluj Node.js z https://nodejs.org/ (verzia 18 alebo vyššia)

### 2. Nainštaluj závislosti
Otvor terminál v priečinku projektu a spusti:

```bash
npm install
```

### 3. Spusti aplikáciu (Development)
```bash
npm start
```

## 📦 Buildovanie aplikácie

### Build pre Windows
```bash
npm run build:win
```
Vytvorí inštalátor a portable verziu v priečinku `dist/`

### Build pre macOS
```bash
npm run build:mac
```
Vytvorí DMG a ZIP súbor

### Build pre Linux
```bash
npm run build:linux
```
Vytvorí AppImage a DEB balíček

### Build pre všetky platformy
```bash
npm run build
```

## 🎮 Ovládanie

- **Ľavé tlačidlo myši + pohyb**: Otáčanie modelu
- **Pravé tlačidlo myši + pohyb**: Posúvanie kamery
- **Koliesko myši**: Zoom in/out
- **Ctrl+O**: Otvoriť súbor
- **Ctrl+Q**: Ukončiť aplikáciu

## 📁 Podporované formáty

- ✅ STL (Standard Triangle Language) - najbežnejší formát pre 3D tlač
- ✅ OBJ (Wavefront Object)

## 🛠️ Technológie

- **Electron**: Desktop framework
- **Three.js**: 3D grafická knižnica
- **Node.js**: Runtime prostredie

## 📂 Štruktúra projektu

```
LUCKY3D/
├── main.js           # Hlavný proces Electronu
├── index.html        # UI aplikácie
├── renderer.js       # Renderer proces (3D viewer logika)
├── styles.css        # Štýly
├── package.json      # Konfigurácia projektu
├── assets/          # Ikony (pridaj vlastné)
└── dist/            # Buildnuté aplikácie (po buildu)
```

## 🔧 Riešenie problémov

### Aplikácia sa nespustí
```bash
# Vymaž node_modules a nainštaluj znova
rm -rf node_modules package-lock.json
npm install
```

### Problémy s buildovaním
```bash
# Nainštaluj electron-builder globálne
npm install -g electron-builder

# Alebo použi npx
npx electron-builder --win
```

### Model sa nenačíta
- Skontroluj, či je súbor platný STL/OBJ formát
- Skús menší model
- Skontroluj konzolu (F12) pre chybové hlášky

## 🎨 Prispôsobenie

### Zmena farby modelu
V súbore `renderer.js`, riadok s MaterialOM:
```javascript
const material = new THREE.MeshPhongMaterial({
    color: 0x00d4ff, // Zmeň túto hex farbu
    ...
});
```

### Zmena veľkosti okna
V súbore `main.js`, vo funkcii `createWindow()`:
```javascript
mainWindow = new BrowserWindow({
    width: 1200,  // Šírka
    height: 800,  // Výška
    ...
});
```

## 📝 Licencia

MIT

## 👤 Autor

Filip - Lucky3D Viewer

---

**Vyrobené s ❤️ a Electronom**
