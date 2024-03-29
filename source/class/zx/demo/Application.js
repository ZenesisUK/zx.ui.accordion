/* ************************************************************************

   Copyright: 2023 ZenesisUK

   License: MIT license

   Authors: Will Johnson (WillsterJohnson)

************************************************************************ */

/**
 * This is the main application class of "zx"
 */
qx.Class.define("zx.demo.Application", {
  extend: qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main() {
      super.main();
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      // accordion
      const accordion = new zx.ui.accordion.Accordion(true, true);

      const panels = Array.from({ length: 50 }, (_, i) => {
        const panel = new zx.ui.accordion.AccordionPanel(`Panel ${i}`);

        panel.setLayout(i % 2 ? new qx.ui.layout.VBox(0) : new qx.ui.layout.HBox(0));

        panel.add(this.__makeLoremBox(`Panel ${i}-1`), { flex: 1 });
        panel.add(this.__makeLoremBox(`Panel ${i}-2`), { flex: 1 });
        panel.add(this.__makeLoremBox(`Panel ${i}-3`), { flex: 1 });
        return panel;
      });

      panels.forEach(panel => accordion.add(panel));

      const doc = this.getRoot();
      doc.add(accordion, { top: 45, left: 45, right: 45, bottom: 45 });

      window.panelFilter = ([cmd]) => {
        const [act, who] = cmd.split(" ");

        if (act === "hide" || act === "h") {
          if (who === "all" || who === "a") return panels.forEach(panel => panel.exclude());
          return panels[+who].exclude();
        }

        if (act === "show" || act === "s") {
          if (who === "all" || who === "a") return panels.forEach(panel => panel.show());
          return panels[+who].show();
        }

        if (act === "open" || act === "o") {
          if (who === "all" || who === "a")
            return panels.forEach(panel => panel.setPanelOpen(true));
          return panels[+who].setPanelOpen(true);
        }

        if (act === "close" || act === "c") {
          if (who === "all" || who === "a")
            return panels.forEach(panel => panel.setPanelOpen(false));
          return panels[+who].setPanelOpen(false);
        }

        if (act === "kill" || act === "k") {
          if (who === "all" || who === "a")
            return panels.forEach(panel => (accordion.remove(panel), panel.destroy()));
          return accordion.remove(panels[+who]), panels[+who].destroy(), panels.splice(+who, 1);
        }

        console.log("Usage:", "[hide|show|open|close|h|s|o|c] [all|a|<page-no>]");
      };
    },

    __makeLoremBox(name) {
      const lorem = new qx.ui.basic.Label(
        `<h3>${
          name ?? "Lorem Ipsum"
        }</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae diam eget risus varius blandit sit amet non magna. Nullam quis risus eget urna mollis ornare vel eu leo. Donec id elit non mi porta gravida at eget metus.</p>`
      );
      lorem.setRich(true);
      return lorem;
    }
  }
});
