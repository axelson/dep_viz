import jQuery from 'jquery'

const $selectedFileTabHeader = jQuery('.tab-bar .tab[data-name="selected-file"]')
const $tabBar = jQuery('.tab-bar')
const $allFilesContainer = jQuery('.info-box-file-list-container')
const $topStats = jQuery('.highlight-box')


export class TabBar {
  constructor() {
    this.currentTab = window.vizState.infoBoxMode
    this.previousTab = null
  }

  initialize(nodeForceLayout) {
    this.nodeForceLayout = nodeForceLayout

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

    const {selectedNode} = window.vizState

    const $tab = $tabBar.find(`[data-name="${newTab}"]`)
    console.log('$tab', $tab);
    $tab.siblings().removeClass('active')
    $tab.addClass('active')

    switch (newTab) {
      case 'top-stats': {
        $allFilesContainer.hide()
        $topStats.show()
        $selectedFileTabHeader.hide()

        break
      }

      case 'all-files': {
        $allFilesContainer.show()
        $topStats.hide()
        $selectedFileTabHeader.hide()

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

  restorePreviousTab() {
    console.log('this.previousTab', this.previousTab);
    if (this.previousTab) {
      console.log('restore!')
      this.switchTab(this.previousTab)
    }
  }
}
