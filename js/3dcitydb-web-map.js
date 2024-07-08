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
                    if (this._activeLayer.id != value.id) {
                        this._activeLayer = value;
                    }
                } else {
                    this._activeLayer = value;
                }
            }
        }
    });

    /**
     * Compare two features from all layers
     */
    WebMap3DCityDB.prototype.isEqual = function (feature1, feature2) {
        if (!Cesium.defined(feature1) || !Cesium.defined(feature2)) return false;

        // Cesium 3D Tiles and i3s
        if ((feature1 instanceof Cesium.Cesium3DTileFeature) && (feature2 instanceof Cesium.Cesium3DTileFeature)) {
            return feature1._batchId === feature2._batchId;
        }

        // COLLADA/KML/glTF and GeoJSON
        if (Cesium.defined(feature1.id) && Cesium.defined(feature2.id)) {
            return feature1.id.id === feature2.id.id;
        }

        return false;
    }

    /**
     * Check whether an element is in an array for all layers
     */
    WebMap3DCityDB.prototype.includes = function (array, ele) {
        const scope = this;
        for (i of array) {
            if (scope.isEqual(i, ele)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the original color / color options of a given feature
     */
    WebMap3DCityDB.prototype.getColor = function (feature) {
        if (!Cesium.defined(feature)) return undefined;

        // Cesium 3D Tiles and i3s
        if (feature instanceof Cesium.Cesium3DTileFeature) {
            return feature.color;
        }

        if (Cesium.defined(feature.id)) {
            if (Cesium.defined(feature.id.kml)) {
                // COLLADA/KML/glTF
                return {
                    color: feature.detail.model.color,
                    colorBlendAmount: feature.detail.model.colorBlendAmount,
                    colorBlendMode: feature.detail.model.colorBlendMode
                };
            } else {
                // GeoJSON
                return feature.id.polygon.material;
            }
        }

        // Color
        if (feature instanceof Cesium.Color) {
            return Cesium.clone(feature);
        }

        // ColorMaterialProperty
        if (feature instanceof Cesium.ColorMaterialProperty) {
            return feature;
        }

        // Color blend options
        if (Cesium.defined(feature.color)
            && Cesium.defined(feature.colorBlendAmount)
            && Cesium.defined(feature.colorBlendAmount)) {
            return {
                color: Cesium.clone(feature.color),
                colorBlendAmount: feature.colorBlendAmount,
                colorBlendMode: feature.colorBlendMode
            };
        }

        return undefined;
    }

    /**
     * Set color / color options for a given feature
     */
    WebMap3DCityDB.prototype.setColor = function (feature, colorOrFeature, colorOptions = {}) {
        const scope = this;
        if (!Cesium.defined(feature)) return;

        // Cesium 3D Tiles and i3s
        if (feature instanceof Cesium.Cesium3DTileFeature) {
            if (!Cesium.defined(colorOrFeature)) {
                feature.color = undefined;
            } else if (colorOrFeature instanceof Cesium.Color) {
                feature.color = colorOrFeature;
            } else {
                feature.color = scope.getColor(colorOrFeature);
            }
            return;
        }

        if (Cesium.defined(feature.id)) {
            if (Cesium.defined(feature.id.kml)) {
                // COLLADA/KML/glTF
                if (!Cesium.defined(colorOrFeature)) {
                    feature.id.model.color = undefined;
                } else if (colorOrFeature instanceof Cesium.Color) {
                    feature.id.model.color = scope.getColor(colorOrFeature);
                    if (Cesium.defined(colorOptions.colorBlendAmount)) {
                        feature.id.model.colorBlendAmount = colorOptions.colorBlendAmount;
                    }
                    if (Cesium.defined(colorOptions.colorBlendMode)) {
                        feature.id.model.colorBlendMode = colorOptions.colorBlendMode;
                    }
                } else if (Cesium.defined(colorOrFeature.color)
                    && Cesium.defined(colorOrFeature.colorBlendAmount)
                    && Cesium.defined(colorOrFeature.colorBlendMode)) {
                    feature.id.model.color = scope.getColor(colorOrFeature.color);
                    if (Cesium.defined(colorOptions.colorBlendAmount)) {
                        feature.id.model.colorBlendAmount = colorOptions.colorBlendAmount;
                    } else {
                        feature.id.model.colorBlendAmount = colorOrFeature.colorBlendAmount;
                    }
                    if (Cesium.defined(colorOptions.colorBlendMode)) {
                        feature.id.model.colorBlendMode = colorOptions.colorBlendMode;
                    } else {
                        feature.id.model.colorBlendMode = colorOrFeature.colorBlendMode;
                    }
                } else {
                    const colorObj = scope.getColor(colorOrFeature);
                    scope.setColor(feature, colorObj, colorOptions);
                }
            } else {
                // GeoJSON
                if (!Cesium.defined(colorOrFeature)) {
                    feature.id.polygon.material = undefined;
                } else if (colorOrFeature instanceof Cesium.Color) {
                    feature.id.polygon.material = new Cesium.ColorMaterialProperty(colorOrFeature);
                } else if (colorOrFeature instanceof Cesium.ColorMaterialProperty) {
                    feature.id.polygon.material = colorOrFeature;
                } else {
                    feature.id.polygon.material = scope.getColor(colorOrFeature);
                }
            }
        }
    }

    /**
     * Handle mouse events for different types of layers
     */
    WebMap3DCityDB.prototype.registerMouseEventHandlers = function (curLayer, cesiumViewer) {
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

        function storeCameraPosition(viewer, movement, feature) {
            const cartesian = viewer.scene.pickPosition(movement.position);
            let destination = Cesium.Cartographic.fromCartesian(cartesian);
            const boundingSphere = new Cesium.BoundingSphere(
                Cesium.Cartographic.toCartesian(destination),
                //viewer.camera.positionCartographic.height
                40
            );
            const orientation = {
                heading: viewer.camera.heading,
                pitch: viewer.camera.pitch,
                roll: viewer.camera.roll
            };

            if (feature instanceof Cesium.Cesium3DTileFeature) {
                // Cesium 3D Tiles and i3s
                feature._storedBoundingSphere = boundingSphere;
                feature._storedOrientation = orientation;
            } else if (Cesium.defined(feature.id)) {
                // // COLLADA/KML/glTF and GeoJSON
                feature.id._storedBoundingSphere = boundingSphere;
                feature.id._storedOrientation = orientation;
            }
        }

        function setSelected(feature) {
            if (!Cesium.defined(feature)) return;

            if (feature instanceof Cesium.Cesium3DTileFeature) {
                // Cesium 3D Tiles and i3s
                viewer.selectedEntity = curLayer._selectedEntity;
            } else if (Cesium.defined(feature.id)) {
                if (Cesium.defined(feature.id.kml)) {
                    // COLLADA/KML/glTF
                    viewer.selectedEntity = feature.id;
                } else {
                    // GeoJSON
                    viewer.selectedEntity = curLayer._selectedEntity;
                }
            }
        }

        function getProperties(feature) {
            let entityContent = {};

            // Cesium 3D Tiles and i3s
            if (feature instanceof Cesium.Cesium3DTileFeature) {
                const propertyIds = feature.getPropertyIds();
                for (let i = 0; i < propertyIds.length; i++) {
                    const key = propertyIds[i];
                    entityContent[key] = feature.getProperty(key);
                }
                return entityContent;
            }

            // COLLADA/KML/glTF and GeoJSON
            if (Cesium.defined(feature.id)) {
                const entity = feature.id;
                entityContent["gmlid"] = entity.id;
                // Remove prefix COLLADA_ from ID
                const idPrefix = "COLLADA_";
                if (entityContent["gmlid"].startsWith(idPrefix)) {
                    entityContent["gmlid"] = entityContent["gmlid"].replace(idPrefix, "");
                }
                // Store other properties embedded in the feature
                const properties = entity._properties;
                if (Cesium.defined(properties)) {
                    const propertyIds = properties._propertyNames;
                    for (let i = 0; i < propertyIds.length; i++) {
                        const key = propertyIds[i];
                        entityContent[key] = properties[key]._value;
                    }
                }
                return entityContent;
            }
        }

        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);
                if (!Cesium.defined(pickedFeature)) return;

                // Do not change the highlighting if the mouse is still on the same feature
                if (Cesium.defined(scope._prevHoveredFeature) && scope.isEqual(scope._prevHoveredFeature, pickedFeature)) return;

                // Unhighlight previous feature
                if (Cesium.defined(scope._prevHoveredFeature)) {
                    // Only when not selected
                    if (!scope.includes(scope._prevSelectedFeatures, scope._prevHoveredFeature)) {
                        scope.setColor(scope._prevHoveredFeature, scope._prevHoveredColor);
                    }
                }

                // Do not highlight if feature has been already selected before
                if (Cesium.defined(scope._prevSelectedFeatures) && scope.includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Update references
                scope._prevHoveredFeature = pickedFeature;
                scope._prevHoveredColor = scope.getColor(pickedFeature);

                // Highlight the new feature
                scope.setColor(pickedFeature, scope._mouseOverHighlightColor, colorBlendOptions);
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);
                if (!Cesium.defined(pickedFeature)) return;

                // Do not change the highlighting if the mouse is still on the same feature
                if (Cesium.defined(scope._prevHoveredFeature) && scope.isEqual(scope._prevHoveredFeature, pickedFeature)) return;

                // Unhighlight previous feature
                if (Cesium.defined(scope._prevHoveredFeature)) {
                    // Only when not selected
                    if (!scope.includes(scope._prevSelectedFeatures, scope._prevHoveredFeature)) {
                        scope.setColor(scope._prevHoveredFeature, scope._prevHoveredColor);
                    }
                }

                // Do not highlight if feature has been already selected before
                if (Cesium.defined(scope._prevSelectedFeatures) && scope.includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Update references
                scope._prevHoveredFeature = pickedFeature;
                scope._prevHoveredColor = scope.getColor(pickedFeature);

                // Highlight the new feature
                scope.setColor(pickedFeature, scope._mouseOverHighlightColor, colorBlendOptions);
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE,
            Cesium.KeyboardEventModifier.CTRL
        );

        viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
                // Empty the selected list when a new object has been clicked
                if (scope._prevSelectedFeatures.length > 0) {
                    for (let i = 0; i < scope._prevSelectedFeatures.length; i++) {
                        scope.setColor(scope._prevSelectedFeatures[i], scope._prevSelectedColors[i]);
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
                if (scope.includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(scope.getColor(scope._prevHoveredColor));

                // Highlight newly selected feature
                setSelected(pickedFeature);
                scope.setColor(pickedFeature, scope._highlightColor, colorBlendOptions);

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, viewer.selectedEntity);

                // Info table
                const entityContent = getProperties(pickedFeature);
                curLayer._fnInfoTable([viewer.selectedEntity, entityContent], curLayer);
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
                if (scope.includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(scope.getColor(scope._prevHoveredColor));

                // Highlight newly selected feature
                setSelected(pickedFeature);
                scope.setColor(pickedFeature, scope._highlightColor, colorBlendOptions);

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, viewer.selectedEntity);
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
                    var layerid = object.id.layerId;
                    for (i = 0; i < this._layers.length; i++) {
                        if (this._layers[i].id == layerid) {
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
            if (layer.id == this._layers[i].id) {
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
    WebMap3DCityDB.prototype.getLayerbyId = function (layerId) {
        for (var i = 0; i < this._layers.length; i++) {
            if (layerId == this._layers[i].id) {
                return this._layers[i];
            }
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
    WebMap3DCityDB.prototype.removeLayer = function (id) {
        for (var i = 0; i < this._layers.length; i++) {
            var layer = this._layers[i];
            if (id == layer.id) {
                layer.removeFromCesium(this._cesiumViewerInstance);
                this._layers.splice(i, 1);
                return;
            }
        }
        return;
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
                scope.setColor(scope._prevSelectedFeatures[i], scope._prevSelectedColors[i]);
            }
        }

        // For all layers
        scope._prevSelectedFeatures = [];
        scope._prevSelectedColors = [];

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
        let scope = this;
        if (!Cesium.defined(scope._prevSelectedFeatures)) return {};

        let results = {};
        for (feature of scope._prevSelectedFeatures) {
            if (feature instanceof Cesium.Cesium3DTileFeature) {
                if (!Cesium.defined(feature.content.tile.i3sNode)) {
                    // Cesium 3D Tiles
                    const gmlidKeys = ["gmlid", "gml_id", "gml-id", "gml:id", "id"];
                    for (let key of gmlidKeys) {
                        const gmlid = feature.getProperty(key);
                        if (Cesium.defined(gmlid)) {
                            results[gmlid] = feature;
                            break;
                        }
                    }
                } else {
                    // i3s
                    const i3sNode = feature.content.tile.i3sNode;
                    const fields = i3sNode.getFieldsForFeature(feature.featureId);

                    let set = false;
                    const gmlidKeys = ["gmlid", "gml_id", "gml-id", "gml:id", "id", "OBJECTID"];
                    for (let key of gmlidKeys) {
                        const gmlid = fields[key];
                        if (Cesium.defined(gmlid)) {
                            results[gmlid] = feature;
                            set = true;
                            break;
                        }
                    }

                    if (!set) {
                        const batchId = feature._batchId;
                        results[batchId] = feature;
                    }
                }
            } else if (Cesium.defined(feature.id)) {
                // COLLADA/KML/glTF and  GeoJSON
                results[feature.id.id] = feature.id;
            }
        }
        return results;
    };

    /**
     * Return all hidden objects from all layers
     * @returns {Array}
     */
    WebMap3DCityDB.prototype.getAllHiddenObjects = function () {
        let scope = this;
        if (!Cesium.defined(scope._hiddenObjects)) return {};

        let results = {};
        for (feature of scope._hiddenObjects) {
            if (feature instanceof Cesium.Cesium3DTileFeature) {
                if (!Cesium.defined(feature.content.tile.i3sNode)) {
                    // Cesium 3D Tiles
                    const gmlidKeys = ["gmlid", "gml_id", "gml-id", "gml:id", "id"];
                    for (let key of gmlidKeys) {
                        const gmlid = feature.getProperty(key);
                        if (Cesium.defined(gmlid)) {
                            results[gmlid] = feature;
                            break;
                        }
                    }
                } else {
                    // i3s
                    const i3sNode = feature.content.tile.i3sNode;
                    const fields = i3sNode.getFieldsForFeature(feature.featureId);

                    let set = false;
                    const gmlidKeys = ["gmlid", "gml_id", "gml-id", "gml:id", "id", "OBJECTID"];
                    for (let key of gmlidKeys) {
                        const gmlid = fields[key];
                        if (Cesium.defined(gmlid)) {
                            results[gmlid] = feature;
                            set = true;
                            break;
                        }
                    }

                    if (!set) {
                        const batchId = feature._batchId;
                        results[batchId] = feature;
                    }
                }
            } else if (Cesium.defined(feature.id)) {
                // COLLADA/KML/glTF and  GeoJSON
                results[feature.id.id] = feature.id;
            }
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
            // For all layers
            if (!scope.includes(scope._hiddenObjects, feature)) {
                scope._hiddenObjects.push(feature);
            }

            if (feature instanceof Cesium.Cesium3DTileFeature) {
                // Cesium 3D Tiles and i3s
                feature.show = false;
            } else if (Cesium.defined(feature.id)) {
                // COLLADA/KML/glTF and  GeoJSON
                feature.id.show = false;
            }
        }
    };

    /**
     * Show all hidden objects from all layers
     */
    WebMap3DCityDB.prototype.showHiddenObjects = function () {
        const scope = this;
        if (!Cesium.defined(scope._hiddenObjects)) return;

        for (feature of scope._hiddenObjects) {
            if (feature instanceof Cesium.Cesium3DTileFeature) {
                // Cesium 3D Tiles and i3s
                feature.show = true;
            } else if (Cesium.defined(feature.id)) {
                // COLLADA/KML/glTF and  GeoJSON
                feature.id.show = true;
            }
        }

        // For all layers
        scope._hiddenObjects = [];
    };

    window.WebMap3DCityDB = WebMap3DCityDB;
})();
