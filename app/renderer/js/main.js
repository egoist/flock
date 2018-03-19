const path = require('path')
const { remote, ipcRenderer: ipc } = require('electron')
const Vue = require('vue/dist/vue')
const contextMenu = require('electron-context-menu')
const Vuex = require('vuex')
const Twitter = require('./components/Twitter')

Vue.config.productionTip = false

const win = remote.getCurrentWindow()
const config = win.$config

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    activePageId: config.get('activePageId'),
    pages: JSON.parse(JSON.stringify(config.get('pages')))
  },
  mutations: {
    setActivePageId(state, id) {
      state.activePageId = id
      config.set('activePageId', id)
    },
    addPage(state, page) {
      state.pages.push(page)
      state.activePageId = page.id
      config.set('pages', state.pages)
    },
    setCurrentPageName(state, name) {
      state.pages = state.pages.map(page => {
        if (page.id === state.activePageId) {
          page.name = name
          return page
        }
        return page
      })
    }
  }
})

const AppHeader = {
  template: `
  <header class="app-header">
    <div class="title" @click="isExpanded = !isExpanded">
      <span>{{ activePage.name || 'Flock' }}</span>
      <span
        class="arrow"
        :class="{up: isExpanded, down: !isExpanded}">
      </span>
    </div>
    <div class="dropdown" v-if="isExpanded">
      <div
        class="dropdown-item"
        @click="switchPage(page.id)"
        v-for="page in pages"
        :key="page.id">
        {{ page.name || 'Flock' }}
      </div>
      <div class="dropdown-item" @click="addAccount">
      Add account
      </div>
    </div>
  </header>
  `,
  data() {
    return {
      isExpanded: false
    }
  },
  computed: {
    activePageId() {
      return this.$store.state.activePageId
    },
    pages() {
      return this.$store.state.pages.filter(
        page => page.id !== this.activePageId
      )
    },
    activePage() {
      return this.$store.state.pages.find(page => page.id === this.activePageId)
    }
  },
  methods: {
    switchPage(id) {
      this.isExpanded = false
      this.$store.commit('setActivePageId', id)
    },
    addAccount() {
      this.isExpanded = false
      this.$store.commit('addPage', {
        id: Date.now()
      })
    }
  }
}

const App = {
  name: 'app',
  store,
  template: `
  <div id="app">
    <app-header />
    <div
      class="page"
      v-for="page in pages"
      :key="page.id" v-show="$store.state.activePageId === page.id">
      <twitter :id="page.id" />
    </div>
  </div>
  `,
  computed: {
    pages() {
      return this.$store.state.pages
    }
  },
  mounted() {
    this.watchWebview()
    this.$watch(
      'pages',
      () => {
        this.watchWebview()
      },
      {
        deep: true
      }
    )
  },
  methods: {
    watchWebview() {
      document.querySelectorAll('.webview').forEach(el => {
        const hasIpc = el.getAttribute('data-ipc')
        if (hasIpc) return

        el.setAttribute('data-ipc', true)
        el.addEventListener('ipc-message', e => {
          if (e.channel === 'ready') {
            const isReady = el.getAttribute('data-ready')
            if (isReady) return

            el.setAttribute('data-ready', true)
            contextMenu({
              window: el
            })
          }
          if (e.channel == 'set-name') {
            const name = e.args[0]
            this.$store.commit('setCurrentPageName', name)
          }
        })
      })
    }
  },
  components: {
    Twitter,
    AppHeader
  }
}

new Vue({
  el: '#app',
  render: h => h(App)
})
