/**
 * @constructor
 * 
 */
(function () {
    /**constructor function**/
    function SigninController(clientID) {
        window.onGoogleScriptLoad = () => {
            console.log('gapi loaded');
        }

        this._signInButtonId = "signInButton";

        var scope = this;
        createLoginButton(scope);
        function createLoginButton(scope) {
            var customCesiumViewerToolbar = document.getElementsByClassName("cesium-viewer-toolbar")[0];

            if (Cesium.defined(customCesiumViewerToolbar)) {
                // create log in button
                var anchorButton = customCesiumViewerToolbar.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];
                if (!anchorButton) {
                    anchorButton = customCesiumViewerToolbar.getElementsByClassName("cesium-button cesium-toolbar-button tracking-deactivated")[0];
                }
                var signInButton = document.createElement("BUTTON");
                signInButton.id = scope._signInButtonId;
                signInButton.innerHTML = "&#x1f511;";
                signInButton.style.fontSize = "medium";
                signInButton.title = "Click to log in";
                signInButton.style.color = "#edffff";
                signInButton.style.fontWeight = "bold";
                signInButton.className = "cesium-button cesium-toolbar-button";
                signInButton.onclick = function () {
                    scope.signIn(function () {

                    }, function () {
                        console.log("Error occurs")
                    });
                }
                customCesiumViewerToolbar.insertBefore(signInButton, anchorButton);
            } else {
                setTimeout(createLoginButton, 100);
            }
        }

        this._signInButton = document.getElementById(this._signInButtonId);
        this._userName = undefined;
        this._accessToken = undefined;
        this._cloudService = undefined;
        this._clientID = clientID;
        this._authConfig = {
            'client_id': this._clientID,
            'scope': ['https://spreadsheets.google.com/feeds',
                'https://docs.google.com/feeds',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.appdata',
                'https://www.googleapis.com/auth/drive.apps.readonly',
                'https://docs.googleusercontent.com/',
                'https://www.googleapis.com/auth/fusiontables',
                'https://www.googleapis.com/auth/fusiontables.readonly',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        };
    }

    Object.defineProperties(SigninController.prototype, {
        signInButton: {
            get: function () {
                return this._signInButton;
            }
        },
        signInStatusPanel: {
            get: function () {
                return this._signInStatusPanel;
            }
        },
        accessToken: {
            get: function () {
                return this._accessToken;
            }
        },
        userName: {
            get: function () {
                return this._userName;
            }
        },
        cloudService: {
            get: function () {
                if (!Cesium.defined(this._cloudService)) {
                    this._cloudService = new google.gdata.client.GoogleService('wise', 'TUIGG-GBALLOON-v1.0');
                }
                return this._cloudService;
            }
        },
        clientID: {
            get: function () {
                return this._clientID;
            }
        }
    });

    /**public functions**/
    SigninController.prototype.isSignIn = function () {
        return Cesium.defined(this._accessToken);
    }

    SigninController.prototype.signIn = function (successCallback, errorCallback) {
        var scope = this;
        if (!this.isSignIn()) {
            gapiAuth().then(function (result) {
                updateUserName(scope, result[0]);
                updateAccessToken(scope, result[1]);

                var signInButton = document.getElementById(scope._signInButtonId);
                if (scope._userName) {
                    var preferred_username_initials = shortenName(scope._userName);
                    signInButton.innerHTML = preferred_username_initials;
                    signInButton.style.fontSize = "small";
                    CitydbUtil.showAlertWindow('OK', 'Welcome', 'Welcome' + (scope._userName ? (", " + scope._userName) : "") + '!');
                } else {
                    signInButton.innerHTML = "&#x1f513;";
                    signInButton.style.fontSize = "medium";
                }
                signInButton.style.color = "yellow";
                signInButton.style.textAlign = "center";
                signInButton.title = "Click to log out";

                if (successCallback instanceof Function) {
                    successCallback.call();
                }
            }).otherwise(function (error) {
                if (errorCallback instanceof Function) {
                    errorCallback.call(error);
                }
            });
        } else { // sign out
            CitydbUtil.showAlertWindow('OK', 'Goodbye', 'Logout complete! GoodBye, ' + scope._userName + '!');
            gapi.auth.setToken(null);
            gapi.auth.signOut();
            updateUserName(scope, undefined);
            updateAccessToken(scope, undefined);

            var signInButton = document.getElementById(scope._signInButtonId);
            signInButton.title = "Click to log in";
            signInButton.innerHTML = "&#x1f511;";
            signInButton.style.fontSize = "medium";
            signInButton.style.color = "yellow";
            signInButton.style.textAlign = "center";
        }

        function gapiAuth() {
            var deferred = Cesium.when.defer();
            var func;
            // observer, checking loading gapi.auth... 
            func = setInterval(function () {
                if (typeof gapi.auth != 'undefined') {
                    gapi.auth.authorize(scope._authConfig, function () {
                        var accessToken = gapi.auth.getToken().access_token;
                        jQuery.noConflict().ajax({
                            url: 'https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=' + accessToken,
                            dataType: "json",
                            success: function (data, status) {
                                var username = data.name
                                deferred.resolve([username, accessToken]);
                            },
                            error: function (XHR, textStatus, errorThrown) {
                                deferred.reject([XHR, textStatus, errorThrown]);
                            }
                        });
                    });
                    clearInterval(func);
                } else {
                    console.log("gapi.auth is still loading now..");
                }
            }, 100);
            return deferred;
        }

        function updateUserName(_scope, userName) {
            _scope._userName = userName;
        }

        function updateAccessToken(_scope, accessToken) {
            _scope._accessToken = accessToken;
        }

        function shortenName(username) {
            if (username) {
                var ss = username.split(/[.,; -]/);
                var result = "";
                for (var i = 0; i < ss.length; i++) {
                    result += ss[i].charAt(0).toUpperCase();
                }
                return result;
            }
        }
    }

    window.SigninController = SigninController;
})();

