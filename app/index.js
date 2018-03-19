const path = require('path')
const fs = require('fs')
const { app, BrowserWindow, Menu, ipcMain: ipc } = require('electron')
const createMenu = require('./menu')
const config = require('./config')
const pkg = require('./package')

require('electron-debug')()
require('electron-context-menu')({
  showInspectElement: true
})

const isDev =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV === 'development'
    : require('electron-is-dev')

let mainWindow
let isQuitting = false

// Set title of the app that will use shown in window titlebar
app.setName(pkg.productName)

const isAlreadyRunning = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

if (isAlreadyRunning) {
  app.quit()
}

function createMainWindow() {
  const lastWindowState = config.get('lastWindowState')

  const win = new BrowserWindow({
    title: app.getName(),
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 200,
    minHeight: 900,
    titleBarStyle: 'hidden',
    backgroundColor: '#fff'
    // transparent: true
  })

  win.$config = config

  const url = `file://${path.join(__dirname, 'renderer', 'index.html')}`

  win.loadURL(url)

  win.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()

      if (process.platform === 'darwin') {
        app.hide()
      } else {
        win.hide()
      }
    }
  })

  win.on('page-title-updated', e => {
    e.preventDefault()
  })

  return win
}

app.on('ready', () => {
  Menu.setApplicationMenu(createMenu())
  mainWindow = createMainWindow()

  if (isDev) {
    const {
      default: installExtension,
      VUEJS_DEVTOOLS
    } = require('electron-devtools-installer')

    installExtension(VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
  }
})

app.on('activate', () => {
  mainWindow.show()
})

app.on('before-quit', () => {
  isQuitting = true

  if (!mainWindow.isFullScreen()) {
    config.set('lastWindowState', mainWindow.getBounds())
  }
})
