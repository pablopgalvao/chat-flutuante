// Modules to control application life and create native browser window
const {app, BrowserWindow, dailog} = require('electron')

//app.disableHardwareAcceleration()
//const electronReload = require('electron-reload')
const path = require('path')
//const config = require('./config')

/*
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});
*/

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 750,
    height: 600,
    x:990,
    //y:130,
    maximizable: false,
    icon: __dirname + '/src/dicas.png',
    //titleBarStyle: 'hidden',
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // Open the DevTools.
   mainWindow.webContents.openDevTools()
}
  console.log(process.env.APP_NAME)
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
