/**
 * 
 * GPS Geolocation with device orientation in real-time
 */

(function () {
    /**constructor function**/
    function GPSController() {
        this.createGPSButton();
    }

    Object.defineProperties(GPSController.prototype, {
    });

    GPSController.prototype.createGPSButton = function () {
        var scope = this;

        var button = document.getElementById("gpsButton");
        button.style.display = "block";
        button.style.width = "32px";
        button.style.height = "32px";
        button.style.position = "absolute";
        button.style.top = "45px";
        button.style.right = "5px";
        button.style.backgroundImage = "url(images/GPS_off.png)";
        button.style.backgroundRepeat = "no-repeat";
        button.value = "OFF";
    }

    GPSController.prototype.getLocation = function () {
        var scope = this;

        var button = document.getElementById("gpsButton");
        if (button.value === "OFF") {
            button.value = "ON";
            button.style.backgroundImage = "url(images/GPS.png)";
            button.classList.remove('active');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            button.value = "OFF";
            button.style.backgroundImage = "url(images/GPS_off.png)";
        }

        function showPosition(position) {
            var repeat = setInterval(function () {
                if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', function auxOrientation(event) {
                        // one-time event
                        window.removeEventListener('deviceorientation', auxOrientation, false);

                        if (button.value === "ON") {
                            // alpha is the device angle around Oz axis
                            aux(position, event);
                        }else{
                            clearInterval(repeat);
                        }
                    }, false);
                } else {
                    aux(position, event);
                }
            }, 3000);
        }

        function aux(position, ori) {
            cesiumCamera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 2),
                orientation: {
                    // alpha is in [0,360) degrees, while heading is [-pi,pi), where positive points eastward
                    heading: (Cesium.defined(ori) && Cesium.defined(ori.alpha)) ?
                            (ori.alpha < 180 ? Cesium.Math.toRadians(-ori.alpha) : Cesium.Math.toRadians(180 - (ori.alpha - 180))) : Cesium.Math.toRadians(0),
                    pitch: (Cesium.defined(ori) && Cesium.defined(ori.beta)) ?
                            Cesium.Math.toRadians(ori.beta-90) : Cesium.Math.toRadians(0),
                    roll: Cesium.Math.toRadians(0)
                }
            });
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    showPopupInfoBoxWithTextContent("Error", "Geolocation denied by user.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    showPopupInfoBoxWithTextContent("Error", "Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    showPopupInfoBoxWithTextContent("Error", "Location request has timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    showPopupInfoBoxWithTextContent("Error", "An unknown error has occurred while requesting location information.");
                    break;
            }
        }
    }

    window.GPSController = GPSController;
})();
