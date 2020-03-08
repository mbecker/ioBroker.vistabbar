/*
    ioBroker.vis vistabbar Widget-Set

    version: "0.0.1"

    Copyright 2020 mbecker mats.becker@gmail.com
*/
"use strict";

if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function () {
    FastClick.attach(document.body);
    // FastClick.attach(node);
  }, false);
}

var VISTABBAR = {
  SUCCESS: 1,
  ERROR: 2,
  INFO: 3,
  TIMEOUTMS: 1000,
};

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
  capitalizeFirstLetter(string) {
    if (typeof string === "undefined") return "undefined";
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  getText: function (el) {
    return (typeof el !== "undefined") ? el : "null";
  },
  getTextForHistoryPanel: function (node, historyMsg, nodeNumberOfLogMessages) {

    // node.innerHTML = "";
    var history = JSON.parse(historyMsg);

    if (typeof history.history !== "undefined") {

      var startLogLine = history.history.length-200;
      for (let index = startLogLine; index < history.history.length; index++) {
        numberOfShownLine = index;
        const el = history.history[index];
        /* The strcuture of the element is as follows:
        var logMsg = {
                    id: val.id,
                    val: val.val,
                    ack: val.ack,
                    ts: val.ts,
                    lc: val.lc,
                    q: val.q,
                    msg: {
                      ...,
                      device: {
                        "name": "Socket_Bad",
                        "topic": "socket/bad/deconz/0/Lights_9/switch",
                        "field": "socket",
                        "tags": {
                            "ack": "true",
                            "haus": "ginsheim",
                            "name": "Socket_Bad",
                            "object": "deconz/0/Lights_9",
                            "product": "aqara",
                            "room": "bad"
                        }
                    }
                    }
                }
        */
        if (typeof el.id !== "undefined" && node.getElementsByClassName(el.ts).length === 0) {
          // Get the date in local (german) time display
          const event = new Date(el.ts);
          const options = {
            year: "numeric",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          };
          const dt = event.toLocaleDateString("de-DE", options);

          // && typeof el.state.name !== "undefined"
          var line = document.createElement("div");
          line.classList.add(el.ts)
          line.setAttribute("id", el.ts);
          line.setAttribute("data-ts", el.ts);
          // line.style.maxHeight = "300px";
          // line.style.height = "300px";
          // line.style.minHeight = "300px";
          var span1 = document.createElement("span");
          // Add an inline svg rect bo to show that the message is acknowledged by the system
          var rectColor = (el.ack === true) ? "#9dd3ae" : "#7a65f2"; // lila
          var svg = `<svg class="bd-placeholder-img rounded mr-2" width="10" height="10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" style="margin-bottom: -4px;padding: 4px;"><rect fill="${rectColor}" width="100%" height="100%"></rect></svg>`;
          // Add the follwing text: german data - ID - value
          span1.innerHTML = `${svg}${dt + ":" + event.getMilliseconds()}`;
          line.appendChild(span1);
          var spans = vis.binds.vistabbar.getNodeFromLogMessage(el["msg"], 0, "msg");
          spans.forEach(el => line.appendChild(el));
          // Insert the JSON as string (JSON.stringify)

          var h3 = document.createElement("h3");
          h3.innerHTML = "Message";

          var keyNode = document.createElement("div");
          keyNode.className = "vistabbar-code-key";
          keyNode.style.marginLeft = 4 + "px";
          var span3 = document.createElement("span");
          span3.style.width = "100%";
          span3.innerHTML = `${JSON.stringify(el.msg)}`;
          line.appendChild(h3);
          keyNode.appendChild(span3);
          line.appendChild(keyNode);


          node.appendChild(line);
          line.addEventListener("click", function (e) {
            var lineHeight = line.offsetHeight + 20 + "px";
            line.style.maxHeight = lineHeight;
            line.style.height = lineHeight;
            line.style.minHeight = lineHeight;
            // line.style.minHeight = "260px";
            e.preventDefault();
          }, false)
        }
      }
      nodeNumberOfLogMessages.innerHTML = startLogLine + " - " + history.history.length;
    }

    nodeNumberOfLogMessages.addEventListener("click", function (e) {
      node.scrollTop = node.scrollHeight;
      node.scrollIntoView({ block: "end" });
      e.preventDefault()
    }, false);

    // A new element is added to the dom element; scroll to the end of the element
    node.scrollTop = node.scrollHeight;
    node.scrollIntoView({ block: "end" });
  },
  getNodeFromLogMessage(el, n, heading) {
    if (typeof el !== "object") return;
    var nodes = [];
    var h = document.createElement("h3");
    h.innerHTML = heading;
    nodes.push(h);

    for (var key in el) {
      if (typeof el[key] === "object") {
        var tmpNodes = vis.binds.vistabbar.getNodeFromLogMessage(el[key], n + 1, key);
        tmpNodes.forEach(tn => nodes.push(tn));
      } else if (key !== "ts" && key !== "lc" && key !== "q" && key !== "from" && key !== "user") {
        var keyNode = document.createElement("div");
        keyNode.className = "vistabbar-code-key";
        keyNode.style.marginLeft = 4 + "px";
        var keyNodeSpan1 = document.createElement("span");
        keyNodeSpan1.innerHTML = key;
        var keyNodeSpan2 = document.createElement("span");
        keyNodeSpan2.innerHTML = el[key];
        keyNode.appendChild(keyNodeSpan1);
        keyNode.appendChild(keyNodeSpan2);
        nodes.push(keyNode)
      }
    }
    return nodes;
  },
  createPanelHistory: function (widgetID, view, data, style) {
    var node = document.getElementById(widgetID);

    // if nothing found => wait
    if (!node) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createPanelHistory(widgetID, view, data, style);
      }, 100);
    }

    var panelContent = document.createElement("div");
    if (vis.binds.vistabbar.isEditMode()) panelContent.style.position = "relative";
    panelContent.className = "vistabbar-code";

    var panelContentNumberOfMessages = document.createElement("div");
    panelContentNumberOfMessages.className = "vistabbar-log-number";
    panelContentNumberOfMessages.id = "vistabbar-log-number";

    node.appendChild(panelContent);
    node.appendChild(panelContentNumberOfMessages);

    vis.binds.vistabbar.getTextForHistoryPanel(panelContent, vis.states[data.oid + '.val'], panelContentNumberOfMessages);

    vis.states.bind(data.oid + ".val", function (e, newVal, oldVal) {
      vis.binds.vistabbar.showNotification("Added new history msg");
      vis.binds.vistabbar.getTextForHistoryPanel(panelContent, newVal, panelContentNumberOfMessages);
    });

    // HACK: Feature to scroll at the bottom of the dom elemen;; because the dom is maybe not yet initialized set a timeout to scroll to the bottom
    setTimeout((node) => {
      node.scrollTop = node.scrollHeight;
      node.scrollIntoView({ block: "end" });
    }, 550, panelContent);

  },
  createPanelTmp: function (widgetID, view, data, style) {
    var node = document.getElementById(widgetID);

    // if nothing found => wait
    if (!node) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createPanelTmp(widgetID, view, data, style);
      }, 100);
    }

    // START DATA
    // TODO: Check the following prams: data.title

    var switchObjectVal = vis.states[data.oid1 + '.val'];
    var powerObjectVal = vis.states[data.oid2 + '.val'];
    // Set the font-size of the heading/h3 if the param exists and includes either "px" or "%"
    var headingFontSize = (
      typeof data.headingFontSize !== "undefined" &&
      data.headingFontSize !== null &&
      (
        data.headingFontSize.includes("px") ||
        data.headingFontSize.includes("%")
      )) ? data.headingFontSize : "1.4em";


    // END DATA

    var panelContent = document.createElement("div");
    panelContent.style.flexDirection = "column";
    panelContent.style.display = "flex";
    panelContent.style.height = "100%";

    // 3. - Header
    var panelContentHeading = document.createElement("div");
    panelContentHeading.className = "padding-8 vistabbar-panel-column vistabbar-height-32px";
    // 3.1. - Headline (text)
    var heading = document.createElement("h3")
    heading.className = "vistabbar-panel-heading";
    heading.style.fontSize = headingFontSize;
    heading.innerText = data.title;
    panelContentHeading.appendChild(heading);

    // 2. - Content
    var panelContentColumns = document.createElement("div");
    panelContentColumns.className = "vistabbar-panel-column vistabbar-panel-content";
    panelContentColumns.style.justifyContent = "flex-start"
    // 2.1 - Icon
    var panelColumnIcon = document.createElement("div");
    panelColumnIcon.className = "vistabbar-panel-column vistabbar-height-60";
    if (typeof data.iconshow !== "undefined" && data.iconshow) {
      var icon = document.createElement("i");
      icon.className = "material-icons";
      icon.style.color = vis.binds.vistabbar.getIconColor(switchObjectVal, data.iconcoloron, data.iconcoloroff);
      icon.innerHTML = vis.binds.vistabbar.getIcon(switchObjectVal, data.iconon, data.iconoff);
      panelContentColumns.appendChild(icon);
    }

    // 3. - Bottom
    var panelBottom = document.createElement("div");
    panelBottom.className = "vistabbar-panel-heating-bottom vistabbar-height-32px";
    // 3. - Progress    
    var panelRowInfo = document.createElement("div");
    panelRowInfo.style.backgroundColor = data.iconcoloron + "!important";
    panelRowInfo.className = "vistabbar-panel-row-info-progress";
    var panelRowInfoP = document.createElement("p");
    panelRowInfoP.className = "vistabbar-panel-row-info-value-progress";
    panelRowInfoP.innerText = vis.binds.vistabbar.getPanelProgessValue(powerObjectVal, data);;
    // Append: panelrow
    panelRowInfo.appendChild(panelRowInfoP);
    panelBottom.appendChild(panelRowInfo);



    panelContent.appendChild(panelContentHeading);
    panelContent.appendChild(panelContentColumns);
    panelContent.appendChild(panelBottom);
    node.appendChild(panelContent);

    // Resize
    if (typeof data.iconshow !== "undefined" && data.iconshow) {
      icon.style.fontSize = (node.clientHeight / 160) * 62 + "px"; // Height of Icon: container height 140px - font height 48px
    }
    panelRowInfoP.style.width = node.clientWidth + "px"; // "p"-element widt to align the text into the center
    panelRowInfo.style.width = vis.binds.vistabbar.getProgress(powerObjectVal, data) + "%";

  },
  createPanelHeating: function (widgetID, view, data, style) {
    var node = document.getElementById(widgetID);

    // if nothing found => wait
    if (!node) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createPanelHeating(widgetID, view, data, style);
      }, 100);
    }


    var panelContent = document.createElement("div");
    panelContent.style.flexDirection = "column";
    panelContent.style.display = "flex";

    var panelContentHeading = document.createElement("div");
    panelContentHeading.className = "padding-8 vistabbar-panel-column";
    var heading = document.createElement("h3")
    heading.className = "vistabbar-panel-heading";
    heading.innerText = data.title;
    panelContentHeading.appendChild(heading);

    panelContent.appendChild(panelContentHeading);

    /*
     * panelContentColumns
     */
    var panelContentColumns = document.createElement("div");
    panelContentColumns.className = "vistabbar-panel-column padding-8-top-bottom";
    panelContentColumns.style.justifyContent = "flex-start";

    // 
    var panelContentColumnsRow1 = document.createElement("div");
    panelContentColumnsRow1.className = "vistabbar-panel-column-row";

    // 1st row - left
    var panelContentColumnsRow1_1 = document.createElement("div");
    // 1st row - left - left
    var panelContentColumnsRow1_1_1 = document.createElement("div");
    var panelContentColumnsRow1_1_1_text1 = document.createElement("p");
    panelContentColumnsRow1_1_1_text1.innerText = data.text1;
    panelContentColumnsRow1_1_1.appendChild(panelContentColumnsRow1_1_1_text1);
    panelContentColumnsRow1_1.appendChild(panelContentColumnsRow1_1_1);
    // 1st row - left - right
    var panelContentColumnsRow1_1_2 = document.createElement("div");
    var panelContentColumnsRow1_1_2_data1 = document.createElement("p");
    panelContentColumnsRow1_1_2_data1.innerText = vis.states[data.hid1 + '.val'] + data.suffix1;
    panelContentColumnsRow1_1_2.appendChild(panelContentColumnsRow1_1_2_data1);
    panelContentColumnsRow1_1.appendChild(panelContentColumnsRow1_1_2);


    panelContentColumnsRow1.appendChild(panelContentColumnsRow1_1);


    // 1st row - right
    var panelContentColumnsRow1_2 = document.createElement("div");
    // 1st row - right - left
    var panelContentColumnsRow1_2_1 = document.createElement("div");
    var panelContentColumnsRow1_2_1_text2 = document.createElement("p");
    panelContentColumnsRow1_2_1_text2.innerText = data.text2;
    panelContentColumnsRow1_2_1.appendChild(panelContentColumnsRow1_2_1_text2);
    panelContentColumnsRow1_2.appendChild(panelContentColumnsRow1_2_1);
    // 1st row - right - right
    var panelContentColumnsRow1_2_2 = document.createElement("div");
    var panelContentColumnsRow1_2_2_data2 = document.createElement("p");
    var panelContentColumnsRow1_2_2_data2_span1 = document.createElement("span");
    panelContentColumnsRow1_2_2_data2_span1.innerText = vis.states[data.hid2 + '.val'] + data.suffix2;
    var panelContentColumnsRow1_2_2_data2_span2 = document.createElement("span");
    panelContentColumnsRow1_2_2_data2_span2.innerText = vis.states[data.hid3 + '.val'] + data.suffix3;


    // panelContentColumnsRow1_2_2_data2.innerText = vis.states[data.hid2 + '.val'] + data.suffix2 + vis.states[data.hid3 + '.val'] + data.suffix3;
    panelContentColumnsRow1_2_2_data2.appendChild(panelContentColumnsRow1_2_2_data2_span1);
    panelContentColumnsRow1_2_2_data2.appendChild(panelContentColumnsRow1_2_2_data2_span2);
    panelContentColumnsRow1_2_2.appendChild(panelContentColumnsRow1_2_2_data2);
    panelContentColumnsRow1_2.appendChild(panelContentColumnsRow1_2_2);
    if (data.hid2) {
      vis.states.bind(data.hid2 + ".val", function (e, newVal, oldVal) {
        panelContentColumnsRow1_2_2_data2_span1.innerText = newVal + data.suffix2; //  + vis.states[data.hid3 + '.val'] + data.suffix3;
      });
    }
    // TODO: Subscribe / bind to .ack to show only acknowledged values
    vis.states.bind(data.hid3 + ".val", function (e, newVal, oldVal) {
      vis.binds.vistabbar.showNotification(`New temp ${newVal} ack for: ${data.title}`, VISTABBAR.SUCCESS);
      panelContentColumnsRow1_2_2_data2_span2.innerText = newVal + data.suffix3;
    });


    panelContentColumnsRow1.appendChild(panelContentColumnsRow1_2);
    panelContentColumns.appendChild(panelContentColumnsRow1);


    // 2nd row
    var panelContentColumnsRow2 = document.createElement("div");
    panelContentColumnsRow2.className = "vistabbar-panel-column-row";
    // 2nd row - left
    var panelContentColumnsRow2_1 = document.createElement("div");
    // 2nd row - left - left
    var panelContentColumnsRow2_1_1 = document.createElement("div");
    var panelContentColumnsRow2_1_1_text3 = document.createElement("p");
    panelContentColumnsRow2_1_1_text3.innerText = data.text4;
    panelContentColumnsRow2_1_1.appendChild(panelContentColumnsRow2_1_1_text3);
    panelContentColumnsRow2_1.appendChild(panelContentColumnsRow2_1_1);
    // 2nd row - left - right
    var panelContentColumnsRow2_1_2 = document.createElement("div");
    var panelContentColumnsRow2_1_2_data3 = document.createElement("p");
    panelContentColumnsRow2_1_2_data3.innerText = vis.states[data.hid4 + '.val'] + data.suffix4;
    panelContentColumnsRow2_1_2.appendChild(panelContentColumnsRow2_1_2_data3);
    panelContentColumnsRow2_1.appendChild(panelContentColumnsRow2_1_2);
    if (data.hid4) {
      // Only change value if the value was acknowledged
      vis.states.bind(data.hid4 + ".ack", function (e, newVal, oldVal) {
        if (newVal === true) {
          panelContentColumnsRow2_1_2_data3.innerText = vis.states[data.hid4 + '.val'] + data.suffix4;
        }
      });
    }

    panelContentColumnsRow2.appendChild(panelContentColumnsRow2_1);


    // 2nd row - right
    var panelContentColumnsRow2_2 = document.createElement("div");
    // 2nd row - right - left
    var panelContentColumnsRow2_2_1 = document.createElement("div");
    var panelContentColumnsRow2_2_1_text4 = document.createElement("p");
    panelContentColumnsRow2_2_1_text4.innerText = data.text4;


    panelContentColumnsRow2_2_1.appendChild(panelContentColumnsRow2_2_1_text4);
    panelContentColumnsRow2_2.appendChild(panelContentColumnsRow2_2_1);
    // 2nd row - right - right
    var panelContentColumnsRow2_2_2 = document.createElement("div");
    var panelContentColumnsRow2_2_2_data4 = document.createElement("p");
    panelContentColumnsRow2_2_2_data4.innerText = vis.states[data.hid5 + '.val'] + data.suffix5;
    panelContentColumnsRow2_2_2.appendChild(panelContentColumnsRow2_2_2_data4);
    panelContentColumnsRow2_2.appendChild(panelContentColumnsRow2_2_2);
    if (data.hid5) {
      vis.states.bind(data.hid5 + ".val", function (e, newVal, oldVal) {
        panelContentColumnsRow2_2_2_data4.innerText = vis.states[data.hid5 + '.val'] + data.suffix5;
      });
    }


    panelContentColumnsRow2.appendChild(panelContentColumnsRow2_2);
    panelContentColumns.appendChild(panelContentColumnsRow2);


    // 3rd row
    var panelContentColumnsRow3 = document.createElement("div");
    panelContentColumnsRow3.className = "vistabbar-panel-column-row";
    var panelContentColumnsRow3_1 = document.createElement("div");
    panelContentColumnsRow3_1.className = "vistabbar-panel-button";
    // Butons
    var panelContentColumnsRow3_1_Input1 = document.createElement("input");
    panelContentColumnsRow3_1_Input1.type = "radio";
    panelContentColumnsRow3_1_Input1.tabIndex = "-1";
    panelContentColumnsRow3_1_Input1.value = "radio_auto";
    panelContentColumnsRow3_1_Input1.readOnly = true;
    panelContentColumnsRow3_1_Input1.id = "panelContentColumnsRow3_1_Input1";
    panelContentColumnsRow3_1_Input1.name = "panelContentColumnsRow3_1_Input1";
    // BUtton 1
    var panelContentColumnsRow3_1_Label1 = document.createElement("label");
    panelContentColumnsRow3_1_Label1.title = "panelContentColumnsRow3_1_Label1";
    panelContentColumnsRow3_1_Label1.formTarget = "panelContentColumnsRow3_1_Input1"
    var panelContentColumnsRow3_1_Label1_Icon = document.createElement("i");
    panelContentColumnsRow3_1_Label1_Icon.className = "material-icons";;
    panelContentColumnsRow3_1_Label1_Icon.innerText = "remove";
    panelContentColumnsRow3_1_Label1.appendChild(panelContentColumnsRow3_1_Label1_Icon);
    vis.binds.vistabbar.addEventListenerToLabel(panelContentColumnsRow3_1_Label1, data.clickcolor, data.clickdelay, data.bid1, data.step1, data.title);
    // BUtton 2
    var panelContentColumnsRow3_1_Input2 = document.createElement("input");
    panelContentColumnsRow3_1_Input2.type = "radio";
    panelContentColumnsRow3_1_Input2.tabIndex = "-1";
    panelContentColumnsRow3_1_Input2.value = "radio_auto";
    panelContentColumnsRow3_1_Input2.readOnly = true;
    panelContentColumnsRow3_1_Input2.id = "panelContentColumnsRow3_1_Input2";
    panelContentColumnsRow3_1_Input2.name = "panelContentColumnsRow3_1_Input2";
    var panelContentColumnsRow3_1_Label2 = document.createElement("label");
    panelContentColumnsRow3_1_Label2.className = "vistabbar-panel-button-label-plus";
    panelContentColumnsRow3_1_Label2.title = "panelContentColumnsRow3_1_Label2";
    panelContentColumnsRow3_1_Label2.formTarget = "panelContentColumnsRow3_1_Input2"
    // var panelContentColumnsRow3_1_Label2_originalBackground = panelContentColumnsRow3_1_Label2.style.backgroundColor;
    vis.binds.vistabbar.addEventListenerToLabel(panelContentColumnsRow3_1_Label2, data.clickcolor, data.clickdelay, data.bid2, data.step2, data.title);

    var panelContentColumnsRow3_1_Label2_Icon = document.createElement("i");
    panelContentColumnsRow3_1_Label2_Icon.className = "material-icons";;
    panelContentColumnsRow3_1_Label2_Icon.innerText = "add";
    panelContentColumnsRow3_1_Label2.appendChild(panelContentColumnsRow3_1_Label2_Icon);

    panelContentColumnsRow3_1.appendChild(panelContentColumnsRow3_1_Input1);
    panelContentColumnsRow3_1.appendChild(panelContentColumnsRow3_1_Label1);
    panelContentColumnsRow3_1.appendChild(panelContentColumnsRow3_1_Input2);
    panelContentColumnsRow3_1.appendChild(panelContentColumnsRow3_1_Label2);


    panelContentColumnsRow3.appendChild(panelContentColumnsRow3_1);
    panelContentColumns.appendChild(panelContentColumnsRow3);
    // END 3rd row

    panelContent.appendChild(panelContentColumns);

    // 4th row
    if (data.tvalues) {
      var tvalues = data.tvalues.split(";");
      if (tvalues.length === 0) return;

      var tequal = vis.states[data.tequal + '.val'];

      var panelContentColumnsRow4_1 = document.createElement("div");
      panelContentColumnsRow4_1.className = "vistabbar-panel-button";

      var panelContentColumnsRow4_1_nodes = [];
      for (let index = 0; index < tvalues.length; index++) {
        const element = tvalues[index];
        var panelContentColumnsRow4_1_Input1 = document.createElement("input");
        panelContentColumnsRow4_1_Input1.type = "radio";
        panelContentColumnsRow4_1_Input1.tabIndex = "-1";
        panelContentColumnsRow4_1_Input1.value = "radio_auto";
        panelContentColumnsRow4_1_Input1.readOnly = true;
        panelContentColumnsRow4_1_Input1.id = "panelContentColumnsRow4_1_Input_" + element;
        panelContentColumnsRow4_1_Input1.name = "panelContentColumnsRow4_1_Input_" + element;;
        var panelContentColumnsRow4_1_Label1 = document.createElement("label");
        // Check that element is equal to the tequal's value
        if (element === tequal) panelContentColumnsRow4_1_Label1.className = "vistabbar-panel-button-label-active";
        panelContentColumnsRow4_1_Label1.title = "panelContentColumnsRow4_1_Label_" + element;
        panelContentColumnsRow4_1_Label1.formTarget = "panelContentColumnsRow4_1_Input_" + element;
        panelContentColumnsRow4_1_Label1.innerHTML = element;
        panelContentColumnsRow4_1_Label1.setAttribute("data-text", element); // Set data attribute "data-text" to change the buttons value for sending command to "Push" and then set back to iriginal text
        vis.binds.vistabbar.addEventListenerTovalue(panelContentColumnsRow4_1_Label1, data.clickcolor, data.clickdelay, data.tid, element, data.title);

        // Add elements to array
        // panelContentColumnsRow4_1_nodes.push(panelContentColumnsRow4_1_Input1);
        panelContentColumnsRow4_1_nodes.push(panelContentColumnsRow4_1_Label1);
        // Add elements to dom
        panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Input1);
        panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Label1);
      }

      // Subscribe to tequal to change the button's className based on the value
      if (data.tequal) {
        vis.states.bind(data.tequal + ".ack", function (e, newVal, oldVal) {
          if (newVal !== true) return;
          // console.log("data.ack === true");
          var tequalTmp = vis.states[data.tequal + '.val'];
          // console.log(tequalTmp);
          for (let index = 0; index < panelContentColumnsRow4_1_nodes.length; index++) {
            const element = panelContentColumnsRow4_1_nodes[index];
            // console.log(element.innerText)
            if (element.className.includes("vistabbar-push")) {
              element.classList.remove("vistabbar-push");
            }
            if (element.getAttribute("data-text") === tequalTmp) {
              element.innerText = tequalTmp;
              element.classList.add("vistabbar-panel-button-label-active");
              vis.binds.vistabbar.showNotification(`New modus ${tequalTmp} ack for: ${data.title}`, VISTABBAR.SUCCESS);
            } else {
              element.classList.remove("vistabbar-panel-button-label-active");
            }
          }
        });
      }




      var panelBottom = document.createElement("div");
      panelBottom.className = "vistabbar-panel-heating-bottom";

      panelBottom.appendChild(panelContentColumnsRow4_1);
      panelContent.appendChild(panelBottom);
    }
    // var panelContentColumnsRow4 = document.createElement("div");
    // panelContentColumnsRow4.className = "vistabbar-panel-column-row";


    // Butons


    // var panelContentColumnsRow4_1_Input2 = document.createElement("input");
    // panelContentColumnsRow4_1_Input2.type = "radio";
    // panelContentColumnsRow4_1_Input2.tabIndex = "-1";
    // panelContentColumnsRow4_1_Input2.value = "radio_auto";
    // panelContentColumnsRow4_1_Input2.readOnly = true;
    // panelContentColumnsRow4_1_Input2.id = "panelContentColumnsRow4_1_Input2";
    // panelContentColumnsRow4_1_Input2.name = "panelContentColumnsRow4_1_Input2";
    // var panelContentColumnsRow4_1_Label2 = document.createElement("label");
    // panelContentColumnsRow4_1_Label2.className = "vistabbar-panel-button-label-active";
    // panelContentColumnsRow4_1_Label2.title = "panelContentColumnsRow4_1_Label2";
    // panelContentColumnsRow4_1_Label2.formTarget = "panelContentColumnsRow4_1_Input2"
    // panelContentColumnsRow4_1_Label2.innerHTML = "Heat (Eco)";

    // var panelContentColumnsRow4_1_Input3 = document.createElement("input");
    // panelContentColumnsRow4_1_Input3.type = "radio";
    // panelContentColumnsRow4_1_Input3.tabIndex = "-1";
    // panelContentColumnsRow4_1_Input3.value = "radio_auto";
    // panelContentColumnsRow4_1_Input3.readOnly = true;
    // panelContentColumnsRow4_1_Input3.id = "panelContentColumnsRow4_1_Input3";
    // panelContentColumnsRow4_1_Input3.name = "panelContentColumnsRow4_1_Input3";
    // var panelContentColumnsRow4_1_Label3 = document.createElement("label");
    // panelContentColumnsRow4_1_Label3.title = "panelContentColumnsRow4_1_Label3";
    // panelContentColumnsRow4_1_Label3.formTarget = "panelContentColumnsRow4_1_Input3"
    // panelContentColumnsRow4_1_Label3.innerHTML = "Heat";

    // panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Input1);
    // panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Label1);
    // panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Input2);
    // panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Label2);
    // panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Input3);
    // panelContentColumnsRow4_1.appendChild(panelContentColumnsRow4_1_Label3);

    // panelContentColumnsRow4.appendChild(panelContentColumnsRow4_1);
    // panelContentColumns.appendChild(panelContentColumnsRow4);
    // END 4th row





    /*
     * END panelContentColumns
     */



    // var panelBottomColumn = document.createElement("div");
    // panelBottomColumn.className = "vistabbar-panel-row-info-progress";
    // var panelBottomColumInfo = document.createElement("p");
    // panelBottomColumInfo.className = "vistabbar-panel-row-info-value-progress";
    // panelBottomColumInfo.innerText = "test"
    // // Append: panelrow
    // panelBottomColumn.appendChild(panelBottomColumInfo);




    /*
     * Add dom nodes to original node
     */
    node.appendChild(panelContent);
    if (typeof data.addlastspacerheight !== "undefined" && data.addlastspacerheight !== null && data.addlastspacerheight !== "0px" && (
      data.addlastspacerheight.includes("px") || data.addlastspacerheight.includes("%")
    )) {
      var bottomSpacer = document.createElement("div");
      bottomSpacer.style.height = data.addlastspacerheight;
      // Add dom element ("spacer") to the parents dom that the box/panel created here is not affected
      node.parentNode.appendChild(bottomSpacer);
    }
  },
  setStateInc(bid, step) {
    if (vis.binds.vistabbar.isEditMode()) return;
    if (typeof bid === "undefined" || typeof step === "undefined") return;

    var val = Number.parseFloat(vis.states[bid + '.val']);
    var inc = Number.parseFloat(step);

    vis.setValue(bid, val + inc);
  },
  setStateValue(id, value) {
    if (vis.binds.vistabbar.isEditMode()) return;
    if (typeof id === "undefined" || typeof value === "undefined") return;

    vis.setValue(id, value);
  },
  addEventListenerTovalue: function (node, clickColor, clickDelay, id, value, title) {
    node.addEventListener("click", function (e) {
      // Simulate click
      node.innerHTML = "Push...";
      node.className = "";
      node.style.backgroundColor = clickColor;
      setTimeout((node, title) => {
        vis.binds.vistabbar.showNotification(`Send new modus ${node.getAttribute("data-text")} for: ${title}`, VISTABBAR.INFO);
        node.classList.add("vistabbar-push"); // Set the class to show the status of "pushing" the command to the device (user feedback)
        node.style.backgroundColor = ""; // That the background of the class in the line above works
        vis.binds.vistabbar.setStateValue(id, value);
      }, clickDelay, node, title);

      e.preventDefault();
    }, false);
  },
  addEventListenerToLabel: function (node, clickColor, clickDelay, bid, step, title) {

    var originalBackground = node.style.backgroundColor;
    var originalClassName = node.className;
    // node.addEventListener('touchstart', function (e) {
    //   node.className = "";
    //   node.style.background = clickColor;
    //   e.preventDefault();
    // }, false);
    // node.addEventListener('touchend', function (e) {
    //   node.className = originalClassName;
    //   node.style.background = originalBackground;
    //   vis.binds.vistabbar.setStateInc(bid, step);
    //   e.preventDefault();
    // }, false);
    node.addEventListener("click", function (e) {
      // Simulate click
      node.className = "";
      node.style.backgroundColor = clickColor;
      setTimeout((node, title) => {
        node.className = originalClassName;
        node.style.backgroundColor = originalBackground;
        vis.binds.vistabbar.showNotification(`Send new temp change ${step} for: ${title}`, VISTABBAR.INFO);
        vis.binds.vistabbar.setStateInc(bid, step);
      }, clickDelay, node, title);
      e.preventDefault();
    }, false);
  },
  createPanelProgress: function (widgetID, view, data, style) {
    var node = document.getElementById(widgetID);

    // if nothing found => wait
    if (!node) {
      return setTimeout(function () {
        vis.binds["vistabbar"].createPanelProgress(widgetID, view, data, style);
      }, 100);
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
    vis.states.bind(data.oid1 + ".ack", function (e, newVal, oldVal) {
      // Update panel only if the status is acknowledged by the device
      if (newVal !== true) return;

      // Update the classe and remove push indication
      node.classList.remove("vistabbar-push");
      vis.binds.vistabbar.showNotification("Ack command: " + data.title, VISTABBAR.SUCCESS);

      // Update the icon
      var switchObjectValTmp = vis.states[data.oid1 + '.val'];
      icon.style.color = vis.binds.vistabbar.getIconColor(switchObjectValTmp, data.iconcoloron, data.iconcoloroff);
      icon.innerHTML = vis.binds.vistabbar.getIcon(switchObjectValTmp, data.iconon, data.iconoff);

      panelColumns.style.background = nodeOriginalBackground;
    });
    node.addEventListener("click", function (e) {
      if (data.minvalue === null || data.minvalue === "" || data.minvalue.length === 0 || data.maxvalue.length === 0 || data.maxvalue === null || data.maxvalue === "") return;
      if (vis.binds.vistabbar.isEditMode()) return;
      vis.binds.vistabbar.showNotification("Send command: " + data.title);
      // Simulate click
      panelColumns.style.background = data.clickcolor;
      setTimeout(() => {
        // panelColumns.style.background = nodeOriginalBackground;
        console.log("add class");
        node.classList.add("vistabbar-push"); // Set the class to show the status of "pushing" the command to the device (user feedback)
        node.style.backgroundColor = ""; // That the background of the class in the line above works

        vis.binds.vistabbar.setState(data);
      }, data.clickdelay);
      e.preventDefault();
    }, false);


    /*
     * RESIZE (icon, progress bar)
     */
    // Resize the icon baed on the panel height
    console.log(node.clientHeight + "px");
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

    // if (data.oid1) {
    //   vis.states.bind(data.oid1 + ".val", function (e, newVal, oldVal) {
    //     icon.style.color = vis.binds.vistabbar.getIconColor(newVal, data.iconcoloron, data.iconcoloroff);
    //     icon.innerHTML = vis.binds.vistabbar.getIcon(newVal, data.iconon, data.iconoff);
    //   });
    // }

  },
  setState(data) {
    if (vis.binds.vistabbar.isEditMode()) return;
    if (data.minvalue === null || data.minvalue === "" || data.minvalue.length === 0 || data.maxvalue.length === 0 || data.maxvalue === null || data.maxvalue === "") return;
    var tmpVal = vis.states[data.oid1 + '.val'];
    if (typeof tmpVal !== "undefined" && typeof tmpVal !== "boolean") {
      // data value is not type of boolean; so identify which value is given at the moment an then just set to the opposite
      if (tmpVal === data.minvalue) vis.setValue(data.oid1, data.maxvalue);
      if (tmpVal === data.maxvalue) vis.setValue(data.oid1, data.minvalue);
    } else {
      // data value is type of boolean; just use the opposote of the boolean value
      vis.setValue(data.oid1, !tmpVal);
    }
  },
  getProgress(val, data) {
    if (typeof val === "boolean") {
      if (val) return 100;
      return 0;
    }
    if (typeof val !== "number") {
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
    if (typeof val !== "number") return data.prefix + vis.binds.vistabbar.getBooleanText(val) + data.suffix;
    return data.prefix + Number.parseFloat(val).toFixed(data.numberdecimals) + data.suffix;
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
  timeoutNotification: null,
  showNotification: function (msg, status) {

    clearTimeout(vis.binds.vistabbar.timeoutNotification);

    var node = document.getElementById("vistabbar-notification");
    node.classList.remove("vistabbar-notification-info");
    node.classList.remove("vistabbar-background-green");
    node.classList.remove("vistabbar-background-red");


    var notificationClass = "vistabbar-notification-info";
    if (typeof status !== "undefined") {
      if (status === VISTABBAR.SUCCESS) {
        notificationClass = "vistabbar-background-green" // green
      } else if (status === VISTABBAR.ERROR) {
        notificationClass = "vistabbar-background-red" // red
      } else if (status === VISTABBAR.INFO) {
        notificationClass = "vistabbar-notification-info";
      }
    }


    if (notificationClass !== "") node.classList.add(notificationClass);
    node.style.display = "block";
    node.innerHTML = msg;

    vis.binds.vistabbar.timeout = setTimeout((notificationClass) => {
      if (notificationClass !== "") node.classList.remove(notificationClass);
      node.style.display = "none";
      node.innerHTML = "";
    }, VISTABBAR.TIMEOUTMS, notificationClass);
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
                var v = splitView[1];
                vis.changeView(splitView[0]);
                // vis.binds.vistabbar.showNotification("View changed to: " + v)
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
    if (vis.binds.vistabbar.isEditMode()) return;

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
  isEditMode: function () {
    // "/vis/index.html" OR "/vis/edit.html"
    if (window.location.pathname.includes("edit")) {
      return true;
    }
    return false;
  }
};

vis.binds["vistabbar"].showVersion();