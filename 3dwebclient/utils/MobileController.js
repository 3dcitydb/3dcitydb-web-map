/*
 * 3DCityDB-Web-Map-Client
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2017
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.gis.bgu.tum.de/
 * 
 * The 3DCityDB-Web-Map-Client is jointly developed with the following
 * cooperation partners:
 * 
 * virtualcitySYSTEMS GmbH, Berlin <http://www.virtualcitysystems.de/>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 
 * Controller for mobile devices
 */

(function () {
    /**constructor function**/
    function MobileController() {
        this._isMobile = this.isMobile();

        // GPS functionalities, including geolocation and device orientation
        this._gpsController = new GPSController(this._isMobile);

        // Watch for changes in visibility of iframe to hide/show uiMenu
        this._hiddenInfoboxClassName = "cesium-infoBox-bodyless";
        this._visibleInfoboxClassName = "cesium-infoBox-visible";
        this._oldIframeVisibility = this._visibleInfoboxClassName;
        // this.watchInfoboxVisibility();

        this.setDistanceLegend();
        this.setLoadingIndicator();

        this.hideCredits();
        this.hideNavigationDiv();
        this.hideInspector();

        this.setInfoboxFullscreen();
        this.setToolboxFullscreen();
    }

    Object.defineProperties(MobileController.prototype, {
        isMobile: {
            get: function () {
                return this._isMobile;
            },
            set: function (value) {
                this._isMobile = value;
            }
        },
        gpsController: {
            get: function () {
                return this._gpsController;
            },
            set: function (value) {
                this._gpsController = value;
            }
        },
        oldIframeVisibility: {
            get: function () {
                return this._oldIframeVisibility;
            },
            set: function (value) {
                this._oldIframeVisibility = value;
            }
        },
        hiddenInfoboxClassName: {
            get: function () {
                return this._hiddenInfoboxClassName;
            },
            set: function (value) {
                this._hiddenInfoboxClassName = value;
            }
        },
        visibleInfoboxClassName: {
            get: function () {
                return this._visibleInfoboxClassName;
            },
            set: function (value) {
                this._visibleInfoboxClassName = value;
            }
        }
    });

    /**
     * True if mobile browser is being used.
     * 
     * @returns {Boolean}
     */
    MobileController.prototype.isMobile = function () {
        var scope = this;

        // detectmobilebrowsers.com
        var check = false;
        (function (a) {
            // check for "mobile=true" parameter in URL, else check in browser
            var paraUrl = CitydbUtil.parse_query_string("mobile", window.location.href);
            if (paraUrl && (paraUrl.toLowerCase() === "true")) {
                check = true;
            } else if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                check = true;
            }
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    /**
     * Set distance legend to display on the bottom right corner on mobile devices.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.setDistanceLegend = function () {
        var scope = this;

        if (scope._isMobile) {
            var loop = window.setInterval(function () {
                var distanceLegend = document.getElementsByClassName('distance-legend')[0];
                if (Cesium.defined(distanceLegend)) {
                    distanceLegend.classList.remove("distance-legend");
                    distanceLegend.classList.add("distance-legend-mobile");
                    clearInterval(loop);
                }
            }, 10);
        }
    };

    /**
     * Set loading indicator on mobile devices.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.setLoadingIndicator = function () {
        var scope = this;

        if (scope._isMobile) {
            var loadingIndicator = document.getElementById('loadingIndicator');
            loadingIndicator.classList.remove("loadingIndicator");
            loadingIndicator.classList.add("loadingIndicator-mobile");

            for (var i = 1; i <= 4; i++) {
                var rect = document.createElement("div");
                rect.className = "rect" + i;
                loadingIndicator.appendChild(rect);
            }
        }
    };

    /**
     * Hide credit logos and texts.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.hideCredits = function () {
        var scope = this;

        if (scope._isMobile) {
            var textViewer = document.getElementsByClassName("cesium-widget-credits")[0];
            textViewer.parentNode.removeChild(textViewer);
        }
    };

    /**
     * Hide navigation tools (compass + zooming).
     * 
     * @returns {undefined}
     */
    MobileController.prototype.hideNavigationDiv = function () {
        var scope = this;

        if (scope._isMobile) {
            var loop = window.setInterval(function () {
                var navDiv = document.getElementById("navigationDiv");
                if (Cesium.defined(navDiv)) {
                    navDiv.parentNode.removeChild(navDiv);
                    clearInterval(loop);
                }
            }, 10);
        } else {
            // bring the navigation div to the background
            var loop1 = window.setInterval(function () {
                var navDiv = document.getElementById("navigationDiv");
                if (Cesium.defined(navDiv)) {
                    navDiv.style.zIndex = "0";
                    clearInterval(loop1);
                }
            }, 10);

            // bring the infobox to the foreground
            var loop2 = window.setInterval(function () {
                var infobox = document.getElementsByClassName("cesium-infoBox cesium-infoBox-visible")[0];
                if (Cesium.defined(infobox)) {
                    infobox.style.zIndex = "1000";
                    clearInterval(loop2);
                }
            }, 10);
        }
    };

    /**
     * Hide inspector that shows number of cached and loaded tiles.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.hideInspector = function () {
        var scope = this;

        if (scope._isMobile) {
            var loadingImg = document.getElementById("citydb_loadingTilesInspector");
            var parentNode = loadingImg.parentNode;
            parentNode.removeChild(loadingImg);
            var loadingTileIndicator = document.createElement("div");
            loadingTileIndicator.id = "citydb_loadingTilesInspector";
            loadingTileIndicator.className = "loadingIndicator-tile-mobile";
            parentNode.appendChild(loadingTileIndicator);

            var cachedTiles = document.getElementById("citydb_cachedTilesInspector");
            cachedTiles.style.display = "none";

            var showedTiles = document.getElementById("citydb_showedTilesInspector");
            showedTiles.style.display = "none";
        }
    };

    /**
     * Automatically hide toolbox/uiMenu when an infox is shown in fullscreen.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.watchInfoboxVisibility = function () {
        var scope = this;

        window.setInterval(function () {
            var loop = window.setInterval(function () {
                var infobox = document.getElementsByClassName('infobox-full')[0];
                var uiMenu = document.getElementById('uiMenu');

                if (Cesium.defined(infobox) && Cesium.defined(uiMenu)) {
                    for (var i = 0; i < infobox.classList.length; i++) {
                        if (infobox.classList[i] === "cesium-infoBox-visible") {
                            if (scope._oldIframeVisibility === "cesium-infoBox-bodyless") {
                                uiMenu.style.display = "none";
                                scope._oldIframeVisibility = "cesium-infoBox-visible";
                                break;
                            }
                        }

                        if (infobox.classList[i] === "cesium-infoBox-bodyless") {
                            if (scope._oldIframeVisibility === "cesium-infoBox-visible") {
                                uiMenu.style.display = "block";
                                scope._oldIframeVisibility = "cesium-infoBox-bodyless";
                                break;
                            }
                        }
                    }
                    clearInterval(loop);
                }
            }, 10);
        }, 200);
    };

    /**
     * Set infobox containing thematic values to fullscreen on mobile devices.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.setInfoboxFullscreen = function () {
        var scope = this;

        if (scope._isMobile) {
            var infobox = document.getElementsByClassName('cesium-infoBox')[0];
            infobox.classList.add("infobox-full");
            if (scope.getMobileOS() === "iOS") {
                infobox.classList.add("infobox-full-ios");
            }
        }
    };

    /**
     * Set toolbox to fullscreen on mobile devices.
     * 
     * @returns {undefined}
     */
    MobileController.prototype.setToolboxFullscreen = function () {
        var scope = this;

        if (scope._isMobile) {
            var uiMenu = document.getElementById('uiMenu-content');
            uiMenu.style.display = "block";
            uiMenu.classList.add("uiMenu-full");
            if (scope.getMobileOS() === "iOS") {
                uiMenu.classList.add("uiMenu-full-ios");
            }

            var toolbox = document.getElementById('citydb_toolbox');
            toolbox.classList.add("toolbox-full");
        }
    };

    /**
     * Determine the mobile operating system.
     * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
     * https://stackoverflow.com/questions/21741841/detecting-ios-android-operating-system#answer-21742107
     *
     * @returns {String}
     */
    MobileController.prototype.getMobileOS = function () {
        var scope = this;

        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }

        return "unknown";
    };

    window.MobileController = MobileController;
})();