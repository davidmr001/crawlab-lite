import Vue from 'vue'
import request from '../../api/request'

const state = {
  // list of spiders
  spiderList: [],

  spiderTotal: 0,

  // list of spider versions
  spiderVersionList: [],

  spiderVersionTotal: 0,

  // active spider data
  spiderForm: {},

  // upload form for importing spiders
  importForm: {
    url: '',
    type: 'github'
  },

  // spider overview stats
  overviewStats: {},

  // spider status stats
  statusStats: [],

  // spider daily stats
  dailyStats: [],

  // filters
  filterSite: '',

  // preview crawl data
  previewCrawlData: [],

  // spider file tree
  fileTree: {}
}

const getters = {}

const mutations = {
  SET_SPIDER_FORM(state, value) {
    state.spiderForm = value
  },
  SET_SPIDER_LIST(state, value) {
    state.spiderList = value
  },
  SET_SPIDER_TOTAL(state, value) {
    state.spiderTotal = value
  },
  SET_SPIDER_VERSION_LIST(state, value) {
    state.spiderVersionList = value
  },
  SET_SPIDER_VERSION_TOTAL(state, value) {
    state.spiderVersionTotal = value
  },
  SET_IMPORT_FORM(state, value) {
    state.importForm = value
  },
  SET_OVERVIEW_STATS(state, value) {
    state.overviewStats = value
  },
  SET_STATUS_STATS(state, value) {
    state.statusStats = value
  },
  SET_DAILY_STATS(state, value) {
    state.dailyStats = value
  },
  SET_PREVIEW_CRAWL_DATA(state, value) {
    state.previewCrawlData = value
  },
  SET_SPIDER_FORM_CONFIG_SETTINGS(state, payload) {
    const settings = {}
    payload.forEach(row => {
      settings[row.name] = row.value
    })
    Vue.set(state.spiderForm.config, 'settings', settings)
  },
  SET_FILE_TREE(state, value) {
    state.fileTree = value
  }
}

const actions = {
  getSpiderList({ state, commit }, params = {}) {
    return request.get('/spiders', params)
      .then(response => {
        if (!response || !response.data || !response.data.data) {
          return
        }
        commit('SET_SPIDER_LIST', response.data.data.list || [])
        commit('SET_SPIDER_TOTAL', response.data.data.total || 0)
      })
  },
  editSpider({ state, dispatch }) {
    return request.post(`/spiders/${state.spiderForm.id}`, state.spiderForm)
  },
  deleteSpider({ state, dispatch }, id) {
    return request.delete(`/spiders/${id}`)
  },
  getSpiderData({ state, commit }, id) {
    return request.get(`/spiders/${id}`)
      .then(response => {
        const data = response.data.data
        commit('SET_SPIDER_FORM', data)
      })
  },
  crawlSpider({ state, dispatch }, payload) {
    const { spiderId, spiderVersionId, cmd } = payload
    return request.post(`/tasks`, {
      spider_id: spiderId,
      spider_version_id: spiderVersionId,
      cmd: cmd
    })
  },
  getDir({ state, commit }, path) {
    const id = state.spiderForm.id
    return request.get(`/spiders/${id}/dir`)
      .then(response => {
        commit('')
      })
  },
  importGithub({ state }) {
    const url = state.importForm.url
    return request.post('/spiders/import/github', { url })
  },
  getSpiderStats({ state, commit }) {
    return request.get(`/spiders/${state.spiderForm.id}/stats`)
      .then(response => {
        commit('SET_OVERVIEW_STATS', response.data.data.overview)
        // commit('SET_STATUS_STATS', response.data.task_count_by_status)
        commit('SET_DAILY_STATS', response.data.data.daily)
        // commit('SET_NODE_STATS', response.data.task_count_by_node)
      })
  },
  getPreviewCrawlData({ state, commit }) {
    return request.post(`/spiders/${state.spiderForm.id}/preview_crawl`)
      .then(response => {
        commit('SET_PREVIEW_CRAWL_DATA', response.data.items)
      })
  },
  extractFields({ state, commit }) {
    return request.post(`/spiders/${state.spiderForm.id}/extract_fields`)
  },
  postConfigSpiderConfig({ state }) {
    return request.post(`/config_spiders/${state.spiderForm.id}/config`, state.spiderForm.config)
  },
  saveConfigSpiderSpiderfile({ state, rootState }) {
    const content = rootState.file.fileContent
    return request.post(`/config_spiders/${state.spiderForm.id}/spiderfile`, { content })
  },
  addSpider({ state }) {
    return request.post(`/spiders`, state.spiderForm)
  },
  getSpiderVersionList({ state, commit }, params = {}) {
    const { spider_id } = params
    return request.get(`/spiders/${spider_id}/versions`)
      .then(response => {
        if (!response || !response.data || !response.data.data) {
          return
        }
        commit('SET_SPIDER_VERSION_LIST', response.data.data.list || [])
        commit('SET_SPIDER_VERSION_TOTAL', response.data.data.total || 0)
      })
  },
  deleteSpiderVersion({ state, dispatch }, payload) {
    const { spider_id, version_id } = payload
    return request.delete(`/spiders/${spider_id}/versions/${version_id}`)
  },
  async getScheduleList({ state, commit }, payload) {
    const { id } = payload
    const res = await request.get(`/spiders/${id}/schedules`)
    let data = res.data.data
    if (data) {
      data = data.map(d => {
        const arr = d.cron.split(' ')
        arr.splice(0, 1)
        d.cron = arr.join(' ')
        return d
      })
    }
    commit('schedule/SET_SCHEDULE_LIST', data, { root: true })
  },
  async getFileTree({ state, commit }, payload) {
    const id = payload ? payload.id : state.spiderForm.id
    const res = await request.get(`/spiders/${id}/file/tree`)
    commit('SET_FILE_TREE', res.data.data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
