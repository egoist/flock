const path = require('path')

const webviewScript = path.join(__dirname, '../webview.js')

module.exports = {
  name: 'Twitter',
  props: ['id'],
  template: `
  <webview
    class="webview"
    src="https://mobile.twitter.com"
    :partition="'persist:' + id"
    preload="${webviewScript}"
    >
  </webview>
  `
}
