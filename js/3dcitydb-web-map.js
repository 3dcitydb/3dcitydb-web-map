/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2017
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.gis.bgu.tum.de/
 *  
 * The 3DCityDB-Web-Map is jointly developed with the following
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
 * A Web-Map3DCityDB class to visualize Layer3DCityDB with Cesium.
 *
 * @alias Web-Map3DCityDB
 * @constructor
 *
 * @param {CesiumViewer} cesiumViewer
 */
(function () {
    function WebMap3DCityDB(cesiumViewer, createInfoTable) {
        this._cesiumViewerInstance = cesiumViewer;
        this._layers = [];
        this._mouseMoveEvents = false;
        this._mouseClickEvents = false;
        this._eventHandler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
        this._cameraEventAggregator = new Cesium.CameraEventAggregator(cesiumViewer.scene.canvas);

        this._highlightColor = Cesium.Color.AQUAMARINE;
        this._mouseOverHighlightColor = Cesium.Color.YELLOW;
        this._selectedEntity = new Cesium.Entity();
        this._prevHoveredColor = undefined;
        this._prevHoveredFeature = undefined;
        this._prevSelectedFeatures = [];
        this._prevSelectedColors = [];
        this._hiddenObjects = []; // kvps, with entry key = gmlid and value = feature

        this._activeLayer = undefined;
        Cesium.knockout.track(this, ['_activeLayer']);
    }

    Object.defineProperties(WebMap3DCityDB.prototype, {
        /**
         * Gets or sets the active layer
         * @memberof WebMap3DCityDB.prototype
         * @type {3DCityDBLayer}
         */
        activeLayer: {
            get: function () {
                return this._activeLayer;
            },
            set: function (value) {
                if (Cesium.defined(this._activeLayer)) {
                    if (this._activeLayer.layerId !== value.layerId) {
                        this._activeLayer = value;
                    }
                } else {
                    this._activeLayer = value;
                }
            }
        }
    });

    /**
     * Handle mouse events for different types of layers
     */
    WebMap3DCityDB.prototype.registerMouseEventHandlers = function (cesiumViewer) {
        const scope = this;
        const viewer = cesiumViewer;

        // For COLLADA/KML/glTF
        const colorBlendOptions = {
            colorBlendAmount: 0.7,
            colorBlendMode: Cesium.ColorBlendMode.MIX
        };

        // Get default left click handler for when a feature is not picked on left click
        const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);
                if (!Cesium.defined(pickedFeature)) return;
                const layer = scope.getLayerByObject(pickedFeature);

                // Do not change the highlighting if the mouse is still on the same feature
                if (Cesium.defined(scope._prevHoveredFeature) && layer.isEqual(scope._prevHoveredFeature, pickedFeature)) return;

                // Unhighlight previous feature
                if (Cesium.defined(scope._prevHoveredFeature)) {
                    // Only when not selected
                    try {
                        for (const l of scope._layers) {
                            if (!l.inArray(scope._prevSelectedFeatures, scope._prevHoveredFeature)) {
                                l.setColor(scope._prevHoveredFeature, scope._prevHoveredColor);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                        scope.clearSelectedObjects();
                    }
                }

                // Do not highlight if feature has been already selected before
                if (Cesium.defined(scope._prevSelectedFeatures) && layer.inArray(scope._prevSelectedFeatures, pickedFeature)) return;

                // Update references
                scope._prevHoveredFeature = pickedFeature;
                scope._prevHoveredColor = layer.getColor(pickedFeature);

                // Highlight the new feature
                try {
                    layer.setColor(pickedFeature, scope._mouseOverHighlightColor, colorBlendOptions);
                } catch (e) {
                    console.error(e);
                    scope.clearSelectedObjects();
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);
                if (!Cesium.defined(pickedFeature)) return;
                const layer = scope.getLayerByObject(pickedFeature);

                // Do not change the highlighting if the mouse is still on the same feature
                if (Cesium.defined(scope._prevHoveredFeature) && layer.isEqual(scope._prevHoveredFeature, pickedFeature)) return;

                // Unhighlight previous feature
                if (Cesium.defined(scope._prevHoveredFeature)) {
                    // Only when not selected
                    try {
                        for (const l of scope._layers) {
                            if (!l.inArray(scope._prevSelectedFeatures, scope._prevHoveredFeature)) {
                                l.setColor(scope._prevHoveredFeature, scope._prevHoveredColor);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                        scope.clearSelectedObjects();
                    }
                }

                // Do not highlight if feature has been already selected before
                if (Cesium.defined(scope._prevSelectedFeatures) && layer.inArray(scope._prevSelectedFeatures, pickedFeature)) return;

                // Update references
                scope._prevHoveredFeature = pickedFeature;
                scope._prevHoveredColor = layer.getColor(pickedFeature);

                // Highlight the new feature
                try {
                    layer.setColor(pickedFeature, scope._mouseOverHighlightColor, colorBlendOptions);
                } catch (e) {
                    console.error(e);
                    scope.clearSelectedObjects();
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE,
            Cesium.KeyboardEventModifier.CTRL
        );

        viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
                // Empty the selected list when a new object has been clicked
                if (scope._prevSelectedFeatures.length > 0) {
                    for (let i = 0; i < scope._prevSelectedFeatures.length; i++) {
                        const feature = scope._prevSelectedFeatures[i];
                        const featureLayer = scope.getLayerByObject(feature);
                        try {
                            featureLayer.setColor(feature, scope._prevSelectedColors[i]);
                        } catch (e) {
                            console.error(e);
                            scope.clearSelectedObjects();
                        }
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
                const layer = scope.getLayerByObject(pickedFeature);

                // Store the camera position for camera's flyTo
                layer.storeCameraPosition(viewer, movement, pickedFeature)

                // Do not highlight if already selected
                if (layer.inArray(scope._prevSelectedFeatures, pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(layer.getColor(scope._prevHoveredColor));

                // Highlight newly selected feature
                layer.setSelected(pickedFeature);
                try {
                    layer.setColor(pickedFeature, scope._highlightColor, colorBlendOptions);
                } catch (e) {
                    console.error(e);
                    scope.clearSelectedObjects();
                }

                // Store the camera position for camera's flyTo
                layer.storeCameraPosition(viewer, movement, viewer.selectedEntity);

                // Info table
                const entityContent = layer.getProperties(pickedFeature);
                layer._fnInfoTable([viewer.selectedEntity, entityContent], layer);
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
                const layer = scope.getLayerByObject(pickedFeature);

                // Store the camera position for camera's flyTo
                layer.storeCameraPosition(viewer, movement, pickedFeature)

                // Do not highlight if already selected
                if (layer.inArray(scope._prevSelectedFeatures, pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(layer.getColor(scope._prevHoveredColor));

                // Highlight newly selected feature
                layer.setSelected(pickedFeature);
                try {
                    layer.setColor(pickedFeature, scope._highlightColor, colorBlendOptions);
                } catch (e) {
                    console.error(e);
                    scope.clearSelectedObjects();
                }

                // Store the camera position for camera's flyTo
                layer.storeCameraPosition(viewer, movement, viewer.selectedEntity);
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK,
            Cesium.KeyboardEventModifier.CTRL
        );
    };

    /**
     * pass the object and modifier to the layer
     * @param {string} modifier
     * @param {Object} object
     */
    WebMap3DCityDB.prototype.passEventToLayer = function (modifier, object) {
        if (object) {
            var i = 0;
            if (Cesium.Cesium3DTileFeature && object instanceof Cesium.Cesium3DTileFeature) {
                var url = object.primitive.url;
                for (i = 0; i < this._layers.length; i++) {
                    if (this._layers[i].url == url) {
                        this._layers[i].triggerEvent(modifier, object);
                        return true;
                    }
                }
            } else {
                if (object.id && object.id.layerId) {
                    var layerId = object.id.layerId;
                    for (i = 0; i < this._layers.length; i++) {
                        if (this._layers[i].layerId === layerId) {
                            this._layers[i].triggerEvent(modifier, object);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    /**
     * adds a 3DCityDBLayer to the cesiumViewer
     * @param {3DCityDBLayer} layer
     */
    WebMap3DCityDB.prototype.addLayer = function (layer, fnInfoTable) {
        for (var i = 0; i < this._layers.length; i++) {
            if (layer.layerId === this._layers[i].layerId) {
                return;
            }
        }
        this._layers.push(layer);
        return layer.addToCesium(this._cesiumViewerInstance, this, fnInfoTable);
    };

    /**
     * get a 3DCityDBLayer with the specified id
     * @param {String} layerId
     * @returns {3DCityDBLayer} The 3DCityDBLayer with the provided id or null if the id did not exist.
     */
    WebMap3DCityDB.prototype.getLayerById = function (layerId) {
        for (var i = 0; i < this._layers.length; i++) {
            if (layerId === this._layers[i].layerId) {
                return this._layers[i];
            }
        }
        return null;
    };

    WebMap3DCityDB.prototype.getLayerByObject = function (object) {
        for (const layer of this._layers) {
            if (layer.contains(object)) return layer;
        }
        return null;
    };

    /**
     * @returns {Array.<3DCityDBLayer>} An array with 3dcitydb layer
     */
    WebMap3DCityDB.prototype.getLayers = function () {
        return this._layers;
    };

    /**
     * removes a 3DCityDBLayer from the cesiumViewer
     * @param {String} id
     */
    WebMap3DCityDB.prototype.removeLayer = function (layerId) {
        for (var i = 0; i < this._layers.length; i++) {
            var layer = this._layers[i];
            if (layerId === layer.layerId) {
                layer.removeFromCesium(this._cesiumViewerInstance);
                this._layers.splice(i, 1);
                return;
            }
        }
    };

    /**
     * Unhighlight all selected objects from all layers
     *
     */
    WebMap3DCityDB.prototype.clearSelectedObjects = function () {
        const scope = this;
        if (!Cesium.defined(scope._prevSelectedFeatures)) return;

        // Empty the selected list, similar to when a new object has been clicked
        if (scope._prevSelectedFeatures.length > 0) {
            for (let i = 0; i < scope._prevSelectedFeatures.length; i++) {
                const feature = scope._prevSelectedFeatures[i];
                const layer = scope.getLayerByObject(feature);
                try {
                    layer.setColor(feature, scope._prevSelectedColors[i]);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // For all layers
        scope._prevSelectedFeatures = [];
        scope._prevSelectedColors = [];
        scope._cesiumViewerInstance.selectedEntity = undefined;

        // Show hidden objects
        if (Cesium.defined(scope._hiddenObjects)) {
            scope.showHiddenObjects();
        }
    };

    /**
     * activates viewchanged Event
     * This event will be fired many times when the camera position or direction is changing
     * @param {Boolean} active
     */
    WebMap3DCityDB.prototype.activateViewChangedEvent = function (active) {
        var that = this;
        var cesiumWidget = this._cesiumViewerInstance.cesiumWidget;
        var camera = cesiumWidget.scene.camera;
        var posX = camera.position.x;
        var posY = camera.position.y;
        var posZ = camera.position.z;
        var dirX = camera.direction.x;
        var dirY = camera.direction.y;
        var dirZ = camera.direction.z;

        // tolerance
        var posD = 3;
        var dirD = 0.001;

        var listenerFunc = function () {
            var currentCamera = cesiumWidget.scene.camera;
            var _posX = currentCamera.position.x;
            var _posY = currentCamera.position.y;
            var _posZ = currentCamera.position.z;
            var _dirX = currentCamera.direction.x;
            var _dirY = currentCamera.direction.y;
            var _dirZ = currentCamera.direction.z;

            if (Math.abs(posX - _posX) > posD ||
                Math.abs(posY - _posY) > posD ||
                Math.abs(posZ - _posZ) > posD ||
                Math.abs(dirX - _dirX) > dirD ||
                Math.abs(dirY - _dirY) > dirD ||
                Math.abs(dirZ - _dirZ) > dirD) {
                console.log('view changed');
                posX = _posX;
                posY = _posY;
                posZ = _posZ;
                dirX = _dirX;
                dirY = _dirY;
                dirZ = _dirZ;
                for (var i = 0; i < that._layers.length; i++) {
                    that._layers[i].triggerEvent("VIEWCHANGED");
                }
            }
        };

        if (active) {
            cesiumWidget.clock.onTick.addEventListener(listenerFunc);
        }
    };

    /**
     * activates mouseClick Events over objects
     * @param {boolean} active
     */
    WebMap3DCityDB.prototype.activateMouseClickEvents = function (active) {
        if (active) {
            var that = this;
            this._eventHandler.setInputAction(function (event) {
                var object = that._cesiumViewerInstance.scene.pick(event.position);
                that.clearHighlight(object);
                that.passEventToLayer("CLICK", object);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this._eventHandler.setInputAction(function (event) {
                var object = that._cesiumViewerInstance.scene.pick(event.position);
                that.passEventToLayer("CTRLCLICK", object);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
        } else {
            this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
        }
        this._mouseClickEvents = active;
    };

    /**
     * activates mouseMove Events over objects
     * @param {Boolean} active
     */
    WebMap3DCityDB.prototype.activateMouseMoveEvents = function (active) {
        var pickingInProgress = false;
        var currentObject = null;
        if (active) {
            var that = this;
            this._eventHandler.setInputAction(function (event) {
                // When camera is moved do not trigger any other events
                if (that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.LEFT_DRAG) ||
                    that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.MIDDLE_DRAG) ||
                    that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.PINCH) ||
                    that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG) ||
                    that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.WHEEL)) {
                    return;
                }
                if (pickingInProgress)
                    return;
                pickingInProgress = true;
                var object = that._cesiumViewerInstance.scene.pick(event.endPosition);
                if (currentObject && currentObject != object) {
                    if (that.passEventToLayer("MOUSEOUT", currentObject)) {
                        currentObject = null;
                    }
                }
                if (object && currentObject != object) {
                    if (!that.passEventToLayer("MOUSEIN", object)) {
                        currentObject = null;
                    } else {
                        currentObject = object;
                    }
                }
                pickingInProgress = false;
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } else {
            if (currentObject !== null) {
                this.passEventToLayer("MOUSEOUT", currentObject);
                currentObject = null;
            }
            this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
        this._mouseMoveEvents = active;
    };

    /**
     * Return all highlighted features from all layers
     * @returns {Array}
     */
    WebMap3DCityDB.prototype.getAllHighlightedObjects = function () {
        const scope = this;
        if (!Cesium.defined(scope._prevSelectedFeatures)) return {};

        let results = {};
        for (const feature of scope._prevSelectedFeatures) {
            const layer = scope.getLayerByObject(feature);
            const res = layer.getIdObject(feature);
            results[res.key] = res.object;
        }

        return results;
    };

    /**
     * Return all hidden objects from all layers
     * @returns {Array}
     */
    WebMap3DCityDB.prototype.getAllHiddenObjects = function () {
        const scope = this;
        if (!Cesium.defined(scope._hiddenObjects)) return {};

        let results = {};
        for (const feature of scope._hiddenObjects) {
            const layer = scope.getLayerByObject(feature);
            const res = layer.getIdObject(feature);
            results[res.key] = res.object;
        }

        return results;
    };

    /**
     * Hide all selected objects from all layers
     */
    WebMap3DCityDB.prototype.hideSelectedObjects = function () {
        const scope = this;
        if (!Cesium.defined(scope._prevSelectedFeatures)) return;

        for (feature of scope._prevSelectedFeatures) {
            const layer = scope.getLayerByObject(feature);
            if (!layer.inArray(scope._hiddenObjects, feature)) {
                scope._hiddenObjects.push(feature);
            }
            layer.hideSelected(feature);
        }
    };

    /**
     * Show all hidden objects from all layers
     */
    WebMap3DCityDB.prototype.showHiddenObjects = function () {
        const scope = this;
        if (!Cesium.defined(scope._hiddenObjects)) return;

        for (const feature of scope._hiddenObjects) {
            const layer = scope.getLayerByObject(feature);
            layer.show(feature);
        }

        // For all layers
        scope._hiddenObjects = [];
    };

    window.WebMap3DCityDB = WebMap3DCityDB;
})();
