import jQuery from 'jquery'
import lodashUniq from 'lodash/uniq'

const $selectedFileTabHeader = jQuery('.tab-bar .tab[data-name="selected-file"]')
const $tabBar = jQuery('.tab-bar')
const $allFilesContainer = jQuery('.info-box-file-list-container')
const $topStats = jQuery('.highlight-box')
const $searchInput = jQuery('#info-box-input')

export class TabBar {
  constructor() {
    this.currentTab = window.vizState.infoBoxMode
    this.previousTab = null
  }

  initialize(nodeForceLayout, selectedNodeDetails, getsRecompiledList, causeRecompileList) {
    this.nodeForceLayout = nodeForceLayout
    this.selectedNodeDetails = selectedNodeDetails
    this.getsRecompiledList = getsRecompiledList
    this.causeRecompileList = causeRecompileList

    const that = this
    $tabBar.on('click', '.tab', function () {
      const $this = jQuery(this)
      if (!$this.hasClass('active')) {
        that.switchTab($this.data('name'))
      }
    })
  }

  switchTab(newTab) {
    if (this.currentTab === newTab) return
    this.previousTab = this.currentTab
    this.currentTab = newTab
    window.vizState.infoBoxMode = newTab

    const $tab = $tabBar.find(`[data-name="${newTab}"]`)
    $tab.siblings().removeClass('active')
    $tab.addClass('active')

    switch (newTab) {
      case 'top-stats': {
        $allFilesContainer.hide()
        $topStats.show()
        $selectedFileTabHeader.hide()
        this.highlightTopStats()
        this.selectedNodeDetails.hide()

        break
      }

      case 'all-files': {
        $allFilesContainer.show()
        $topStats.hide()
        $selectedFileTabHeader.hide()

        const searchText = $searchInput.val()
        this.nodeForceLayout.filterHighlightSearch(searchText)
        this.selectedNodeDetails.hide()

        break
      }

      case 'selected-file': {
        $allFilesContainer.hide()
        $topStats.hide()
        $selectedFileTabHeader.show()

        break
      }
    }
  }

  highlightTopStats() {
    const topGetsRecompiled = this.getsRecompiledList.getTopFiles()
                                  .map(d => d.id)

    const topCausesRecompile = this.causeRecompileList.getTopFiles()
                                   .map(d => d.id)

    const topFiles = lodashUniq(topGetsRecompiled.concat(topCausesRecompile))

    this.nodeForceLayout.restoreGraph()
    this.nodeForceLayout.filterHightlightNodes(topFiles)
  }

  restorePreviousTab() {
    if (this.previousTab) {
      this.switchTab(this.previousTab)
    }

    return this.currentTab
  }
}
