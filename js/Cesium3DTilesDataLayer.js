/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2024
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 https://www.asg.ed.tum.de/en/gis
 * 
 * The 3DCityDB-Web-Map is jointly developed with the following
 * cooperation partners:
 * 
 * virtualcitySYSTEMS GmbH, Berlin <https://vc.systems/>
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

(function () {
    function Cesium3DTilesDataLayer(options) {

        var proxyUrl;
        if (location.host.indexOf('8000') > -1) {
            proxyUrl = '/proxy/'
        } else {
            proxyUrl = location.protocol + '//' + location.host + '/proxy/'
        }
        this._defaultProxy = new Cesium.DefaultProxy(proxyUrl)

        this._url = this.autofillUrl(options.url);
        this._name = options.name;
        this._id = Cesium.defaultValue(options.id, Cesium.createGuid());
        this._region = options.region;
        this._active = Cesium.defaultValue(options.active, true);
        this._cameraPosition = {};
        this._thematicDataUrl = Cesium.defaultValue(options.thematicDataUrl, "");
        this._thematicDataSource = Cesium.defaultValue(options.thematicDataSource, "");
        this._tableType = Cesium.defaultValue(options.tableType, "");
        var dataSourceControllerOptions = {};
        dataSourceControllerOptions.uri = this._thematicDataUrl;
        dataSourceControllerOptions.tableType = this._tableType;
        this._dataSourceController = new DataSourceController(this._thematicDataSource, signInController, dataSourceControllerOptions);
        this._cityobjectsJsonUrl = options.cityobjectsJsonUrl;
        this._thematicDataProvider = Cesium.defaultValue(options.thematicDataProvider, "");
        this._maximumScreenSpaceError = Cesium.defaultValue(options.maximumScreenSpaceError, "");
        this._cesiumViewer = undefined;
        this._tileset = undefined;

        this._highlightColor = Cesium.Color.AQUAMARINE;
        this._mouseOverHighlightColor = Cesium.Color.YELLOW;
        this._selectedEntity = new Cesium.Entity();
        this._prevHoveredColor = undefined;
        this._prevHoveredFeature = undefined;
        this._prevSelectedFeatures = [];
        this._prevSelectedColors = [];
        this._hiddenObjects = []; // kvps, with entry key = gmlid and value = feature

        this._layerDataType = options.layerDataType;

        this._fnInfoTable = undefined;

        this._configParameters = {
            "id": this.id,
            "name": this.name,
            "url": this.url,
            "layerDataType": this.layerDataType,
            "thematicDataUrl": this.thematicDataUrl,
            "thematicDataProvider": this._thematicDataProvider,
            "maximumScreenSpaceError": this._maximumScreenSpaceError
        };

        /**
         * handles ClickEvents
         */
        this._clickEvent = new Cesium.Event();

        this._ctrlClickEvent = new Cesium.Event();

        /**
         * handles ClickEvents
         */
        this._mouseInEvent = new Cesium.Event();

        /**
         * handles ClickEvents
         */
        this._mouseOutEvent = new Cesium.Event();

        this._viewChangedEvent = new Cesium.Event();

        Cesium.knockout.track(this, ['_prevSelectedFeatures', '_hiddenObjects']);
    }

    Object.defineProperties(Cesium3DTilesDataLayer.prototype, {
        /**
         * Gets the active
         */
        active: {
            get: function () {
                return this._active;
            }
        },
        /**
         * Gets/Sets the CameraPosition.
         */
        cameraPosition: {
            get: function () {
                return this._cameraPosition;
            },
            set: function (value) {
                this._cameraPosition = value;
            }
        },
        /**
         * Gets the url of the datasource
         */
        url: {
            get: function () {
                return this._url;
            },
            set: function (value) {
                this._url = value;
            }
        },
        /**
         * Gets the name of this datasource.
         */
        name: {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            }
        },
        /**
         * Gets the id of this datasource, the id should be unique.
         */
        id: {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            }
        },
        /**
         * Gets boundingbox of this layer as an Cesium Rectangle Object with longitude/latitude values in radians.
         */
        region: {
            get: function () {
                return this._region;
            }
        },

        thematicDataUrl: {
            get: function () {
                return this._thematicDataUrl;
            },
            set: function (value) {
                this._thematicDataUrl = value;
            }
        },

        thematicDataSource: {
            get: function () {
                return this._thematicDataSource;
            },
            set: function (value) {
                this._thematicDataSource = value;
            }
        },

        dataSourceController: {
            get: function () {
                return this._dataSourceController;
            },
            set: function (value) {
                this._dataSourceController = value;
            }
        },

        tableType: {
            get: function () {
                return this._tableType;
            },
            set: function (value) {
                this._tableType = value;
            }
        },

        thematicDataProvider: {
            get: function () {
                return this._thematicDataProvider;
            },
            set: function (value) {
                this._thematicDataProvider = value;
            }
        },

        cityobjectsJsonUrl: {
            get: function () {
                return this._cityobjectsJsonUrl;
            },
            set: function (value) {
                this._cityobjectsJsonUrl = value;
            }
        },

        highlightColor: {
            get: function () {
                return this._highlightColor;
            },
            set: function (value) {
                this._highlightColor = value;
            }
        },

        mouseOverHighlightColor: {
            get: function () {
                return this._mouseOverHighlightColor;
            },
            set: function (value) {
                this._mouseOverHighlightColor = value;
            }
        },

        layerDataType: {
            get: function () {
                return this._layerDataType;
            },
            set: function (value) {
                this._layerDataType = value;
            }
        },

        fnInfoTable: {
            get: function () {
                return this._fnInfoTable;
            },
            set: function (value) {
                this._fnInfoTable = value;
            }
        },

        configParameters: {
            get: function () {
                return this._configParameters;
            }
        },

        maximumScreenSpaceError: {
            get: function () {
                return this._maximumScreenSpaceError;
            },
            set: function (value) {
                this._maximumScreenSpaceError = value;
            }
        }
    });

    /**
     * Automatically add `tileset.json` in Cesium 3D Tiles URL if no file is given
     *
     * @param strUrl
     * @returns {*}
     */
    Cesium3DTilesDataLayer.prototype.autofillUrl = function (strUrl) {
        var scope = this;

        if (['json'].indexOf(CitydbUtil.get_suffix_from_filename(strUrl)) > -1) {
            return strUrl;
        } else {
            return strUrl + ((strUrl.charAt(strUrl.length - 1) === "/" || strUrl.charAt(strUrl.length - 1) === "\\") ? "" : "/") + "tileset.json";
        }
    }

    /**
     * adds this layer to the given Cesium viewer
     * @param {CesiumViewer} cesiumViewer
     */
    Cesium3DTilesDataLayer.prototype.addToCesium = function (cesiumViewer, fnInfoTable) {
        var scope = this;
        this._cesiumViewer = cesiumViewer;
        this._fnInfoTable = fnInfoTable;
        var deferred = Cesium.defer();

        Cesium.Cesium3DTileset.fromUrl(scope.autofillUrl(scope._url), {
            maximumScreenSpaceError: this._maximumScreenSpaceError
        }).then(function (tileset) {
            scope._tileset = tileset;
            scope._cesiumViewer.sceneprimitives.add(tileset);
            scope._tileset.show = scope._active;
            scope.configPointCloudShading(tileset);
            scope.registerTilesLoadedEventHandler();
            scope.registerMouseEventHandlers();
            deferred.resolve();
        }, function () {
            deferred.reject(new Cesium.DeveloperError('Failed to load: ' + scope._url));
        });

        return deferred.promise;
    }

    Cesium3DTilesDataLayer.prototype.configPointCloudShading = function (tileset) {
        tileset.pointCloudShading.attenuation = true;
        tileset.pointCloudShading.maximumAttenuation = 3;
        tileset.pointCloudShading.eyeDomeLighting = true;
        tileset.pointCloudShading.eyeDomeLightingStrength = 0.5;
        tileset.pointCloudShading.eyeDomeLightingRadius = 0.5;
    }

    Cesium3DTilesDataLayer.prototype.registerTilesLoadedEventHandler = function () {
        var scope = this;
        var timer = null;
        scope._tileset.tileVisible.addEventListener(function (tile) {
            if (tile._content instanceof Cesium.Cesium3DTilePointFeature) {
                tile._content._pointCloud._pointSize = 3;
            }
            if (!(tile._content instanceof Cesium.Cesium3DTileContent))
                return;
            var features = tile._content._features;
            var featuresLength = tile._content.featuresLength;
            for (var k = 0; k < featuresLength; k++) {
                if (Cesium.defined(features)) {
                    var feature = features[k];

                    var featureArray = feature._content._features;
                    if (!Cesium.defined(featureArray))
                        return;

                    if (scope.isInHighlightedList(feature) && !Cesium.Color.equals(feature.color, scope._highlightColor)) {
                        feature.color = scope._highlightColor;
                    }

                    if (!scope.isInHighlightedList(objectId) && Cesium.Color.equals(feature.color, scope._highlightColor)) {
                        const i = scope._prevSelectedFeatures.indexOf(feature);
                        feature.color = scope._prevSelectedColors[i];
                        scope._prevSelectedFeatures.splice(i, 1);
                        scope._prevSelectedColors.splice(i, 1);
                    }

                    feature.show = !scope._hiddenObjects.includes(feature);
                }
            }
        });
    }

    Cesium3DTilesDataLayer.prototype.registerMouseEventHandlers = function () {
        let scope = this;
        const viewer = scope._cesiumViewer;

        // Get default left click handler for when a feature is not picked on left click
        const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        function isEqual(feature1, feature2) {
            return feature1._batchId === feature2._batchId;
        }

        function storeCameraPosition(viewer, movement, feature) {
            const cartesian = viewer.scene.pickPosition(movement.position);
            let destination = Cesium.Cartographic.fromCartesian(cartesian);
            const boundingSphere = new Cesium.BoundingSphere(
                Cesium.Cartographic.toCartesian(destination),
                viewer.camera.positionCartographic.height
            );
            const orientation = {
                heading: viewer.camera.heading,
                pitch: viewer.camera.pitch,
                roll: viewer.camera.roll
            }
            feature._storedBoundingSphere = boundingSphere;
            feature._storedOrientation = orientation;
        }

        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);
                if (!Cesium.defined(pickedFeature)) return;

                // Do not change the highlighting if the mouse is still on the same feature
                if (Cesium.defined(scope._prevHoveredFeature) && isEqual(scope._prevHoveredFeature, pickedFeature)) return;

                // Unhighlight previous feature
                if (Cesium.defined(scope._prevHoveredFeature)) {
                    // Only when not selected
                    if (!scope._prevSelectedFeatures.includes(scope._prevHoveredFeature)) {
                        scope._prevHoveredFeature.color = scope._prevHoveredColor;
                    }
                }

                // Do not highlight if feature has been already selected before
                if (Cesium.defined(scope._prevSelectedFeatures) && scope._prevSelectedFeatures.includes(pickedFeature)) return;

                // Update references
                scope._prevHoveredFeature = pickedFeature;
                scope._prevHoveredColor = pickedFeature.color;

                // Highlight the new feature
                pickedFeature.color = scope._mouseOverHighlightColor;
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
                // Empty the selected list when a new object has been clicked
                if (scope._prevSelectedFeatures.length > 0) {
                    for (let i = 0; i < scope._prevSelectedFeatures.length; i++) {
                        scope._prevSelectedFeatures[i].color = scope._prevSelectedColors[i]
                    }
                    scope._prevSelectedFeatures = [];
                    scope._prevSelectedColors = [];
                }

                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(pickedFeature)) {
                    clickHandler(movement);
                    return;
                }

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, pickedFeature)

                // Do not highlight if already selected
                if (scope._prevSelectedFeatures.includes(pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(scope._prevHoveredColor);

                // Highlight newly selected feature
                viewer.selectedEntity = scope._selectedEntity;
                pickedFeature.color = scope._highlightColor;

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, scope._selectedEntity);

                // Info table
                let entityContent = {};
                const propertyIds = pickedFeature.getPropertyIds();
                for (let i = 0; i < propertyIds.length; i++) {
                    const key = propertyIds[i];
                    entityContent[key] = pickedFeature.getProperty(key);
                }
                scope._fnInfoTable([scope._selectedEntity, entityContent], scope);
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        viewer.screenSpaceEventHandler.setInputAction(function onCtrlLeftClick(movement) {
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(pickedFeature)) {
                    clickHandler(movement);
                    return;
                }

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, pickedFeature)

                // Do not highlight if already selected
                if (scope._prevSelectedFeatures.includes(pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(scope._prevHoveredColor);

                // Highlight newly selected feature
                viewer.selectedEntity = scope._selectedEntity;
                pickedFeature.color = scope._highlightColor;

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, scope._selectedEntity);
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK,
            Cesium.KeyboardEventModifier.CTRL
        );
    }

    Cesium3DTilesDataLayer.prototype.zoomToStartPosition = function () {
        this._cesiumViewer.scene.camera.flyToBoundingSphere(this._tileset.boundingSphere);
    }

    /**
     * adds this layer to the given cesium viewer
     * @param {CesiumViewer} cesiumViewer
     */
    Cesium3DTilesDataLayer.prototype.removeFromCesium = function (cesiumViewer) {
        this.activate(false);
    }

    /**
     * activates the lay
     * @param {Boolean} value
     */
    Cesium3DTilesDataLayer.prototype.activate = function (active) {
        this._tileset.show = active;
        this._active = active;
    }

    /**
     * deactivates the layer
     * @param undefined
     */
    Cesium3DTilesDataLayer.prototype.reActivate = function () {
        const scope = this;
        const deferred = Cesium.defer();
        scope._prevSelectedFeatures = [];
        scope._prevSelectedColors = [];
        scope._prevHoveredFeature = undefined;
        scope._prevHoveredColor = undefined;
        scope._hiddenObjects = [];
        scope._cesiumViewer.scene.primitives.remove(this._tileset);

        Cesium.Cesium3DTileset.fromUrl(scope.autofillUrl(scope._url), {
            maximumScreenSpaceError: this._maximumScreenSpaceError
        }).then(function (tileset) {
            scope._tileset = tileset;
            scope._cesiumViewer.scene.primitives.add(tileset);
            scope.configPointCloudShading(tileset);
            scope.registerTilesLoadedEventHandler();
            deferred.resolve();
        }, function () {
            deferred.reject(new Cesium.DeveloperError('Failed to load: ' + scope._url));
        });

        return deferred.promise;
    }

    /**
     * highlights one or more object with a given color;
     */
    Cesium3DTilesDataLayer.prototype.highlight = function (toHighlightFeatures) {
        let scope = this;
        for (let feature of toHighlightFeatures) {
            scope._prevSelectedFeatures.push(feature);
            scope._prevSelectedColors.push(feature.color);
            feature.color = scope._highlightColor;
        }
    }

    Cesium3DTilesDataLayer.prototype.hideObjects = function (toHideFeatures) {
        let scope = this;
        if (!Cesium.defined(scope._hiddenObjects)) return;
        for (let feature of toHideFeatures) {
            if (!scope._hiddenObjects.includes(feature)) {
                scope._hiddenObjects.push(feature);
            }
            feature.show = false;
        }
    }

    Cesium3DTilesDataLayer.prototype.hideSelected = function () {
        this.hideObjects(this._prevSelectedFeatures);
    }

    Cesium3DTilesDataLayer.prototype.showAllObjects = function () {
        let scope = this;
        for (let feature of scope._hiddenObjects) {
            feature.show = true;
        }
        scope._hiddenObjects = [];
    };

    Cesium3DTilesDataLayer.prototype.unHighlightAllObjects = function () {
        let scope = this;
        for (let i = 0; i < scope._prevSelectedFeatures.length; i++) {
            let feature = scope._prevSelectedFeatures[i];
            feature.color = scope._prevSelectedColors[i];
        }
        scope._prevSelectedFeatures = [];
    };

    Cesium3DTilesDataLayer.prototype.isInHighlightedList = function (feature) {
        return this._prevSelectedFeatures.includes(feature);
    };

    Cesium3DTilesDataLayer.prototype.getAllHighlightedObjects = function () {
        let scope = this;
        let result = {};
        for (let feature of scope._prevSelectedFeatures) {
            const gmlid = feature.getProperty("gml:id");
            result[gmlid] = feature;
        }
        return result;
    };

    Cesium3DTilesDataLayer.prototype.getAllHiddenObjects = function () {
        let scope = this;
        let result = {};
        if (!Cesium.defined(scope._hiddenObjects)) return;
        for (let feature of scope._hiddenObjects) {
            const gmlid = feature.getProperty("gml:id");
            result[gmlid] = feature;
        }
        return result;
    };

    /**
     * removes an Eventhandler
     * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
     */
    Cesium3DTilesDataLayer.prototype.removeEventHandler = function (event, callback) {
        if (event == "CLICK") {
            this._clickEvent.removeEventListener(callback, this);
        } else if (event == "CTRLCLICK") {
            this._ctrlClickEvent.removeEventListener(callback, this);
        } else if (event == "MOUSEIN") {
            this._mouseInEvent.removeEventListener(callback, this);
        } else if (event == "MOUSEOUT") {
            this._mouseOutEvent.removeEventListener(callback, this);
        } else if (event == "VIEWCHANGED") {
            this._viewChangedEvent.removeEventListener(callback, this);
        }
    }

    /**
     * adds an Eventhandler
     * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
     * @return {String} id of the event Handler, can be used to remove the event Handler
     */
    Cesium3DTilesDataLayer.prototype.registerEventHandler = function (event, callback) {
        if (event == "CLICK") {
            this._clickEvent.addEventListener(callback, this);
        } else if (event == "CTRLCLICK") {
            this._ctrlClickEvent.addEventListener(callback, this)
        } else if (event == "MOUSEIN") {
            this._mouseInEvent.addEventListener(callback, this);
        } else if (event == "MOUSEOUT") {
            this._mouseOutEvent.addEventListener(callback, this);
        } else if (event == "VIEWCHANGED") {
            this._viewChangedEvent.addEventListener(callback, this);
        }
    }

    /**
     * triggers an Event
     * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
     * @param {*} arguments, any number of arguments
     */
    Cesium3DTilesDataLayer.prototype.triggerEvent = function (event, object) {
        if (event == "CLICK") {
            this._clickEvent.raiseEvent(object);
        } else if (event == "CTRLCLICK") {
            this._ctrlClickEvent.raiseEvent(object);
        } else if (event == "MOUSEIN") {
            this._mouseInEvent.raiseEvent(object);
        } else if (event == "MOUSEOUT") {
            this._mouseOutEvent.raiseEvent(object);
        } else if (event == "VIEWCHANGED") {
            this._viewChangedEvent.raiseEvent(object);
        }
    }
    window.Cesium3DTilesDataLayer = Cesium3DTilesDataLayer;
})();

