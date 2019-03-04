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
    $('*').css({
        '-webkit-filter': 'none',
        '-moz-filter': 'none',
        '-o-filter': 'none',
        '-ms-filter': 'none',
        'filter': 'none',
    });
}

// Open splash window and blur all elements but the splash window
function openSplashWindow() {
    document.getElementById("splashwindow_iframe").style.display = 'block';
    $('body>*:not(#splashwindow_iframe)').css("filter", "blur(3px)");
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

    addSplashWindowModel.url = tmp_url;
    addSplashWindowModel.showOnStart = tmp_showOnStart;
    document.getElementById("showOnStart_checkbox").checked = (tmp_showOnStart == "true");
    ignoreSplashWindow_cookie = (tmp_showOnStart == "false") + "";

    ignoreSplashWindow_cookie == "true" ? closeSplashWindow() : addSplashWindow();
}