/* ************************************************************************

   Copyright: 2023 ZenesisUK

   License: MIT license

   Authors: Will Johnson (WillsterJohnson)

************************************************************************ */

/**
 * Panel representation for the {@link zx.ui.accordion.minimap.Minicordion}
 */
qx.Class.define("zx.ui.accordion.minimap.MinicordionPanel", {
  extend: qx.ui.container.Composite,

  /**
   * @param {zx.ui.accordion.AccordionPanel} panel The accordion panel to mirror
   */
  construct(panel) {
    super(new qx.ui.layout.VBox());
    this.setPanel(panel);

    panel.bind("label", this.getChildControl("tooltip"), "label");
    this.add(this.getChildControl("header"));
    this.add(this.getChildControl("content"));
  },

  properties: {
    appearance: {
      init: "accordion-minimap-panel",
      refine: true
    },

    /**
     * The {@link zx.ui.accordion.AccordionPanel} to mirror.
     */
    panel: {
      check: "zx.ui.accordion.AccordionPanel",
      nullable: false,
      event: "changePanel",
      apply: "_applyPanel"
    },

    /**
     * The percentage by which to scale the height of the panel.
     *
     * Interpreted as `1` = 100%, `0.5` = 50%, &c.
     *
     * ! In normal use, this is automatically updated by the accordion system.
     * ! Manual changes will be overwritten, and may not have the desired effect.
     */
    scaleFactor: {
      check: "Number",
      nullable: false,
      event: "changeScalefactor",
      apply: "_applyScaleFactor",
      init: 0.186
    }
  },

  members: {
    __bindings: null,
    __listeners: null,

    /**
     * Apply for the panel property.
     */
    _applyPanel(value, oldValue) {
      if (oldValue) {
        this.__bindings.forEach(binding =>
          qx.data.SingleValueBinding.removeBindingFromObject(oldValue, binding)
        );
        this.__bindings = [];
        this.__listeners.forEach(listener => oldValue.removeListenerById(listener));
      }

      if (value) {
        this.__bindings = [];
        this.__bindings.push(value.bind("label", this.getChildControl("header"), "value"));
        this.__bindings.push(value.bind("visibility", this, "visibility"));
        this.__listeners = [];
        this.__listeners.push(value.addListener("sizeHintChanged", this._onPanelOpenChange, this));
      }
    },

    /**
     * Apply for the scaleFactor property.
     */
    _applyScaleFactor(value) {
      this._updateSize();
    },

    /**
     * Mirrors the open state of the panel.
     */
    _onPanelOpenChange(e) {
      this.getChildControl("content").setVisibility(e.getData() ? "visible" : "excluded");
      this._updateSize();
    },

    /**
     * Update the size of the panel to ensure changes to the scale factor are
     * reflected.
     */
    _updateSize() {
      this.setMaxHeight(Math.trunc(this.getPanel().getSizeHint().height * this.getScaleFactor()));
      this.getChildControl("content").setMaxHeight(
        Math.trunc(
          this.getPanel().getChildControl("content").getSizeHint().height * this.getScaleFactor()
        )
      );
      this.getChildControl("header").setMaxHeight(
        Math.trunc(
          this.getPanel().getChildControl("header").getSizeHint().height * this.getScaleFactor()
        )
      );
      this.getChildControl("content").setLines(
        Math.trunc(
          (this.getPanel().getChildControl("content").getSizeHint().height *
            this.getScaleFactor()) /
            2
        )
      );
    },

    /**
     * @override
     */
    _createChildControlImpl(id) {
      let control;
      switch (id) {
        case "tooltip":
          control = new qx.ui.tooltip.ToolTip("");
          break;
        case "header":
          control = new zx.ui.accordion.minimap.MinicordionHeader();
          control.setToolTip(this.getChildControl("tooltip"));
          break;
        case "content":
          control = new zx.ui.accordion.SkeletonText(
            Math.trunc(
              (this.getPanel().getChildControl("content").getSizeHint().height *
                this.getScaleFactor()) /
                4
            )
          );
          control.setToolTip(this.getChildControl("tooltip"));
          control.setVisibility(this.getPanel().getPanelOpen() ? "visible" : "excluded");
          control.setWidthScaleFactor(0.2);
          control.setAppearance("accordion-minimap-skeleton-text");
          control.init();
          break;
      }

      return control ?? super._createChildControlImpl(id);
    }
  }
});
