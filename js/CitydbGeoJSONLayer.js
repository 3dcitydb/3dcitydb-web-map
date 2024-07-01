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
 *
 * This JavaScript class implements the interface Layer3DCityDB defined in "3dcitydb-layer.js"
 * for processing KML/KMZ/glTF data exported by 3DCityDB-Importer-Exporter-Tool (version 3.1.0 or higher),
 *
 */
(function () {
    function CitydbGeoJSONLayer(options) {

        // variables defined in the 3dcitydb-layer-Interface
        this._url = options.url;
        this._name = options.name;
        this._id = Cesium.defaultValue(options.id, Cesium.createGuid());
        this._region = options.region;
        this._active = Cesium.defaultValue(options.active, true);
        this._cameraPosition = new Object();
        this._clickEvent = new Cesium.Event();
        this._ctrlClickEvent = new Cesium.Event();
        this._mouseInEvent = new Cesium.Event();
        this._mouseOutEvent = new Cesium.Event();

        // extended variables for CitydbGeoJSONLayer
        this._cesiumViewer = undefined;
        this._thematicDataUrl = Cesium.defaultValue(options.thematicDataUrl, "");
        this._thematicDataSource = Cesium.defaultValue(options.thematicDataSource, "");
        this._tableType = Cesium.defaultValue(options.tableType, "");
        var dataSourceControllerOptions = {};
        dataSourceControllerOptions.uri = this._thematicDataUrl;
        dataSourceControllerOptions.tableType = this._tableType;
        this._dataSourceController = new DataSourceController(this._thematicDataSource, signInController, dataSourceControllerOptions);
        this._thematicDataProvider = Cesium.defaultValue(options.thematicDataProvider, "");
        this._cityobjectsJsonUrl = options.cityobjectsJsonUrl;
        this._cityobjectsJsonData = new Object();
        this._maxSizeOfCachedTiles = Cesium.defaultValue(options.maxSizeOfCachedTiles, 50);
        this._maxCountOfVisibleTiles = Cesium.defaultValue(options.maxCountOfVisibleTiles, 200);
        this._minLodPixels = Cesium.defaultValue(options.minLodPixels, undefined);
        this._maxLodPixels = Cesium.defaultValue(options.maxLodPixels, undefined);
        this._citydbGeoJSONDataSource = undefined;
        this._activeHighlighting = Cesium.defaultValue(options.activeHighlighting, true);
        this._citydbKmlHighlightingManager = this._activeHighlighting ? new CitydbKmlHighlightingManager(this) : null;
        this._layerType = undefined;
        this._jsonLayerInfo = undefined;
        this._urlSuffix = undefined;
        this._viewChangedEvent = new Cesium.Event();

        this._highlightColor = Cesium.Color.AQUAMARINE;
        this._mouseOverHighlightColor = Cesium.Color.YELLOW;
        this._selectedEntity = new Cesium.Entity();
        this._prevHoveredColor = undefined;
        this._prevHoveredFeature = undefined;
        this._prevSelectedFeatures = [];
        this._prevSelectedColors = [];
        this._hiddenObjects = []; // kvps, with entry key = gmlid and value = feature

        this._layerDataType = options.layerDataType;
        this._layerProxy = options.layerProxy;
        this._layerClampToGround = options.layerClampToGround;

        this._fnInfoTable = undefined;

        this._configParameters = {
            "id": this.id,
            "url": this.url,
            "name": this.name,
            "layerDataType": this.layerDataType,
            "layerProxy": this.layerProxy,
            "layerClampToGround": this.layerClampToGround,
            "thematicDataUrl": this.thematicDataUrl,
            "thematicDataSource": this.thematicDataSource,
            "tableType": this.tableType,
            "thematicDataProvider": this._thematicDataProvider,
            "cityobjectsJsonUrl": this.cityobjectsJsonUrl,
            "minLodPixels": this.minLodPixels,
            "maxLodPixels": this.maxLodPixels,
            "maxSizeOfCachedTiles": this.maxSizeOfCachedTiles,
            "maxCountOfVisibleTiles": this.maxCountOfVisibleTiles
        }

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

    Object.defineProperties(CitydbGeoJSONLayer.prototype, {

        active: {
            get: function () {
                return this._active;
            }
        },

        cameraPosition: {
            get: function () {
                return this._cameraPosition;
            },
            set: function (value) {
                this._cameraPosition = value;
            }
        },

        url: {
            get: function () {
                return this._url;
            },
            set: function (value) {
                this._url = value;
            }
        },

        urlSuffix: {
            get: function () {
                return this._urlSuffix;
            },
            set: function (value) {
                this._urlSuffix = value;
            }
        },

        name: {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            }
        },

        id: {
            get: function () {
                return this._id;
            }
        },

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

        cityobjectsJsonData: {
            get: function () {
                return this._cityobjectsJsonData;
            },
            set: function (value) {
                this._cityobjectsJsonData = value;
            }
        },

        cesiumViewer: {
            get: function () {
                return this._cesiumViewer;
            }
        },

        citydbGeoJSONDataSource: {
            get: function () {
                return this._citydbGeoJSONDataSource;
            }
        },

        minLodPixels: {
            get: function () {
                return this._minLodPixels;
            },
            set: function (value) {
                this._minLodPixels = value;
            }
        },

        maxLodPixels: {
            get: function () {
                return this._maxLodPixels;
            },
            set: function (value) {
                this._maxLodPixels = value;
            }
        },

        maxSizeOfCachedTiles: {
            get: function () {
                return this._maxSizeOfCachedTiles;
            },
            set: function (value) {
                this._maxSizeOfCachedTiles = value;
            }
        },

        maxCountOfVisibleTiles: {
            get: function () {
                return this._maxCountOfVisibleTiles;
            },
            set: function (value) {
                this._maxCountOfVisibleTiles = value;
            }
        },

        citydbKmlHighlightingManager: {
            get: function () {
                return this._citydbKmlHighlightingManager;
            }
        },

        isHighlightingActivated: {
            get: function () {
                return this._citydbKmlHighlightingManager != null;
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

        layerProxy: {
            get: function () {
                return this._layerProxy;
            },
            set: function (value) {
                this._layerProxy = value;
            }
        },

        layerClampToGround: {
            get: function () {
                return this._layerClampToGround;
            },
            set: function (value) {
                this._layerClampToGround = value;
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
        }
    });

    function assignLayerIdToDataSourceEntites(entityCollection, layerId) {
        var entities = entityCollection.values;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (!entity.layerId) {
                entity.addProperty('layerId');
                entity.layerId = layerId;
            }
        }
    }

    CitydbGeoJSONLayer.prototype.checkProxyUrl = function (obj, url) {
        var proxyPrefix = "";
        if (obj._layerProxy === true || obj._layerProxy === "true") {
            proxyPrefix = CitydbUtil.getProxyPrefix(url);
        }

        return (url.indexOf(proxyPrefix) >= 0 ? "" : proxyPrefix) + url;
    }

    /**
     * adds this layer to the given Cesium viewer
     * @param {CesiumViewer} cesiumViewer
     */
    CitydbGeoJSONLayer.prototype.addToCesium = function (cesiumViewer, fnInfoTable) {
        const scope = this;
        scope._cesiumViewer = cesiumViewer;
        scope._fnInfoTable = fnInfoTable;
        scope._urlSuffix = CitydbUtil.get_suffix_from_filename(scope._url);
        const deferred = Cesium.defer();

        scope._cesiumViewer.dataSources.add(Cesium.GeoJsonDataSource.load(scope._url, {
            clampToGround: scope._layerClampToGround
        })).then(datasSource => {
            scope._citydbGeoJSONDataSource = datasSource;
            scope.registerMouseEventHandlers();
            deferred.resolve(scope);
        });

        return deferred.promise;
    }

    CitydbGeoJSONLayer.prototype.removeFromCesium = function (cesiumViewer) {
        this.activate(false);
    }

    CitydbGeoJSONLayer.prototype.registerMouseEventHandlers = function () {
        const scope = this;
        const viewer = scope._cesiumViewer;

        // Get default left click handler for when a feature is not picked on left click
        const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        const setColor = function (feature, colorOrFeature) {
            if (!Cesium.defined(colorOrFeature)) {
                feature.id.polygon.material = undefined;
            } else if (colorOrFeature instanceof Cesium.Color) {
                feature.id.polygon.material = new Cesium.ColorMaterialProperty(colorOrFeature);
            } else if (colorOrFeature instanceof Cesium.ColorMaterialProperty) {
                feature.id.polygon.material = colorOrFeature;
            } else {
                feature.id.polygon.material = getColor(colorOrFeature);
            }
        }

        const getColor = function (feature) {
            return feature.id.polygon.material;
        }

        function isEqual(feature1, feature2) {
            return feature1.id.id === feature2.id.id;
        }

        function includes(array, ele) {
            for (i of array) {
                if (isEqual(i, ele)) {
                    return true;
                }
            }
            return false;
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
            feature.id._storedBoundingSphere = boundingSphere;
            feature.id._storedOrientation = orientation;
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
                    if (!includes(scope._prevSelectedFeatures, scope._prevHoveredFeature)) {
                        setColor(scope._prevHoveredFeature, scope._prevHoveredColor);
                    }
                }

                // Do not highlight if feature has been already selected before
                if (Cesium.defined(scope._prevSelectedFeatures) && includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Update references
                scope._prevHoveredFeature = pickedFeature;
                scope._prevHoveredColor = getColor(pickedFeature);

                // Highlight the new feature
                setColor(pickedFeature, scope._mouseOverHighlightColor);
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
                // Empty the selected list when a new object has been clicked
                if (scope._prevSelectedFeatures.length > 0) {
                    for (let i = 0; i < scope._prevSelectedFeatures.length; i++) {
                        setColor(scope._prevSelectedFeatures[i], scope._prevSelectedColors[i]);
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
                if (includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(scope._prevHoveredColor);

                // Highlight newly selected feature
                viewer.selectedEntity = scope._selectedEntity;
                setColor(pickedFeature, scope._highlightColor);

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, scope._selectedEntity);

                // Info table
                let entityContent = {};
                const entity = pickedFeature.id;
                entityContent["gmlid"] = entity.id;
                const properties = entity._properties;
                const propertyIds = properties._propertyNames;
                for (let i = 0; i < propertyIds.length; i++) {
                    const key = propertyIds[i];
                    entityContent[key] = properties[key]._value;
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
                if (includes(scope._prevSelectedFeatures, pickedFeature)) return;

                // Store original feature
                scope._prevSelectedFeatures.push(pickedFeature);
                // Mouse click also contains mouse hover event -> Store the color BEFORE mouse hover
                scope._prevSelectedColors.push(scope._prevHoveredColor);

                // Highlight newly selected feature
                viewer.selectedEntity = scope._selectedEntity;
                setColor(pickedFeature, scope._highlightColor);

                // Store the camera position for camera's flyTo
                storeCameraPosition(viewer, movement, scope._selectedEntity);
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK,
            Cesium.KeyboardEventModifier.CTRL
        );
    }

    /**
     * highlights one or more object with a given color;
     * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
     */
    CitydbGeoJSONLayer.prototype.highlight = function (toHighlight) {
        for (var id in toHighlight) {
            this._highlightedObjects[id] = toHighlight[id];
            this.highlightObject(this.getObjectById(id));
        }
        this._highlightedObjects = this._highlightedObjects;
    }

    /**
     * undo highlighting
     * @param {Array<String>} A list of Object Ids. The default material will be restored
     */
    CitydbGeoJSONLayer.prototype.unHighlight = function (toUnHighlight) {
        for (var k = 0; k < toUnHighlight.length; k++) {
            var id = toUnHighlight[k];
            delete this._highlightedObjects[id];
        }
        for (var k = 0; k < toUnHighlight.length; k++) {
            var id = toUnHighlight[k];
            this.unHighlightObject(this.getObjectById(id));
        }
        this._highlightedObjects = this._highlightedObjects;
    };

    /**
     * hideObjects
     * @param {Array<String>} A list of Object Ids which will be hidden
     */
    CitydbGeoJSONLayer.prototype.hideObjects = function (toHideFeatures) {
        let scope = this;
        if (!Cesium.defined(scope._hiddenObjects)) return;
        for (let feature of toHideFeatures) {
            if (!scope._hiddenObjects.includes(feature)) {
                scope._hiddenObjects.push(feature);
            }
            feature.id.show = false;
        }
    };

    CitydbGeoJSONLayer.prototype.hideSelected = function () {
        this.hideObjects(this._prevSelectedFeatures);
    };

    CitydbGeoJSONLayer.prototype.getAllHighlightedObjects = function () {
        const scope = this;
        let result = {};
        for (let feature of scope._prevSelectedFeatures) {
            result[feature.id.id] = feature.id;
        }
        return result;
    };

    CitydbGeoJSONLayer.prototype.getAllHiddenObjects = function () {
        const scope = this;
        let result = {};
        for (let feature of scope._hiddenObjects) {
            result[feature.id.id] = feature.id;
        }
        return result;
    };

    /**
     * activates or deactivates the layer
     * @param {Boolean} value
     */
    CitydbGeoJSONLayer.prototype.activate = function (active) {
        this._active = active;
        if (active === false) {
            this._cesiumViewer.dataSources.remove(this._citydbGeoJSONDataSource);
        } else {
            this._cesiumViewer.dataSources.add(this._citydbGeoJSONDataSource);
        }
    }

    /**
     * zooms to the layer cameraPostion
     */
    CitydbGeoJSONLayer.prototype.zoomToStartPosition = function () {
        this._cesiumViewer.flyTo(this._citydbGeoJSONDataSource);
    }

    /**
     * removes an Eventhandler
     * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
     * @param {function} callback function to be called
     */
    CitydbGeoJSONLayer.prototype.removeEventHandler = function (event, callback) {
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
     * @param {function} callback function to be called
     * @return {String} id of the event Handler, can be used to remove the event Handler
     */
    CitydbGeoJSONLayer.prototype.registerEventHandler = function (event, callback) {
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
    CitydbGeoJSONLayer.prototype.triggerEvent = function (event, object) {
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

    //--------------------------------------------------------------------------------------------------------//
    //---------------------- Extended Methods and Functions for CitydbGeoJSONLayer--------------------------------//
    //--------------------------------------------------------------------------------------------------------//

    CitydbGeoJSONLayer.prototype.reActivate = function () {
        const scope = this;
        const deferred = Cesium.defer();
        scope._prevSelectedFeatures = [];
        scope._prevSelectedColors = [];
        scope._prevHoveredFeature = undefined;
        scope._prevHoveredColor = undefined;
        scope._hiddenObjects = [];

        if (scope._active) {
            scope._cesiumViewer.dataSources.remove(scope._citydbGeoJSONDataSource);
        }

        scope._cesiumViewer.dataSources.add(Cesium.GeoJsonDataSource.load(scope._url, {
            clampToGround: scope._layerClampToGround
        })).then(datasSource => {
            scope._citydbGeoJSONDataSource = datasSource;
            deferred.resolve(scope);
        });

        return deferred.promise;
    }

    CitydbGeoJSONLayer.prototype.getObjectById = function (objectId) {
        var primitives = this._cesiumViewer.scene.primitives;
        if (this._layerType == "collada") {
            for (var i = 0; i < primitives.length; i++) {
                var primitive = primitives.get(i);
                if (primitive instanceof Cesium.Model) {
                    if (primitive.ready) {
                        if (primitive._id._name === objectId && primitive._id.layerId === this._id) {
                            return primitive;
                        }
                    }
                }
            }
        } else {
            return this.getEntitiesById(objectId);
        }
    };

    CitydbGeoJSONLayer.prototype.getEntitiesById = function (objectId) {
        var primitives = this._cesiumViewer.scene.primitives;

        function getEntitiesByIdFromPrimitiveCollection(primitiveCollection, layerId) {
            for (var i = 0; i < primitiveCollection.length; i++) {
                var primitive = primitiveCollection.get(i);

                if (primitive instanceof Cesium.PrimitiveCollection) {
                    var entity = getEntitiesByIdFromPrimitiveCollection(primitiveCollection.get(i), layerId);

                    if (entity) {
                        return entity;
                    }
                } else if (primitive instanceof Cesium.Primitive && Cesium.defined(primitive._instanceIds)) {
                    for (var j = 0; j < primitive._instanceIds.length; j++) {
                        var tmpPrimitiveInstance = primitive._instanceIds[j];
                        if (tmpPrimitiveInstance.name === objectId && tmpPrimitiveInstance.layerId === layerId) {
                            var targetEntity = tmpPrimitiveInstance;
                            var parentEntity = targetEntity._parent
                            if (Cesium.defined(parentEntity)) {
                                return parentEntity._children;
                            } else {
                                return [targetEntity]
                            }
                        }
                    }
                }
            }

            return null;
        }

        return getEntitiesByIdFromPrimitiveCollection(primitives, this._id);
    };

    CitydbGeoJSONLayer.prototype.setEntityColorByPrimitive = function (entity, color) {
        var primitives = this._cesiumViewer.scene.primitives;
        for (var i = 0; i < primitives.length; i++) {
            var primitive = primitives.get(i);
            if (primitive instanceof Cesium.Primitive && Cesium.defined(primitive._instanceIds)) {
                for (var j = 0; j < primitive._instanceIds.length; j++) {
                    var tmpId = primitive._instanceIds[j].name;
                    if (tmpId == entity.name && entity.layerId === this._id) {
                        var attributes = primitive.getGeometryInstanceAttributes(entity);
                        if (Cesium.defined(attributes)) {
                            attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(color);
                            return;
                        }
                    }
                }
            }
        }
    };

    CitydbGeoJSONLayer.prototype.highlightObject = function (object) {
        if (object == null)
            return;
        if (object instanceof Cesium.Model) {
            if (object.ready) {
                var highlightColor = this._highlightedObjects[object._id._name];
                if (highlightColor) {
                    var targetEntity = object._id;
                    if (!Cesium.defined(targetEntity.originalColor)) {
                        targetEntity.originalColor = Cesium.Color.clone(object.primitive.color);
                    }
                    // Enable highlighting
                    targetEntity.model.color = Cesium.Color.clone(highlightColor);
                    targetEntity.model.colorBlendMode = Cesium.ColorBlendMode.MIX;
                    targetEntity.model.colorBlendAmount = 0.5;
                    this._cesiumViewer.scene.requestRenderMode = true;
                    this._cesiumViewer.scene.requestRender();
                }
            }
        } else if (object instanceof Array) {
            for (var i = 0; i < object.length; i++) {
                var childEntity = object[i];
                if (!Cesium.defined(childEntity.originalMaterial)) {
                    childEntity.addProperty("originalMaterial");
                }
                childEntity.originalMaterial = this.getObjectMaterial(childEntity);
                this.setObjectMaterial(childEntity, this._highlightedObjects[childEntity.name]);
            }
        }
    };

    CitydbGeoJSONLayer.prototype.unHighlightObject = function (object) {
        if (object == null)
            return;
        if (object instanceof Cesium.Model) {
            if (object.ready) {
                var targetEntity = object._id;
                // Dismiss highlighting
                targetEntity.model.color = targetEntity.originalColor;
                targetEntity.model.colorBlendMode = undefined;
                targetEntity.model.colorBlendAmount = 0;
                this._cesiumViewer.scene.requestRenderMode = true;
                this._cesiumViewer.scene.requestRender();
            }
        } else if (object instanceof Array) {
            if (!this.isHiddenObject(object)) {
                for (var i = 0; i < object.length; i++) {
                    var childEntity = object[i];
                    var originalMaterial = childEntity.originalMaterial;
                    if (Cesium.defined(originalMaterial)) {
                        this.setEntityColorByPrimitive(childEntity, originalMaterial.color._value.clone());
                        this.setObjectMaterial(childEntity, originalMaterial);
                    }
                }
            }
        }
    };

    CitydbGeoJSONLayer.prototype.unHighlightAllObjects = function () {
        for (var id in this._highlightedObjects) {
            delete this._highlightedObjects[id];
            this.unHighlightObject(this.getObjectById(id));
        }
        this._highlightedObjects = this._highlightedObjects;
        if (this._citydbKmlHighlightingManager != null)
            this._citydbKmlHighlightingManager.triggerWorker();
    };

    CitydbGeoJSONLayer.prototype.isHighlighted = function (objectId) {
        var object = this.getObjectById(id);
        return this.isHighlightedObject(object);
    };

    CitydbGeoJSONLayer.prototype.isHighlightedObject = function (object) {
        if (object instanceof Cesium.Model) {
            var highlightColor = this._highlightedObjects[object._id._name];
            if (!Cesium.defined(highlightColor)) {
                return false;
            }
            var materials = object._runtime.materialsByName;
            for (var materialId in materials) {
                if (!_getEmissiveFactor(materials[materialId]).equals(Cesium.Cartesian4.fromColor(highlightColor))) {
                    return false;
                }
            }
        } else if (object instanceof Array) {
            for (var i = 0; i < object.length; i++) {
                var childEntity = object[i];
                var objectId = childEntity.name;
                ;
                var material = this.getObjectMaterial(childEntity);
                if (!material.color._value.equals(this._highlightedObjects[objectId])) {
                    return false;
                }
            }
        }
        return true;
    };

    CitydbGeoJSONLayer.prototype.isInHighlightedList = function (objectId) {
        return this._highlightedObjects.hasOwnProperty(objectId);
    };

    CitydbGeoJSONLayer.prototype.hasHighlightedObjects = function () {
        return Object.keys(this._highlightedObjects).length > 0 ? true : false;
    };

    CitydbGeoJSONLayer.prototype.hideObject = function (object) {
        if (object == null)
            return;
        if (object instanceof Cesium.Model) {
            if (object.ready) {
                var nodes = object._runtime.nodesByName;
                for (var nodeId in nodes) {
                    var node = nodes[nodeId];
                    var publicNode = Cesium.defined(node) ? node.publicNode : undefined
                    publicNode.show = false;
                }
            }
        } else if (object instanceof Array) {
            for (var i = 0; i < object.length; i++) {
                var childEntity = object[i];
                childEntity.show = false;
            }
        }
    };

    CitydbGeoJSONLayer.prototype.showObject = function (object) {
        if (object == null)
            return;
        if (object instanceof Cesium.Model) {
            if (object.ready) {
                var nodes = object._runtime.nodesByName;
                for (var nodeId in nodes) {
                    var node = nodes[nodeId];
                    var publicNode = Cesium.defined(node) ? node.publicNode : undefined
                    publicNode.show = true;
                }
            }
        } else if (object instanceof Array) {
            for (var i = 0; i < object.length; i++) {
                var childEntity = object[i];
                childEntity.show = true;
                var objectId = childEntity.name;
                if (!this.isInHighlightedList(objectId)) {
                    var originalMaterial = childEntity.originalMaterial;
                    if (Cesium.defined(originalMaterial)) {
                        this.setEntityColorByPrimitive(childEntity, originalMaterial.color._value);
                        setTimeout(function () {
                            this.setObjectMaterial(childEntity, originalMaterial);
                        }, 100)
                    }
                } else {
                    var scope = this;
                    setTimeout(function () {
                        var cloneHighlightedObjects = {};
                        for (var objId in scope._highlightedObjects) {
                            cloneHighlightedObjects[objId] = scope._highlightedObjects[objId];
                        }
                        scope.unHighlightAllObjects();
                        scope.highlight(cloneHighlightedObjects);
                    }, 100);
                }
            }
        }
    };

    CitydbGeoJSONLayer.prototype.isHiddenObject = function (object) {
        if (object instanceof Cesium.Model) {
            if (object.ready) {
                var nodes = object._runtime.nodesByName;
                for (var nodeId in nodes) {
                    var node = nodes[nodeId];
                    var publicNode = Cesium.defined(node) ? node.publicNode : undefined
                    return !publicNode.show;
                }
            }
        } else if (object instanceof Array) {
            for (var i = 0; i < object.length; i++) {
                var childEntity = object[i];
                return !childEntity.show;
            }
        }
        return true;
    };

    CitydbGeoJSONLayer.prototype.showAllObjects = function () {
        let scope = this;
        for (let feature of scope._hiddenObjects) {
            feature.id.show = true;
        }
        scope._hiddenObjects = [];
    };

    CitydbGeoJSONLayer.prototype.isInHiddenList = function (objectId) {
        return this._hiddenObjects.indexOf(objectId) > -1 ? true : false;
    };

    CitydbGeoJSONLayer.prototype.hasHiddenObjects = function () {
        return this._hiddenObjects.length > 0 ? true : false;
    };

    CitydbGeoJSONLayer.prototype.setObjectMaterial = function (object, material) {
        if (Cesium.defined(object.polygon)) {
            object.polygon.material = material;
        } else if (Cesium.defined(object.polyline)) {
            object.polyline.material = material;
        } else if (Cesium.defined(object.point)) {
            object.point.material = material;
        }
    };

    CitydbGeoJSONLayer.prototype.getObjectMaterial = function (object) {
        var geometryGraphic;
        if (Cesium.defined(object.polygon)) {
            geometryGraphic = object.polygon;
        } else if (Cesium.defined(object.polyline)) {
            geometryGraphic = object.polyline;
        } else if (Cesium.defined(object.point)) {
            geometryGraphic = object.point;
        }
        return geometryGraphic.material
    };

    window.CitydbGeoJSONLayer = CitydbGeoJSONLayer;
})();

