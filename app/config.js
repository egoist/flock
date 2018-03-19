const Store = require('electron-store')

module.exports = new Store({
  name: 'flock',
  defaults: {
    lastWindowState: {
      width: 340,
      height: 620
    },
    activePageId: 'holymoly',
    pages: [
      {
        id: 'holymoly'
      }
    ]
  }
})
