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
 * GPS Geolocation with device orientation in real-time
 */

(function () {
    /**constructor function**/
    function GPSController(isMobilePara) {
        this._liveTrackingActivated = false;
        this._timer = undefined;
        this._timerMiliseconds = 350; // duration between clicks in ms
        this._savedAlpha = undefined;
        this._firstActivated = false;
        this._watchPos = false;
        this._touchHoldDuration = 500; // touch press duration in ms
        this._longPress = false;
        this._isMobile = isMobilePara;
        this.createGPSButton();
    }

    Object.defineProperties(GPSController.prototype, {
        liveTrackingActivated: {
            get: function () {
                return this._liveTrackingActivated;
            },
            set: function (value) {
                this._liveTrackingActivated = value;
            }
        },
        timer: {
            get: function () {
                return this._timer;
            },
            set: function (value) {
                this._timer = value;
            }
        },
        timerMiliseconds: {
            get: function () {
                return this._timerMiliseconds;
            },
            set: function (value) {
                this._timerMiliseconds = value;
            }
        },
        savedAlpha: {
            get: function () {
                return this._savedAlpha;
            },
            set: function (value) {
                this._savedAlpha = value;
            }
        },
        firstActivated: {
            get: function () {
                return this._firstActivated;
            },
            set: function (value) {
                this._firstActivated = value;
            }
        },
        watchPos: {
            get: function () {
                return this._watchPos;
            },
            set: function (value) {
                this._watchPos = value;
            }
        },
        touchHoldDuration: {
            get: function () {
                return this._touchHoldDuration;
            },
            set: function (value) {
                this._touchHoldDuration = value;
            }
        },
        longPress: {
            get: function () {
                return this._longPress;
            },
            set: function (value) {
                this._longPress = value;
            }
        },
        isMobile: {
            get: function () {
                return this._isMobile;
            },
            set: function (value) {
                this._isMobile = value;
            }
        }
    });

    GPSController.prototype.createGPSButton = function () {
        var scope = this;

        var button = document.getElementById("gpsButton");
        button.className = "cesium-button cesium-toolbar-button tracking-deactivated";
        button.title = "View GPS (single-click: one time, double-click: real-time)";

        // replace the 3D/2D button with this GPS button
        var customCesiumViewerToolbar = document.getElementsByClassName("cesium-viewer-toolbar")[0];
        var customGlobeButton = customCesiumViewerToolbar.getElementsByClassName("cesium-sceneModePicker-wrapper cesium-toolbar-button")[0];
        customCesiumViewerToolbar.replaceChild(button, customGlobeButton);

        if (scope._isMobile) {
            // remove home button
            var customHomeButton = customCesiumViewerToolbar.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];
            customCesiumViewerToolbar.removeChild(customHomeButton);

            // remove info button
            // var customInfoButton = customCesiumViewerToolbar.getElementsByClassName("cesium-navigationHelpButton-wrapper")[0];
            // customCesiumViewerToolbar.removeChild(customInfoButton);
        }

        // --------------------------MOUSE HELD EVENT--------------------------
        var holdStart = 0;
        var holdTime = 0;
        if (scope._isMobile) {
            button.addEventListener("touchstart", function (evt) {
                holdStart = Date.now();
            }, false);
            button.addEventListener("touchend", function (evt) {
                holdTime = Date.now() - holdStart;
                scope._longPress = holdTime >= scope._touchHoldDuration;
            }, false);
        } else {
            button.addEventListener("mousedown", function (evt) {
                holdStart = Date.now();
            }, false);
            window.addEventListener("mouseup", function (evt) {
                holdTime = Date.now() - holdStart;
                scope._longPress = holdTime >= scope._touchHoldDuration;
            }, false);
        }

        // --------------------------MOUSE CLICK EVENT-------------------------
        button.onclick = function () {
            if (scope._liveTrackingActivated) {
                scope._liveTrackingActivated = false;
                scope.stopTracking();
            }

            if (!scope._longPress) {
                var object = document.getElementById("gpsButton");
                // distinguish between double-click and single-click
                // https://stackoverflow.com/questions/5497073/how-to-differentiate-single-click-event-and-double-click-event#answer-16033129
                if (object.getAttribute("data-double-click") == null) {
                    object.setAttribute("data-double-click", 1);
                    setTimeout(function () {
                        if (object.getAttribute("data-double-click") == 1) {
                            scope.handleClick();
                        }
                        object.removeAttribute("data-double-click");
                    }, 500);
                } else if (object.getAttribute("data-triple-click") == null) {
                    object.setAttribute("data-triple-click", 1);
                    setTimeout(function () {
                        if (object.getAttribute("data-triple-click") == 1) {
                            scope.handleDclick();
                        }
                        object.removeAttribute("data-double-click");
                        object.removeAttribute("data-triple-click");
                    }, 500);
                } else {
                    object.removeAttribute("data-double-click");
                    object.removeAttribute("data-triple-click");
                    scope.handleTclick();
                }
            } else {
                var restartView = function (_callback) {
                    scope._firstActivated = false;
                    cesiumCamera.cancelFlight();
                    _callback();
                };

                restartView(function () {
                    cesiumCamera.flyTo({
                        destination: Cesium.Cartesian3.fromRadians(
                            cesiumCamera.positionCartographic.longitude,
                            cesiumCamera.positionCartographic.latitude,
                            250),
                        orientation: {
                            heading: cesiumCamera.heading,
                            pitch: Cesium.Math.toRadians(-75),
                            roll: 0
                        }
                    });
                });
            }
        }
    }

    // Handle single-click
    GPSController.prototype.handleClick = function () {
        var scope = this;

        if (scope._liveTrackingActivated) {
            scope._liveTrackingActivated = false;
            scope.stopTracking();
        } else {
            var button = document.getElementById("gpsButton");
            button.classList.remove("tracking-ori-activated");
            button.classList.remove("tracking-pos-ori-activated");
            button.classList.add("tracking-deactivated");

            // one time tracking
            scope.startTracking();
        }
    }

    // Handle double-click
    GPSController.prototype.handleDclick = function () {
        var scope = this;

        if (scope._liveTrackingActivated) {
            scope._liveTrackingActivated = false;
            scope.stopTracking();
        } else {
            scope._liveTrackingActivated = true;
            scope._watchPos = false;

            var button = document.getElementById("gpsButton");
            button.classList.remove("tracking-deactivated");
            button.classList.remove("tracking-ori-deactivated");
            button.classList.add("tracking-ori-activated");

            // tracking in intervals of miliseconds
            scope.startTracking();
        }
    }

    // Handle triple-click
    GPSController.prototype.handleTclick = function () {
        var scope = this;

        if (scope._liveTrackingActivated) {
            scope._liveTrackingActivated = false;
            scope.stopTracking();
        } else {
            scope._liveTrackingActivated = true;
            scope._watchPos = true;

            var button = document.getElementById("gpsButton");
            button.classList.remove("tracking-deactivated");
            button.classList.remove("tracking-pos-ori-deactivated");
            button.classList.add("tracking-pos-ori-activated");

            // tracking in intervals of miliseconds
            scope.startTracking();
        }
    }

    GPSController.prototype.startTracking = function () {
        var scope = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            CitydbUtil.showAlertWindow("OK", "Error", "Geolocation is not supported by this browser.");
        }

        function showPosition(position) {
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', function auxOrientation(event) {
                    flyToLocationWithOrientation(position, event, () => {
                        setTimeout(function () {
                            // one-time event
                            window.removeEventListener('deviceorientation', auxOrientation, false);
                        }, scope._timerMiliseconds);
                    });
                }, false);
            } else {
                CitydbUtil.showAlertWindow("OK", "Error", "Exact geolocation is not supported by this device.");
            }

            function flyToLocationWithOrientation(position, ori, callback) {
                var oriAlpha = 0;
                var oriBeta = 0;
                var oriGamma = 0;
                var oriHeight = 2;

                var angle = 0;
                if (ori.webkitCompassHeading) {
                    angle = ori.webkitCompassHeading;
                } else {
                    angle = 360 - ori.alpha;
                }

                if (typeof scope._savedAlpha !== "undefined") {
                    var diffAngle = angle - scope._savedAlpha;
                    if (diffAngle > 180) {
                        angle -= 360;
                    } else if (diffAngle < -180) {
                        angle += 360;
                    }
                }

                oriAlpha = Cesium.Math.toRadians(angle);
                scope._savedAlpha = oriAlpha;

                // change view if specified in URL
                var paraUrl = CitydbUtil.parse_query_string("viewMode", window.location.href);
                if (paraUrl) {
                    switch (paraUrl.toLowerCase()) {
                        case "fpv":
                            // first person view
                            setFirstPersonView();
                            break;
                        case "debug":
                            // debug view
                            setDebugView();
                            break;
                        default:
                            // default view = first person view
                            setFirstPersonView();
                    }
                } else {
                    // default view = first person view
                    setFirstPersonView();
                }

                function setFirstPersonView() {
                    if (!scope._firstActivated) {
                        oriBeta = 0;
                    } else {
                        oriBeta = cesiumCamera.pitch;
                    }
                    oriGamma = 0;
                    oriHeight = 2;
                }

                function setDebugView() {
                    oriBeta = Cesium.Math.toRadians(-90);
                    oriGamma = 0;
                    oriHeight = 150;
                }

                cesiumCamera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, oriHeight),
                    orientation: {
                        heading: oriAlpha,
                        pitch: oriBeta,
                        roll: oriGamma
                    },
                    complete: function () {
                        scope._firstActivated = true;
                        if (scope._liveTrackingActivated) {
                            if (!scope._longPress) {
                                // real-time tracking
                                scope._timer = setTimeout(function () {
                                    if (scope._watchPos) {
                                        // also check position in real-time 
                                        scope.startTracking();
                                    } else {
                                        // only check orientation in real-time
                                        showPosition(position);
                                    }
                                }, scope._timerMiliseconds);
                            }
                        }
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    CitydbUtil.showAlertWindow("OK", "Error", "Geolocation denied by user.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    CitydbUtil.showAlertWindow("OK", "Error", "Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    CitydbUtil.showAlertWindow("OK", "Error", "Location request has timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    CitydbUtil.showAlertWindow("OK", "Error", "An unknown error has occurred while requesting location information.");
                    break;
            }
        }
    }

    GPSController.prototype.stopTracking = function () {
        var scope = this;

        scope._watchPos = false;

        var button = document.getElementById("gpsButton");
        button.classList.remove("tracking-activated");
        button.classList.add("tracking-deactivated");

        clearTimeout(scope._timer);
    }

    window.GPSController = GPSController;
})();
