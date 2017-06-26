/**
 * 
 * GPS Geolocation with device orientation in real-time
 */

(function () {
    /**constructor function**/
    function GPSController() {
        this._liveTrackingActivated = false;
        this._timer = undefined;
        this._timerMiliseconds = 1000;
        this._savedAlpha = undefined;
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
    }

    GPSController.prototype.handleDclick = function () {
        var scope = this;
        if (scope._liveTrackingActivated) {
            scope._liveTrackingActivated = false;
            scope.stopTracking();
        } else {
            scope._liveTrackingActivated = true;
            // tracking in intervals of miliseconds
            scope.startTracking();
        }
    }

    GPSController.prototype.handleClick = function () {
        var scope = this;
        if (scope._liveTrackingActivated) {
            scope._liveTrackingActivated = false;
            scope.stopTracking();
        } else {
            // one time tracking
            scope.startTracking();
        }
    }

    GPSController.prototype.startTracking = function () {
        var scope = this;

        if (scope._liveTrackingActivated) {
            var button = document.getElementById("gpsButton");
            button.classList.remove("tracking-deactivated");
            button.classList.add("tracking-activated");
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }

        function showPosition(position) {
            getLocation();

            function getLocation() {
                if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', function auxOrientation(event) {
                        // one-time event
                        window.removeEventListener('deviceorientation', auxOrientation, false);
                        flyToLocationWithOrientation(position, event);
                    }, false);
                } else {
                    alert("Exact geolocation is not supported by this device.");
                    flyToLocationWithOrientation(position, event);
                }
            }

            function flyToLocationWithOrientation(position, ori) {
                var oriAlpha = 0;
                var oriBeta = 0;
                var oriGamma = 0;

//                if (Cesium.defined(ori)) {
//                    var mobileOS = getMobileOperatingSystem();
//                    // ALPHA
//                    if (mobileOS === "iOS" && ori.webkitCompassHeading) {
//                        oriAlpha = ori.webkitCompassHeading;
//                        // webkitCompassHeading is in [0, 360] degrees positive clockwise (non negative)
//                        // while heading is [-pi,pi), where positive points eastward
//                        if (oriAlpha < 180) {
//                            oriAlpha = Cesium.Math.toRadians(oriAlpha);
//                        } else {
//                            oriAlpha = Cesium.Math.toRadians(oriAlpha - 360);
//                        }
//                    } else if (Cesium.defined(ori.alpha)) {
//                        oriAlpha = ori.alpha;
//                        // alpha is in [0,360) degrees positive counterclockwise (non negative)
//                        // while heading is [-pi,pi), where positive points eastward
//                        if (oriAlpha < 180) {
//                            oriAlpha = Cesium.Math.toRadians(-oriAlpha);
//                        } else {
//                            oriAlpha = Cesium.Math.toRadians(180 - (oriAlpha - 180));
//                        }
//                    }
//
//                    // BETA
////                    if (Cesium.defined(ori.beta)) {
////                        oriBeta = Cesium.Math.toRadians(ori.beta - 90);
////                    }
//                }

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

                cesiumCamera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 2),
                    orientation: {
                        heading: oriAlpha,
                        pitch: oriBeta,
                        roll: oriGamma
                    },
                    complete: function () {
                        if (scope._liveTrackingActivated) {
                            // real-time tracking
                            scope._timer = setTimeout(function () {
                                // only check orientation in real-time
                                showPosition(position);
                                // also check position in real-time 
                                // scope.startTracking();
                            }, scope._timerMiliseconds);
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

        var button = document.getElementById("gpsButton");
        button.classList.remove("tracking-activated");
        button.classList.add("tracking-deactivated");

        clearTimeout(scope._timer);
    }

    window.GPSController = GPSController;
})();
