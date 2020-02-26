/*
    ioBroker.vis vistabbar Widget-Set

    version: "0.0.1"

    Copyright 2020 mbecker mats.becker@gmail.com
*/
"use strict";

// add translations for edit mode
$.get("adapter/vistabbar/words.js", function(script) {
  let translation = script.substring(script.indexOf("{"), script.length);
  translation = translation.substring(0, translation.lastIndexOf(";"));
  $.extend(systemDictionary, JSON.parse(translation));
});

// this code can be placed directly in vistabbar.html
vis.binds["vistabbar"] = {
  version: "0.0.1",
  showVersion: function() {
    if (vis.binds["vistabbar"].version) {
      console.log("Version vistabbar: " + vis.binds["vistabbar"].version);
      vis.binds["vistabbar"].version = null;
    }
  },
  createWidget: function(widgetID, view, data, style) {
    var $div = $("#" + widgetID);
    // if nothing found => wait
    if (!$div.length) {
      return setTimeout(function() {
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
      vis.states.bind(data.oid + ".val", function(e, newVal, oldVal) {
        $div.find(".vistabbar-value").html(newVal);
      });
    }
  },
  createPanel: function(widgetID, view, data, style) {
    var $div = $("#" + widgetID);
    // if nothing found => wait
    if (!$div.length) {
      return setTimeout(function() {
        vis.binds["vistabbar"].createPanel(widgetID, view, data, style);
      }, 100);
    }

    var text = '';
    text += '<div class="vistabbar-panel-column" >';
    text += '<!-- <div class="vistabbar-panel-heading"></div> --> ';
    text += '<h3 class="vistabbar-panel-heading">' + data.title + '</h3> ';
    text += '</div>';
    text += '<div class="vistabbar-panel-row">';
    text += '<div class="vistabbar-panel-row-info">';
    text += '<p id="vistabbar-panel-row-info-value">';
    text += vis.states[data.oid + '.val'];
             //    <!-- <%= this.data.attr('info') %><code><%= this.data.attr('code') %></code> -->
    text += '</p>';
    text += '</div>';
    text += '</div>';

    $("#" + widgetID).html(text);

    // subscribe on updates of value
    if (data.oid) {
      vis.states.bind(data.oid + ".val", function(e, newVal, oldVal) {
        console.log(e);
        console.log(newVal);
        $div.find("#vistabbar-panel-row-info-value").html(newVal.toString());
      });
    }
  },
  createTabBar: function(datawid, view, data, style) {
    var $div = $("#" + datawid).addClass("vis-tabbar-base");
    if (!$div.length) {
      setTimeout(function() {
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
              selected: function() {
                vis.changeView(splitView[0]);
              }
            }
          });
          defaultValues.tabs[splitView[0]] = addedTab;
          tmpCounterTab = tmpCounterTab + 1;
        }
      });
    }
    // var tabs = {
    //   "01_TV_Küche": tabbar.addTab("TV / Küche", "fa-home", {
    //     events: {
    //       selected: function() {
    //         vis.changeView("01_TV_Küche");
    //       }
    //     }
    //   }),
    //   "81_Heizung_Flur0_Bad": tabbar.addTab("Heizung", "fa-home", {
    //     events: {
    //       selected: function() {
    //         vis.changeView("81_Heizung_Flur0_Bad");
    //       }
    //     }
    //   }),
    //   "04_Bad": tabbar.addTab("Flur / Bad", "fa-home", {
    //     events: {
    //       selected: function() {
    //         vis.changeView("04_Bad");
    //       }
    //     }
    //   })
    // };

    //Set "home" as active.
    // tabbar.setActive(tab_home);
    // return tabbar.node;

    $div.html(tabbar.node);
    //Render the tabbar.
    tabbar.render();

    // TODO: Any existing solution to detect if we are in the vis editor?
    // Check that the current widget is in the editor or main index.html page
    var location = window.location.pathname; // "/vis/index.html" OR "/vis/edit.html"
    if(location.includes("edit")) {
      return;
    }

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

    console.log("--- DEBUG: data ---");
    console.log(defaultValues.tab);
    console.log(defaultValues.tabs);
  }
};

vis.binds["vistabbar"].showVersion();
