// Insert the info button in the cesium navigation help popup (the question mark button)
function insertSplashInfoHelp() {
    // Insert info button
    var cesiumNavHelp = document.getElementsByClassName("cesium-navigation-help")[0];

    var mouseButton = document.getElementsByClassName("cesium-navigation-button cesium-navigation-button-left")[0];
    mouseButton.classList.add("cesium-navigation-button-custom");
    mouseButton.style.width = "33.33%";

    var touchButton = document.getElementsByClassName("cesium-navigation-button cesium-navigation-button-right")[0];
    touchButton.classList.add("cesium-navigation-button-custom");
    touchButton.style.width = "33.33%";
    touchButton.style.borderRadius = "0 0 0 0";

    var infoButton = document.createElement("BUTTON");
    infoButton.type = "button";
    infoButton.className = "cesium-navigation-button cesium-navigation-button-right cesium-navigation-button-unselected";
    infoButton.style.width = "33.33%";
    infoButton.style.filter = "none";

    var infoImage = document.createElement("IMG");
    infoImage.src = "images/Info.svg";
    infoImage.className = "cesium-navigation-button-icon";
    infoImage.style = "width: 25px; height: 25px; filter: none;";
    infoButton.appendChild(infoImage);

    infoButton.appendChild(document.createTextNode('About'));

    touchButton.parentNode.insertBefore(infoButton, touchButton.nextSibling);

    // Insert contents
    //var wrapper = document.getElementsByClassName("cesium-navigationHelpButton-wrapper")[0];
    var container = document.getElementsByClassName("cesium-navigation-help")[0];
    var contents = document.createElement("DIV");
    contents.className = 'cesium-navigation-help-instructions';
    contents.style.display = "none";
    contents.innerHTML = '\
            <div class="cesium-navigation-help-zoom" style="padding: 15px 5px 20px 5px; text-align: center;">3DCityDB Web Map Client</div>\
            <hr width="50%" style="margin-top: -10px; border-color: grey;">\
            <div class="cesium-navigation-help-details" style="padding: 5px; text-align: center;">This tool employs the JavaScript library <a href="https://cesiumjs.org/" target="_blank">CesiumJS</a> and is a part of the 3D City Database (3DCityDB) <a href="https://www.3dcitydb.org/3dcitydb/software/" target="_blank">Software Suite</a>.</div>\
            <table>\
                <tr>\
                    <td><img src="' + 'images/3DCityDB_Logo.png' + '" width="76" height="81" /></td>\
                    <td>\
                        <!-- <div class="cesium-navigation-help-pan">Chair of Geoinformatics</div>\ -->\
                        <div class="cesium-navigation-help-details"><a href="https://www.3dcitydb.org/" target="_blank">3D City Database</a></div>\
                    </td>\
                </tr>\
            </table>\
            \
            <hr width="50%" style="margin-top: 5px; border-color: grey;">\
            <div class="cesium-navigation-help-details" style="padding: 5px 5px 5px 5px; text-align: center;">Developed and maintained by:</div>\
            <table>\
                <tr>\
                    <td><img src="' + 'images/TUM_Logo.svg' + '" width="76" height="40" /></td>\
                    <td>\
                        <!-- <div class="cesium-navigation-help-pan">Chair of Geoinformatics</div>\ -->\
                        <div class="cesium-navigation-help-details"><a href="https://www.gis.bgu.tum.de/en/home/" target="_blank">TUM, Chair of Geoinformatics</a></div>\
                    </td>\
                </tr>\
            </table>\
            <div class="cesium-navigation-help-zoom" style="padding: 15px 5px 5px 15px; text-align: center;">\
                <button class="cesium-button" style="font-size: medium; padding: 10px 15px 10px 15px; text-align: center;" onclick="addSplashWindow()">Show splash window</button>\
            </div>';
    container.appendChild(contents);

    // Handle switching
    infoButton.onclick = function () {
        // Unselect mouse button
        mouseButton.classList.remove('cesium-navigation-button-selected');
        mouseButton.classList.add('cesium-navigation-button-unselected');
        // Unselect touch button
        touchButton.classList.remove('cesium-navigation-button-selected');
        touchButton.classList.add('cesium-navigation-button-unselected');
        // Select info button
        infoButton.classList.remove('cesium-navigation-button-unselected');
        infoButton.classList.add('cesium-navigation-button-selected');
        contents.style.display = "block";

        // Hide mouse contents
        var mouseContents = document.getElementsByClassName("cesium-click-navigation-help")[0];
        mouseContents.classList.remove("cesium-click-navigation-help-visible");

        // Hide touch contents
        var touchContents = document.getElementsByClassName("cesium-touch-navigation-help")[0];
        touchContents.classList.remove("cesium-touch-navigation-help-visible");
    }

    mouseButton.onclick = function () {
        // Unselect info button
        infoButton.classList.remove('cesium-navigation-button-selected');
        infoButton.classList.add('cesium-navigation-button-unselected');
        // Unselect touch button
        touchButton.classList.remove('cesium-navigation-button-selected');
        touchButton.classList.add('cesium-navigation-button-unselected');
        // Select mouse button
        mouseButton.classList.remove('cesium-navigation-button-unselected');
        mouseButton.classList.add('cesium-navigation-button-selected');
        document.getElementsByClassName("cesium-click-navigation-help cesium-navigation-help-instructions")[0].classList.add("cesium-click-navigation-help-visible");

        // Hide touch contents
        var touchContents = document.getElementsByClassName("cesium-touch-navigation-help")[0];
        touchContents.classList.remove("cesium-touch-navigation-help-visible");

        // Hide info contents
        contents.style.display = "none";
    }

    touchButton.onclick = function () {
        // Unselect info button
        infoButton.classList.remove('cesium-navigation-button-selected');
        infoButton.classList.add('cesium-navigation-button-unselected');
        // Unselect mouse button
        mouseButton.classList.remove('cesium-navigation-button-selected');
        mouseButton.classList.add('cesium-navigation-button-unselected');
        // Select touch button
        touchButton.classList.remove('cesium-navigation-button-unselected');
        touchButton.classList.add('cesium-navigation-button-selected');
        document.getElementsByClassName("cesium-touch-navigation-help cesium-navigation-help-instructions")[0].classList.add("cesium-touch-navigation-help-visible");

        // Hide mouse contents
        var mouseContents = document.getElementsByClassName("cesium-click-navigation-help")[0];
        mouseContents.classList.remove("cesium-click-navigation-help-visible");

        // Hide info contents
        contents.style.display = "none";
    }

    // Source: https://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
    function eventFire(el, etype) {
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }

    // Show info in the help popup by default
    eventFire(infoButton, 'click');
}

function addSplashWindow() {
    document.getElementById("splashwindow_iframe_content").src = addSplashWindowModel.url;
    setCookie("ignoreSplashWindow", (addSplashWindowModel.showOnStart == "false" || addSplashWindowModel.showOnStart == false) + "");

    // show splash window now
    openSplashWindow();
}

function removeSplashWindow() {
    document.getElementById("splashwindow_iframe_content").src = undefined;
    setCookie("ignoreSplashWindow", undefined);
    addSplashWindowModel.url = "";
    addSplashWindowModel.showOnStart = "";

    // close splash window now
    closeSplashWindow();
}

function ignoreSplashWindow() {
    createCookie("ignoreSplashWindow", "true", 14);
    document.getElementById("showOnStart_checkbox").checked = false;
    closeSplashWindow();
}

// Hide splash window and unblur all elements
function closeSplashWindow() {
    document.getElementById("splashwindow_iframe").style.display = 'none';
    document.getElementsByClassName("splashscreen-buttons")[0].style.display = 'none';
    (function($) {
        $('*').css({
            '-webkit-filter': 'none',
            '-moz-filter': 'none',
            '-o-filter': 'none',
            '-ms-filter': 'none',
            'filter': 'none',
        });
    })(jQuery);
}

// Open splash window and blur all elements but the splash window
function openSplashWindow() {
    document.getElementById("splashwindow_iframe").style.display = 'block';
    document.getElementsByClassName("splashscreen-buttons")[0].style.display = 'block';
    (function($) {
        $('body>*:not(#splashwindow_iframe):not(.splashscreen-buttons)').css("filter","blur(3px)");
    })(jQuery);
}

function getSplashWindowFromUrl() {
    var tmp_url = "";
    var tmp_showOnStart = "";
    var default_url = "splash/SplashWindow.html";
    var default_showOnStart = "true";

    var ignoreSplashWindow_cookie = getCookie("ignoreSplashWindow");
    var splashWindowConfigString = CitydbUtil.parse_query_string('splashWindow', window.location.href);
    if (splashWindowConfigString) {
        var splashWindowConfig = Cesium.queryToObject(Object.keys(Cesium.queryToObject(splashWindowConfigString))[0]);
        tmp_url = splashWindowConfig.url ? splashWindowConfig.url : "";
        // if this page has already been visited and has the cookie ignoreSplashWindow, then priortize this cookie before the URL string parameter showOnStart
        if (typeof ignoreSplashWindow_cookie === "undefined" || ignoreSplashWindow_cookie == "") {
            tmp_showOnStart = (typeof splashWindowConfig.showOnStart === "undefined" || splashWindowConfig.showOnStart === "") ? default_showOnStart : splashWindowConfig.showOnStart;
        } else {
            tmp_showOnStart = (ignoreSplashWindow_cookie == "false") + "";
        }
    } else {
        tmp_url = default_url;
        if (typeof ignoreSplashWindow_cookie === "undefined" || ignoreSplashWindow_cookie == "") {
            tmp_showOnStart = default_showOnStart;
            ignoreSplashWindow_cookie = (default_showOnStart == "false") + "";
        } else {
            tmp_showOnStart = (ignoreSplashWindow_cookie == "false") + "";
        }
    }

    addSplashWindowModel.url = (addSplashWindowModel.url ? addSplashWindowModel.url : tmp_url);
    addSplashWindowModel.showOnStart = tmp_showOnStart;
    document.getElementById("showOnStart_checkbox").checked = (tmp_showOnStart == "true");
    ignoreSplashWindow_cookie = (tmp_showOnStart == "false") + "";

    ignoreSplashWindow_cookie == "true" ? closeSplashWindow() : addSplashWindow();
}