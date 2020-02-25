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
      height: "46px"
    };

    // Custom data
    console.log("--- DEBUG: data ---");
    console.log(data)
    console.log(data.height)
    var data = {
      height: "26px"
    }
    if(!(data.height.includes("px") || data.height.includes("%"))) {
      if(typeof data.height !== "number") {
        data.height = defaultValues.height;
      } else {
        data.height = data.height + "px";
      }
    }

    //Initialize the tabbar
    var tabbar = new AppTabBar.Tabbar('tab_bar', {
        button_height: data.height
    });
    tabbar.init();

    //Add tabs
    var tab_home = tabbar.addTab("TV / Küche", "fa-home", {
      events: {
        selected: function() {
          vis.changeView('01_TV_Küche');
        }
      }
    });

    var tab_pages = tabbar.addTab("Heizung", "fa-home", {
        events: {
            selected: function() {
                vis.changeView('81_Heizung_Flur0_Bad');
              }
        }
    });

    var tab_flur_bad = tabbar.addTab("Flur / Bad", "fa-home", {
        events: {
            selected: function() {
                vis.changeView('04_Bad');
              }
        }
    });

    //Set "home" as active.
    // tabbar.setActive(tab_home);
    // return tabbar.node;

    $div.html(tabbar.node);
    //Render the tabbar.
    tabbar.render();
    tabbar.selectTab(tab_home);

    // document.getElementById("#" + datawid).appendChild(tabbar.node);
  }
};

vis.binds["vistabbar"].showVersion();
