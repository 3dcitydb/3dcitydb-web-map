/*
 * 3DCityDB-Web-Map-Client
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2024
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
        this._timerMiliseconds = 1000; // track interval
        this._savedAlpha = undefined;
        this._firstPersonViewActivated = false;
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

        // Replace the 3D/2D button with this GPS button and its list elements
        const customCesiumViewerToolbar = document.getElementsByClassName("cesium-viewer-toolbar")[0];
        const customGlobeSpan = customCesiumViewerToolbar.getElementsByClassName("cesium-sceneModePicker-wrapper cesium-toolbar-button")[0];
        customCesiumViewerToolbar.replaceChild(gpsSpan, customGlobeSpan);

        // Show position and orientation snapshot
        gpsButtonSingle.onclick = async function () {
            // Replace the main GPS button symbol with this button
            setGPSButtonMain("gps-button-single");
            // Disable tracking
            clearTrackOri();
            clearTrackPosOri();
            // Hide GPS span
            gpsSpan.dispatchEvent(new Event("focusout"));
            // Get position and orientation
            try {
                // Handle iOS 13+ Device Orientation permission
                await requestAccess();
                // Get values
                const position = await getPosition();
                const orientation = await getOrientation();
                await flyToLocationWithOrientation(position, orientation);
            } catch (error) {
                CitydbUtil.showAlertWindow("OK", "Error", error);
            }
        }

        // Track orientation (with fixed position)
        gpsButtonLiveOri.onclick = async function () {
            // Handle tracking
            if (scope._intervalIDPosOri) {
                // Disable tracking position + orientation
                clearTrackPosOri();
            }
            if (scope._intervalIDOri) {
                // Already tracking -> disable tracking
                clearTrackOri();
                // Restore the main GPS button symbol
                restoreGPSButtonMain();
                // Bring the camera to normal angle
                restartCamera();
                return;
            }

            // Start tracking
            scope._intervalIDOri = undefined;
            // Replace the main GPS button symbol with this button
            setGPSButtonMain("gps-button-live-ori");
            // Hide GPS span
            gpsSpan.dispatchEvent(new Event("focusout"));
            // Get position and orientation
            try {
                // Handle iOS 13+ Device Orientation permission
                await requestAccess();
                // Get values
                const position = await getPosition();
                let orientation = await getOrientation();
                // First fly
                await flyToLocationWithOrientation(position, orientation);
                // Interval tracking for orientation
                scope._intervalIDOri = setInterval(async function () {
                    orientation = await getOrientation();
                    await flyToLocationWithOrientation(position, orientation);
                }, scope._timerMiliseconds);
            } catch (error) {
                CitydbUtil.showAlertWindow("OK", "Error", error);
            }
        }

        // Track position and orientation
        gpsButtonLivePosOri.onclick = async function () {
            // Handle tracking
            if (scope._intervalIDOri) {
                // Disable tracking orientation (with fixed position)
                clearTrackOri();
            }
            if (scope._intervalIDPosOri) {
                // Already tracking -> disable tracking
                clearTrackPosOri();
                // Restore the main GPS button symbol
                restoreGPSButtonMain();
                // Bring the camera to normal angle
                restartCamera();
                return;
            }

            // Start tracking
            scope._intervalIDPosOri = undefined;
            // Replace the main GPS button symbol with this button
            setGPSButtonMain("gps-button-live-pos-ori");
            // Hide GPS span
            gpsSpan.dispatchEvent(new Event("focusout"));
            // Get position and orientation
            try {
                // Handle iOS 13+ Device Orientation permission
                await requestAccess();
                // Get values
                let position = await getPosition();
                let orientation = await getOrientation();
                // First fly
                await flyToLocationWithOrientation(position, orientation);
                // Interval tracking for orientation
                scope._intervalIDPosOri = setInterval(async function () {
                    position = await getPosition();
                    orientation = await getOrientation();
                    await flyToLocationWithOrientation(position, orientation);
                }, scope._timerMiliseconds);
            } catch (error) {
                CitydbUtil.showAlertWindow("OK", "Error", error);
            }
        }

        // Disable tracking
        gpsButtonOff.onclick = function () {
            // Handle tracking
            if (scope._intervalIDOri) {
                // Disable tracking orientation (with fixed position)
                clearTrackOri();
            }
            if (scope._intervalIDPosOri) {
                // Disable tracking position and orientation
                clearTrackPosOri();
            }
            // Restore the main GPS button symbol
            restoreGPSButtonMain();
            // Hide GPS span
            gpsSpan.dispatchEvent(new Event("focusout"));
            // Bring the camera to normal angle
            restartCamera();
        }

        function setGPSButtonMain(className) {
            restoreGPSButtonMain();
            gpsButtonMain.classList.remove("gps-button-main");
            gpsButtonMain.classList.add(className);
        }

        function clearTrackOri() {
            clearInterval(scope._intervalIDOri);
            scope._intervalIDOri = undefined;
        }

        function clearTrackPosOri() {
            clearInterval(scope._intervalIDPosOri);
            scope._intervalIDPosOri = undefined;
        }

        function restoreGPSButtonMain() {
            gpsButtonMain.classList.remove("gps-button-single");
            gpsButtonMain.classList.remove("gps-button-live-ori");
            gpsButtonMain.classList.remove("gps-button-live-pos-ori");
            gpsButtonMain.classList.add("gps-button-main");
        }

        async function requestAccess() {
            if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                const permissionState = await DeviceOrientationEvent.requestPermission();
                if (permissionState !== 'granted') {
                    CitydbUtil.showAlertWindow("OK", "Error", "Orientation access denied.");
                    throw new Error('Orientation access denied.');
                }
            }
        }

        async function getOrientation() {
            return new Promise((resolve, reject) => {
                if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', resolve, {once: true});
                } else {
                    reject("Orientation not supported.");
                    CitydbUtil.showAlertWindow("OK", "Error", "Orientation not supported.");
                }
            });
        }

        async function getPosition() {
            return new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(resolve, (error) => {
                        let errorMsg;
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMsg = "User denied the request for Geolocation.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMsg = "Location information is unavailable.";
                                break;
                            case error.TIMEOUT:
                                errorMsg = "The request to get user location timed out.";
                                break;
                            case error.UNKNOWN_ERROR:
                            default:
                                errorMsg = "An unknown error occurred.";
                                break;
                        }
                        reject(errorMsg);
                        CitydbUtil.showAlertWindow("OK", "Error", errorMsg);
                    });
                } else {
                    reject("Geolocation not supported.");
                    CitydbUtil.showAlertWindow("OK", "Error", "Geolocation not supported.");
                }
            });
        }

        async function flyToLocationWithOrientation(position, ori) {
            return new Promise((resolve, reject) => {
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
                    const diffAngle = angle - scope._savedAlpha;
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

                // Fly to the location with orientation
                cesiumCamera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, oriHeight),
                    orientation: {
                        heading: oriAlpha,
                        pitch: oriBeta,
                        roll: oriGamma
                    },
                    duration: 0.9 * scope._timerMiliseconds / 1000,
                    complete: function () {
                        scope._firstPersonViewActivated = true;
                        resolve(); // Resolves the promise once the flyTo operation completes
                    },
                    cancel: function () {
                        reject('FlyTo operation was canceled.');
                    }
                });
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
                        pitch: Cesium.Math.toRadians(-45),
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
