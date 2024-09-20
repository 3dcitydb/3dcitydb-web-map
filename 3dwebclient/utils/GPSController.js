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
        this._intervalIDOri = undefined;
        this._intervalIDPosOri = undefined;
        this._timerMiliseconds = 2000; // track interval
        this._savedAlpha = undefined;
        this._firstPersonViewActivated = false;
        this._watchPos = false;
        this._isMobile = isMobilePara;
        this.createGPSButtons();
    }

    Object.defineProperties(GPSController.prototype, {
        intervalIDOri: {
            get: function () {
                return this._intervalIDOri;
            }
        },
        intervalIDPosOri: {
            get: function () {
                return this._intervalIDPosOri;
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
        firstPersonViewActivated: {
            get: function () {
                return this._firstPersonViewActivated;
            },
            set: function (value) {
                this._firstPersonViewActivated = value;
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
        isMobile: {
            get: function () {
                return this._isMobile;
            },
            set: function (value) {
                this._isMobile = value;
            }
        }
    });

    GPSController.prototype.createGPSButtons = function () {
        const scope = this;

        const gpsSpan = document.getElementById("gpsSpan");
        const gpsButtonMain = document.getElementById("gpsButtonMain");
        const gpsButtonSingle = document.getElementById("gpsButtonSingle");
        const gpsButtonLiveOri = document.getElementById("gpsButtonLiveOri");
        const gpsButtonLivePosOri = document.getElementById("gpsButtonLivePosOri");
        const gpsButtonOff = document.getElementById("gpsButtonOff");

        if (gpsButtonMain) {
            gpsButtonMain.onclick = function () {
                toggleGPSButtonMain();
                toggleGPSButton(gpsButtonSingle);
                toggleGPSButton(gpsButtonLiveOri);
                toggleGPSButton(gpsButtonLivePosOri);
                toggleGPSButton(gpsButtonOff);
            }
        }

        if (gpsSpan) {
            gpsSpan.onfocusout = function () {
                deselectGPSButtonMain();
                hideGPSButton(gpsButtonSingle);
                hideGPSButton(gpsButtonLiveOri);
                hideGPSButton(gpsButtonLivePosOri);
                hideGPSButton(gpsButtonOff);
            }
        }

        function toggleGPSButtonMain() {
            if (gpsButtonMain.classList.contains("cesium-sceneModePicker-selected")) {
                deselectGPSButtonMain();
            } else {
                selectGPSButtonMain();
            }
        }

        function selectGPSButtonMain() {
            gpsButtonMain.classList.add("cesium-sceneModePicker-selected");
        }

        function deselectGPSButtonMain() {
            gpsButtonMain.classList.remove("cesium-sceneModePicker-selected");
        }

        function toggleGPSButton(button) {
            if (button.classList.contains("cesium-sceneModePicker-hidden")) {
                showGPSButton(button);
            } else if (button.classList.contains("cesium-sceneModePicker-visible")) {
                hideGPSButton(button);
            }
        }

        function hideGPSButton(button) {
            button.classList.remove("cesium-sceneModePicker-visible");
            button.classList.add("cesium-sceneModePicker-hidden");
        }

        function showGPSButton(button) {
            button.classList.remove("cesium-sceneModePicker-hidden");
            button.classList.add("cesium-sceneModePicker-visible");
        }

        // replace the 3D/2D button with this GPS button and its list elements
        const customCesiumViewerToolbar = document.getElementsByClassName("cesium-viewer-toolbar")[0];
        const customGlobeSpan = customCesiumViewerToolbar.getElementsByClassName("cesium-sceneModePicker-wrapper cesium-toolbar-button")[0];
        customCesiumViewerToolbar.replaceChild(gpsSpan, customGlobeSpan);

        // Show position and orientation snapshot
        gpsButtonSingle.onclick = function () {
            // Replace the main GPS button symbol with this button
            gpsButtonMain.classList.remove("gps-button-main");
            gpsButtonMain.classList.add("gps-button-single");
            // Disable tracking
            clearInterval(scope._intervalIDOri);
            scope._intervalIDOri = undefined;
            clearInterval(scope._intervalIDPosOri);
            scope._intervalIDPosOri = undefined;
            // Hide GPS span
            gpsButtonSingle.dispatchEvent(new Event("focusout"));
            // Get position and orientation
            if (window.DeviceOrientationEvent) {
                if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                    // iOS 13+
                    window.DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition((position) => {
                                        window.addEventListener('deviceorientation', function auxOrientation(ori) {
                                            flyToLocationWithOrientation(position, ori, () => {
                                                setTimeout(function () {
                                                    // one-time event
                                                    window.removeEventListener('deviceorientation', auxOrientation, false);
                                                }, scope._timerMiliseconds);
                                            });
                                        }, false);
                                    }, showError);
                                } else {
                                    CitydbUtil.showAlertWindow("OK", "Error", "Geolocation not supported.");
                                }
                            } else {
                                CitydbUtil.showAlertWindow("OK", "Error", "Orientation denied.");
                            }
                        })
                        .catch(error => {
                            CitydbUtil.showAlertWindow("OK", "Error", error);
                        });
                } else {
                    // Other devices
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                            window.addEventListener('deviceorientation', function auxOrientation(ori) {
                                flyToLocationWithOrientation(position, ori, () => {
                                    setTimeout(function () {
                                        // one-time event
                                        window.removeEventListener('deviceorientation', auxOrientation, false);
                                    }, scope._timerMiliseconds);
                                });
                            }, false);
                        }, showError);
                    } else {
                        CitydbUtil.showAlertWindow("OK", "Error", "Geolocation not supported.");
                    }
                }
            } else {
                CitydbUtil.showAlertWindow("OK", "Error", "Orientation not supported.");
            }
        }

        // Track orientation (with fixed position)
        gpsButtonLiveOri.onclick = function () {
            // Handle tracking
            if (scope._intervalIDPosOri) {
                // Disable tracking position + orientation
                clearInterval(scope._intervalIDPosOri);
                scope._intervalIDPosOri = undefined;
            }
            if (scope._intervalIDOri) {
                // Already tracking -> disable tracking
                clearInterval(scope._intervalIDOri);
                scope._intervalIDOri = undefined;
                // Restore the main GPS button symbol
                gpsButtonMain.classList.remove("gps-button-single");
                gpsButtonMain.classList.remove("gps-button-live-ori");
                gpsButtonMain.classList.remove("gps-button-live-pos-ori");
                gpsButtonMain.classList.add("gps-button-main");
                restartCamera();
            } else {
                // Start tracking
                scope._intervalIDOri = undefined;
                // Replace the main GPS button symbol with this button
                gpsButtonMain.classList.remove("gps-button-main");
                gpsButtonMain.classList.add("gps-button-live-ori");
                // Hide GPS span
                gpsButtonLiveOri.dispatchEvent(new Event("focusout"));
                // Get position and orientation
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        if (window.DeviceOrientationEvent) {
                            if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                                // iOS 13+
                                window.DeviceOrientationEvent.requestPermission()
                                    .then(permissionState => {
                                        if (permissionState === 'granted') {
                                            window.addEventListener('deviceorientation', function auxOrientation(ori) {
                                                // First fly (might take longer than timer)
                                                flyToLocationWithOrientation(position, ori, () => {
                                                    setTimeout(function () {
                                                        // One-time event
                                                        window.removeEventListener('deviceorientation', auxOrientation, false);
                                                        // Subsequently: Update camera every interval
                                                        scope._intervalIDOri = setInterval(function () {
                                                            window.DeviceOrientationEvent.requestPermission()
                                                                .then(permissionState => {
                                                                    if (permissionState === 'granted') {
                                                                        window.addEventListener('deviceorientation', function aux(ori) {
                                                                            flyToLocationWithOrientation(position, ori, () => {
                                                                                window.removeEventListener('deviceorientation', aux, false);
                                                                            })
                                                                        }, false);
                                                                    } else {
                                                                        CitydbUtil.showAlertWindow("OK", "Error", "Could not access geolocation on this device.");
                                                                    }
                                                                })
                                                                .catch(error => {
                                                                    CitydbUtil.showAlertWindow("OK", "Error", error);
                                                                });
                                                        }, scope._timerMiliseconds);
                                                    }, scope._timerMiliseconds);
                                                });
                                            }, false);
                                        } else {
                                            CitydbUtil.showAlertWindow("OK", "Error", "Could not access geolocation on this device.");
                                        }
                                    })
                                    .catch(error => {
                                        CitydbUtil.showAlertWindow("OK", "Error", error);
                                    });
                            } else {
                                // Other devices
                                window.addEventListener('deviceorientation', function auxOrientation(ori) {
                                    // First fly (might take longer than timer)
                                    flyToLocationWithOrientation(position, ori, () => {
                                        setTimeout(function () {
                                            // One-time event
                                            window.removeEventListener('deviceorientation', auxOrientation, false);
                                            // Subsequently: Update camera every interval
                                            scope._intervalIDOri = setInterval(function () {
                                                window.addEventListener('deviceorientation', function aux(ori) {
                                                    flyToLocationWithOrientation(position, ori, () => {
                                                        window.removeEventListener('deviceorientation', aux, false);
                                                    })
                                                }, false);
                                            }, scope._timerMiliseconds);
                                        }, scope._timerMiliseconds);
                                    });
                                }, false);
                            }
                        } else {
                            CitydbUtil.showAlertWindow("OK", "Error", "Exact geolocation is not supported by this device.");
                        }
                    }, showError);
                } else {
                    CitydbUtil.showAlertWindow("OK", "Error", "Geolocation is not supported by this browser.");
                }
            }
        }

        // Track position and orientation
        gpsButtonLivePosOri.onclick = function () {
            // Handle tracking
            if (scope._intervalIDOri) {
                // Disable tracking orientation (with fixed position)
                clearInterval(scope._intervalIDOri);
                scope._intervalIDOri = undefined;
            }
            if (scope._intervalIDPosOri) {
                // Already tracking -> disable tracking
                clearInterval(scope._intervalIDPosOri);
                scope._intervalIDPosOri = undefined;
                // Restore the main GPS button symbol
                gpsButtonMain.classList.remove("gps-button-single");
                gpsButtonMain.classList.remove("gps-button-live-ori");
                gpsButtonMain.classList.remove("gps-button-live-pos-ori");
                gpsButtonMain.classList.add("gps-button-main");
                restartCamera();
            } else {
                // Start tracking
                scope._intervalIDPosOri = undefined;
                // Replace the main GPS button symbol with this button
                gpsButtonMain.classList.remove("gps-button-main");
                gpsButtonMain.classList.add("gps-button-live-pos-ori");
                // Hide GPS span
                gpsButtonLivePosOri.dispatchEvent(new Event("focusout"));
                // Get position and orientation
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        if (window.DeviceOrientationEvent) {
                            if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                                // iOS 13+
                                window.DeviceOrientationEvent.requestPermission()
                                    .then(permissionState => {
                                        if (permissionState === 'granted') {
                                            window.addEventListener('deviceorientation', function auxOrientation(ori) {
                                                // First fly (might take longer than timer)
                                                flyToLocationWithOrientation(position, ori, () => {
                                                    setTimeout(function () {
                                                        // One-time event
                                                        window.removeEventListener('deviceorientation', auxOrientation, false);
                                                        // Subsequently: Update camera every interval
                                                        scope._intervalIDOri = setInterval(function () {
                                                            navigator.geolocation.getCurrentPosition((position) => {
                                                                window.DeviceOrientationEvent.requestPermission()
                                                                    .then(permissionState => {
                                                                        if (permissionState === 'granted') {
                                                                            window.addEventListener('deviceorientation', function aux(ori) {
                                                                                flyToLocationWithOrientation(position, ori, () => {
                                                                                    window.removeEventListener('deviceorientation', aux, false);
                                                                                })
                                                                            }, false);
                                                                        } else {
                                                                            CitydbUtil.showAlertWindow("OK", "Error", "Could not access geolocation on this device.");
                                                                        }
                                                                    })
                                                                    .catch(error => {
                                                                        CitydbUtil.showAlertWindow("OK", "Error", error);
                                                                    });
                                                            }, showError);
                                                        }, scope._timerMiliseconds);
                                                    }, scope._timerMiliseconds);
                                                });
                                            }, false);
                                        } else {
                                            CitydbUtil.showAlertWindow("OK", "Error", "Could not access geolocation on this device.");
                                        }
                                    })
                                    .catch(error => {
                                        CitydbUtil.showAlertWindow("OK", "Error", error);
                                    });
                            } else {
                                // Other devices
                                window.addEventListener('deviceorientation', function auxOrientation(ori) {
                                    // First fly (might take longer than timer)
                                    flyToLocationWithOrientation(position, ori, () => {
                                        setTimeout(function () {
                                            // One-time event
                                            window.removeEventListener('deviceorientation', auxOrientation, false);
                                            // Subsequently: Update camera every interval
                                            scope._intervalIDOri = setInterval(function () {
                                                navigator.geolocation.getCurrentPosition((position) => {
                                                    window.addEventListener('deviceorientation', function aux(ori) {
                                                        flyToLocationWithOrientation(position, ori, () => {
                                                            window.removeEventListener('deviceorientation', aux, false);
                                                        })
                                                    }, false);
                                                }, showError);
                                            }, scope._timerMiliseconds);
                                        }, scope._timerMiliseconds);
                                    });
                                }, false);
                            }
                        } else {
                            CitydbUtil.showAlertWindow("OK", "Error", "Exact geolocation is not supported by this device.");
                        }
                    }, showError);
                } else {
                    CitydbUtil.showAlertWindow("OK", "Error", "Geolocation is not supported by this browser.");
                }
            }
        }

        // Disable tracking
        gpsButtonOff.onclick = function () {
            // Handle tracking
            if (scope._intervalIDOri) {
                // Disable tracking orientation (with fixed position)
                clearInterval(scope._intervalIDOri);
                scope._intervalIDOri = undefined;
            }
            if (scope._intervalIDPosOri) {
                // Disable tracking position and orientation
                clearInterval(scope._intervalIDPosOri);
                scope._intervalIDPosOri = undefined;
            }
            // Restore the main GPS button symbol
            gpsButtonMain.classList.remove("gps-button-single");
            gpsButtonMain.classList.remove("gps-button-live-ori");
            gpsButtonMain.classList.remove("gps-button-live-pos-ori");
            gpsButtonMain.classList.add("gps-button-main");
            // Hide GPS span
            gpsButtonOff.dispatchEvent(new Event("focusout"));

            restartCamera();
        }

        function flyToLocationWithOrientation(position, ori, callback) {
            let oriAlpha = 0;
            let oriBeta = 0;
            let oriGamma = 0;
            let oriHeight = 2;

            let angle = 0;
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

            // Change view if specified in URL
            const paraUrl = CitydbUtil.parse_query_string("viewMode", window.location.href);
            if (paraUrl) {
                switch (paraUrl.toLowerCase()) {
                    case "fpv":
                        // First person view
                        setFirstPersonView();
                        break;
                    case "debug":
                        // Debug view
                        setDebugView();
                        break;
                    default:
                        // Default view = first person view
                        setFirstPersonView();
                }
            } else {
                // Default view = first person view
                setFirstPersonView();
            }

            function setFirstPersonView() {
                if (!scope._firstPersonViewActivated) {
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
                duration: 0.75 * scope._timerMiliseconds / 1000,
                complete: function () {
                    scope._firstPersonViewActivated = true;
                    if (callback) {
                        callback();
                    }
                }
            });
        }

        function restartCamera() {
            const restartView = function (_callback) {
                scope._firstPersonViewActivated = false;
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

        if (scope._isMobile) {
            // remove home button
            const customHomeButton = customCesiumViewerToolbar.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];
            customCesiumViewerToolbar.removeChild(customHomeButton);

            // remove info button
            // var customInfoButton = customCesiumViewerToolbar.getElementsByClassName("cesium-navigationHelpButton-wrapper")[0];
            // customCesiumViewerToolbar.removeChild(customInfoButton);
        }
    }

    window.GPSController = GPSController;
})();
