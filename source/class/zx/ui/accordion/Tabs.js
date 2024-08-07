/* ************************************************************************

   Copyright: 2024 ZenesisUK

   License: MIT license

   Authors: Will Johnson (WillsterJohnson)

************************************************************************ */

/**
 * Tabs for large {@link zx.ui.accordion.Accordion}s.
 */
qx.Class.define("zx.ui.accordion.Tabs", {
  extend: qx.ui.container.Composite,

  /**
   * @param {zx.ui.accordion.Accordion} accordion The accordion to provide tabs for
   */
  construct(accordion) {
    super(new qx.ui.layout.HBox());

    this.__panels = new Map();
    this.__listeners = new Map();
    this.__accordion = accordion;

    this.add(this.getQxObject("btnExpandAllNone"));

    const panelGroup = accordion.getChildControl("panelgroup");
    panelGroup.addListener("panelAdd", this._onPanelAdd, this);
    panelGroup.addListener("panelRemove", this._onPanelRemove, this);
    panelGroup.getChildren().forEach(panel => this._addTab(panel));
  },

  events: {
    /**
     * Fired when a tab is tapped.
     */
    tabTap: "qx.event.type.Data",

    /** Fired when expand all/none is fired */
    expandAllNone: "qx.event.type.Event"
  },

  properties: {
    /** Whether to include an expand all/none link after the tabs */
    showExpandAllNone: {
      init: true,
      check: "Boolean",
      nullable: false,
      event: "changeShowExpandAllNone",
      apply: "_applyShowExpandAllNone"
    },

    activeTab: {
      check: "zx.ui.accordion.AccordionPanel",
      apply: "_applyActiveTab",
      nullable: true,
      init: null
    }
  },

  objects: {
    btnExpandAllNone() {
      let btn = new qx.ui.form.Button(this.tr("Expand All/None")).set({
        appearance: "accordion-tab-button"
      });
      btn.addListener("tap", () => this.fireEvent("expandAllNone"));
      return btn;
    }
  },

  members: {
    /**@type {Map<string, zx.ui.accordion.minimap.MinicordionPanel>}*/
    __panels: null,

    /**@type {Map<string, unknown>}*/
    __listeners: null,

    /**@type {zx.ui.accordion.Accordion}*/
    __accordion: null,

    _applyActiveTab(value, oldValue) {
      if (oldValue) {
        let oldActiveTab = this.__panels.get(oldValue.toHashCode());
        oldActiveTab?.removeState("active");
        oldActiveTab.getChildControl("label").removeState("active");
      }
      if (value) {
        let newActiveTab = this.__panels.get(value.toHashCode());
        newActiveTab?.addState("active");
        newActiveTab.getChildControl("label").addState("active");
      }
    },

    /**
     * Adds a panel to the minimap when it is added to the accordion.
     */
    _onPanelAdd(e) {
      this._addTab(e.getData());
    },

    /**
     * Removes a panel from the minimap when it is removed from the accordion.
     */
    _onPanelRemove(e) {
      this._removePanel(e.getData());
    },

    /**
     * Apply for the `showExpandAllNone` property.
     */
    _applyShowExpandAllNone(value, oldValue) {
      this.getQxObject("btnExpandAllNone").setVisibility(value ? "visible" : "excluded");
    },

    /**
     * Adds a panel to the minimap.
     *
     * @param {zx.ui.accordion.AccordionPanel} panel The panel to add
     */
    _addTab(panel) {
      const panelHash = panel.toHashCode();
      if (this.__panels.has(panelHash)) {
        this._removePanel(this.__panels.get(panelHash));
      }
      let tab = new qx.ui.form.Button();
      panel.bind("label", tab, "label");
      tab.setAppearance("accordion-tab-button");
      this.addAt(tab, this.getChildren().length - 1);
      this.__listeners.set(
        panelHash,
        tab.addListener("tap", () => this.fireDataEvent("tabTap", panel))
      );
      this.__panels.set(panelHash, tab);
    },

    /**
     * Removes a panel from the minimap.
     *
     * @param {zx.ui.accordion.AccordionPanel} panel The panel to remove
     */
    _removePanel(panel) {
      const panelHash = panel.toHashCode();
      if (this.__panels.has(panelHash)) {
        this.remove(this.__panels.get(panelHash));
        this.__panels.get(panelHash).removeListener(this.__listeners.get(panelHash));
        this.__panels.get(panelHash).dispose();
        this.__panels.delete(panelHash);
        this.__listeners.delete(panelHash);
      }
    }
  }
});
