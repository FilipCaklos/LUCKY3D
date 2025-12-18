const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false  // Povoliť načítanie Three.js z CDN
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');

  // Menu
  const template = [
    {
      label: 'Súbor',
      submenu: [
        {
          label: 'Otvoriť 3D model',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            openFileDialog();
          }
        },
        { type: 'separator' },
        {
          label: 'Ukončiť',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Pohľad',
      submenu: [
        { role: 'reload', label: 'Obnoviť' },
        { role: 'toggleDevTools', label: 'DevTools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Resetovať Zoom' },
        { role: 'zoomIn', label: 'Priblížiť' },
        { role: 'zoomOut', label: 'Oddialiť' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Celá obrazovka' }
      ]
    },
    {
      label: 'Pomoc',
      submenu: [
        {
          label: 'O aplikácii',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'O Lucky3D Viewer',
              message: 'Lucky3D Viewer v1.0.0',
              detail: '3D Model Viewer pre 3D tlač\n\nPodporované formáty: STL, OBJ Support na: discord.gg/dkx8wdQjWG'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function openFileDialog() {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: '3D Models', extensions: ['stl', 'obj'] },
      { name: 'STL Files', extensions: ['stl'] },
      { name: 'OBJ Files', extensions: ['obj'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileData = fs.readFileSync(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();
      
      mainWindow.webContents.send('load-model', {
        data: fileData,
        extension: fileExtension,
        filename: path.basename(filePath)
      });
    }
  });
}

// IPC handlers
ipcMain.on('open-file', () => {
  openFileDialog();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
