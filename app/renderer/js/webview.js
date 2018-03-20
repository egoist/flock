const { ipcRenderer: ipc } = require('electron')

document.addEventListener('DOMContentLoaded', () => {
  // const style = document.createElement('style')
  // style.textContent = `
  // a[href="/compose/tweet"] {
  //   margin-bottom: 1.3rem !important;
  // }
  // `
  // document.head.appendChild(style)

  ipc.sendToHost('ready')
  if (location.pathname === '/') {
    const name = window.__INITIAL_STATE__.session.user.name
    if (name) {
      ipc.sendToHost('set-name', name)
    }
  }
})
