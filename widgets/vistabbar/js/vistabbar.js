/*
    ioBroker.vis vistabbar Widget-Set

    version: "0.0.1"

    Copyright 2020 mbecker mats.becker@gmail.com
*/
"use strict";

// add translations for edit mode
$.get("adapter/vistabbar/words.js", function (script) {
  let translation = script.substring(script.indexOf("{"), script.length);
  translation = translation.substring(0, translation.lastIndexOf(";"));
  $.extend(systemDictionary, JSON.parse(translation));
});

// this code can be placed directly in vistabbar.html
vis.binds["vistabbar"] = {
  version: "0.0.1",
  showVersion: function () {
    if (vis.binds["vistabbar"].version) {
      console.log("Version vistabbar: " + vis.binds["vistabbar"].version);
      vis.binds["vistabbar"].version = null;
    }
  },
  createWidget: function (widgetID, view, data, style) {
    var $div = $("#" + widgetID);
    // if nothing found => wait
    if (!$div.length) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createWidget(widgetID, view, data, style);
      }, 100);
    }

    var text = "";
    text += "OID: " + data.oid + "</div><br>";
    text += 'OID value: <span class="myset-value">' + vis.states[data.oid + ".val"] + "</span><br>";
    text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + "</span><br>";
    text += "extraAttr: " + data.extraAttr + "<br>";
    text += "Browser instance: " + vis.instance + "<br>";
    text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || "") + "</textarea><br>";

    $("#" + widgetID).html(text);

    // subscribe on updates of value
    if (data.oid) {
      vis.states.bind(data.oid + ".val", function (e, newVal, oldVal) {
        $div.find(".vistabbar-value").html(newVal);
      });
    }
  },
  createPanelProgress: function (widgetID, view, data, style) {
    var node = document.getElementById(widgetID);

    // if nothing found => wait
    if (!node) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createPanelProgress(widgetID, view, data, style);
      }, 100);
    }

    if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
        // FastClick.attach(node);
      }, false);
    }

    // TODO: Check the following prams: data.title
    
    var switchObjectVal = vis.states[data.oid1 + '.val'];
    var powerObjectVal = vis.states[data.oid2 + '.val'];
  
    /*
     * Panel Column
     */
    // Heading
    var panelColumnHeading = document.createElement("div");
    panelColumnHeading.className = "vistabbar-panel-column vistabbar-height-20";
    var heading = document.createElement("h3")
    heading.className = "vistabbar-panel-heading";
    heading.innerText = data.title;
    panelColumnHeading.appendChild(heading);

    // Icon
    var panelColumnIcon = document.createElement("div");
    panelColumnIcon.className = "vistabbar-panel-column vistabbar-height-60";
    var icon = document.createElement("i");
    icon.className = "material-icons";    
    icon.style.color = vis.binds.vistabbar.getIconColor(switchObjectVal, data.iconcoloron, data.iconcoloroff);
    icon.innerHTML = vis.binds.vistabbar.getIcon(switchObjectVal, data.iconon, data.iconoff);
    panelColumnIcon.appendChild(icon);  
    

    var panelColumns = document.createElement("div");
    panelColumns.className = "vistabbar-height-100";
    panelColumns.appendChild(panelColumnHeading);
    panelColumns.appendChild(panelColumnIcon);

    /*
     * Panel Row
     */
    var panelRow = document.createElement("div");
    panelRow.className = "vistabbar-panel-row-progress vistabbar-height-20";
    var panelRowInfo = document.createElement("div");
    panelRowInfo.className = "vistabbar-panel-row-info-progress";
    var panelRowInfoP = document.createElement("p");
    panelRowInfoP.className = "vistabbar-panel-row-info-value-progress";
    panelRowInfoP.innerText = vis.binds.vistabbar.getPanelProgessValue(powerObjectVal, data);;
    // Append: panelrow
    panelRowInfo.appendChild(panelRowInfoP);
    panelRow.appendChild(panelRowInfo);

    /*
     * Panel Node
     */
    node.appendChild(panelColumns);
    // node.appendChild(panelColumnIcon);
    node.appendChild(panelRow);

    // Add click event handler to node
    var nodeOriginalBackground = panelColumnHeading.style.background;
    node.addEventListener('touchstart', function(e) {
      panelColumns.style.background = data.clickcolor;
      e.preventDefault();
		}, false);
    node.addEventListener('touchend', function(e) {
      panelColumns.style.background = nodeOriginalBackground;
      vis.binds.vistabbar.setState(data);
      e.preventDefault();
    }, false);
    // node.addEventListener('mousedown', function(e) {
    //   panelColumnHeading.style.background = data.clickcolor;
    //   e.preventDefault();
		// }, false);
    // node.addEventListener('mouseup', function(e) {
    //   panelColumnHeading.style.background = nodeOriginalBackground;
    //   vis.binds.vistabbar.setState(data);
    //   e.preventDefault();
		// }, false);
    node.addEventListener("click", function (e) {
      vis.binds.vistabbar.setState(data);

      // Simulate click
      panelColumns.style.background = data.clickcolor;
      setTimeout(() => {
        panelColumns.style.background = nodeOriginalBackground;
      }, data.clickdelay);
      e.preventDefault();
    }, false);

    
    /*
     * RESIZE (icon, progress bar)
     */
    // Resize the icon baed on the panel height
    panelRowInfoP.style.width = node.clientWidth + "px"; // "p"-element widt to align the text into the center
    icon.style.fontSize = (node.clientHeight / 160) * 62 + "px"; // Height of Icon: containe rheight 140px - font height 48px
    // Seth the width of the progress bar
    panelRowInfo.style.width = vis.binds.vistabbar.getProgress(powerObjectVal, data) + "%";

    /*
     * SUBSCRIBE
     */
    if (data.oid2) {
      vis.states.bind(data.oid2 + ".val", function (e, newVal, oldVal) {
        panelRowInfoP.innerText = vis.binds.vistabbar.getPanelProgessValue(newVal, data);
        panelRowInfo.style.width = vis.binds.vistabbar.getProgress(newVal, data) + "%";
      });
    }

    if (data.oid1) {
      vis.states.bind(data.oid1 + ".val", function (e, newVal, oldVal) {
        icon.style.color = vis.binds.vistabbar.getIconColor(newVal, data.iconcoloron, data.iconcoloroff);
        icon.innerHTML = vis.binds.vistabbar.getIcon(newVal, data.iconon, data.iconoff);
      });
    }

  },
  setState(data) {
    if(vis.binds.vistabbar.isEditeMode()) return;
      var tmpVal = vis.states[data.oid1 + '.val'];
      if(typeof tmpVal !== "boolean") {
        // data value is not type of boolean; so identify which value is given at the moment an then just set to the opposite
        if(tmpVal === data.minvalue) vis.setValue(data.oid1, data.maxvalue);
        if(tmpVal === data.maxvalue) vis.setValue(data.oid1, data.minvalue);
      } else {
        // data value is type of boolean; just use the opposote of the boolean value
        vis.setValue(data.oid1, !tmpVal);
      }
  },
  getProgress(val, data) {
    if(typeof val === "boolean") {
      if(val) return 100;
      return 0;
    }
    if(typeof val !== "number") {
      val = Number.parseFloat(val).toFixed(0);
    }
    return (val - data.minvalue) / (data.maxvalue - data.minvalue) * 100;
  },
  getIconColor(val, iconcoloron, iconcoloroff) {
    if (typeof val !== "boolean") return "#fff";
    return val ? iconcoloron : iconcoloroff;
  },
  getIcon(val, iconon, iconoff) {
    // TODO: Hanle non boolean values
    if (typeof val !== "boolean") return "tag_faces";
    if (val) return String(iconon);
    return String(iconoff);
  },
  getPanelProgessValue(val, data) {
    if(typeof val !== "number") return data.prefix + vis.binds.vistabbar.getBooleanText(val) + data.suffix;
    return data.prefix + Number.parseFloat(val).toFixed(data.numberdecimals) + data.suffix;
  },
  createPanel: function (widgetID, view, data, style) {
    var $div = $("#" + widgetID);
    // if nothing found => wait
    if (!$div.length) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createPanel(widgetID, view, data, style);
      }, 100);
    }

    var oidVal = vis.states[data.oid + '.val'];
    var text = '';
    text += '<div class="vistabbar-panel-column" >';
    text += '<!-- <div class="vistabbar-panel-heading"></div> --> ';
    text += '<h3 class="vistabbar-panel-heading">' + data.title + '</h3> ';
    text += '</div>';
    text += '<div class="vistabbar-panel-row">';
    text += '<div class="vistabbar-panel-row-info">';
    text += '<p id="vistabbar-panel-row-info-value" class="' + vis.binds.vistabbar.getBooleanClass(oidVal) + '">';
    text += vis.binds.vistabbar.getBooleanText(oidVal);
    //    <!-- <%= this.data.attr('info') %><code><%= this.data.attr('code') %></code> -->
    text += '</p>';
    text += '</div>';
    text += '</div>';

    $("#" + widgetID).html(text);

    // subscribe on updates of value
    if (data.oid) {
      vis.states.bind(data.oid + ".val", function (e, newVal, oldVal) {
        vis.binds.vistabbar.addTextAndToggleClasses($div, newVal);
      });
    }
  },
  getBooleanText: function (val) {
    if (typeof val !== "boolean") return val;
    return val ? "on" : "off";
  },
  getBooleanClass: function (val) {
    return val ? "vistabbar-green" : "";
  },
  addTextAndToggleClasses: function (div, status) {
    var $div = div;
    $div = $div.find("#vistabbar-panel-row-info-value");
    if ($div.length) {
      $div.html(vis.binds.vistabbar.getBooleanText(status)).toggleClass("vistabbar-green");
    }
  },
  createTabBar: function (datawid, view, data, style) {
    var $div = $("#" + datawid).addClass("vis-tabbar-base");
    if (!$div.length) {
      setTimeout(function () {
        vis.binds.vistabbar.createTabBar(datawid, view, data, style);
      }, 100);
      return;
    }

    // Constants
    var defaultValues = {
      height: "46px",
      tab: "",
      tabs: {}
    };

    // Custom data

    if (!(data.height.includes("px") || data.height.includes("%"))) {
      if (typeof data.height !== "number") {
        data.height = defaultValues.height;
      } else {
        data.height = data.height + "px";
      }
    }

    //Initialize the tabbar
    var tabbar = new AppTabBar.Tabbar("tab_bar", {
      button_height: data.height
    });
    tabbar.init();

    //Add tabs
    if (data.tabs.length > 0 && data.tabs.includes("::")) {
      // Split by ";" to get the key/value: "view name"/"view key"
      var splitViews = data.tabs.split(";");
      // Set the first key/value as the default tab; for that we use an temp counter to identify the first key/value
      var tmpCounterTab = 0;
      splitViews.forEach(el => {
        var splitView = el.split("::");
        if (splitView.length == 2) {
          if (tmpCounterTab == 0) {
            defaultValues.tab = splitView[0];
          }
          defaultValues.tabs[splitView[0]] = splitView[1];

          var addedTab = tabbar.addTab(splitView[1], "icon", {
            events: {
              selected: function () {
                vis.changeView(splitView[0]);
              }
            }
          });
          defaultValues.tabs[splitView[0]] = addedTab;
          tmpCounterTab = tmpCounterTab + 1;
        }
      });
    }

    //Set "home" as active.
    // tabbar.setActive(tab_home);
    // return tabbar.node;

    $div.html(tabbar.node);
    //Render the tabbar.
    tabbar.render();

    // TODO: Any existing solution to detect if we are in the vis editor?
    // Check that the current widget is in the editor or main index.html page
    if(vis.binds.vistabbar.isEditeMode()) return;

    // Go to the current view
    // The current view has a special url format like: http://pi.local:8082/vis/index.html#01_TV_K%C3%BCche
    // The last part (after the "#") identifies the current page and should be one of the tabs
    // Select the current view / tab
    var currentView = window.location.hash.substr(1);
    if (currentView in defaultValues.tabs) {
      tabbar.selectTab(defaultValues.tabs[currentView]);
    } else {
      // Check that the default tab is in the list of tabs
      if (defaultValues.tab in defaultValues.tabs) {
        tabbar.selectTab(defaultValues.tabs[defaultValues.tab]);
      }
    }

    // console.log("--- DEBUG: data ---");
    // console.log(defaultValues.tab);
    // console.log(defaultValues.tabs);
  },
  isEditeMode: function() {
    // "/vis/index.html" OR "/vis/edit.html"
    if (window.location.pathname.includes("edit")) {
      return true;
    }
    return false;
  }
};

vis.binds["vistabbar"].showVersion();