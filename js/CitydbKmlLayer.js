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
    function CitydbKmlLayer(options) {

        // variables defined in the 3dcitydb-layer-Interface
        this._url = options.url;
        this._name = options.name;
        this._id = Cesium.defaultValue(options.id, Cesium.createGuid());
        this._region = options.region;
        this._active = Cesium.defaultValue(options.active, true);
        this._highlightedObjects = new Object();
        this._hiddenObjects = new Array();
        this._cameraPosition = new Object();
        this._clickEvent = new Cesium.Event();
        this._ctrlClickEvent = new Cesium.Event();
        this._mouseInEvent = new Cesium.Event();
        this._mouseOutEvent = new Cesium.Event();

        // extended variables for CitydbKmlLayer	
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
        this._citydbKmlDataSource = undefined;
        this._activeHighlighting = Cesium.defaultValue(options.activeHighlighting, true);
        this._citydbKmlHighlightingManager = this._activeHighlighting ? new CitydbKmlHighlightingManager(this) : null;
        this._citydbKmlTilingManager = new CitydbKmlTilingManager(this);
        this._layerType = undefined;
        this._jsonLayerInfo = undefined;
        this._urlSuffix = undefined;
        this._viewChangedEvent = new Cesium.Event();

        this._highlightColor = Cesium.Color.YELLOW;
        this._mouseOverhighlightColor = Cesium.Color.YELLOW;

        this._layerDataType = options.layerDataType;
        this._layerProxy = options.layerProxy;
        this._layerClampToGround = options.layerClampToGround;
        this._gltfVersion = options.gltfVersion;

        this._fnInfoTable = undefined;

        this._configParameters = {
            "id": this.id,
            "url": this.url,
            "name": this.name,
            "layerDataType": this.layerDataType,
            "layerProxy": this.layerProxy,
            "layerClampToGround": this.layerClampToGround,
            "gltfVersion": this.gltfVersion,
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

        Cesium.knockout.track(this, ['_highlightedObjects', '_hiddenObjects']);
    }

    Object.defineProperties(CitydbKmlLayer.prototype, {

        active: {
            get: function () {
                return this._active;
            }
        },

        highlightedObjects: {
            get: function () {
                return this._highlightedObjects;
            },
            set: function (value) {
                this._highlightedObjects = value;
            }
        },

        hiddenObjects: {
            get: function () {
                return this._hiddenObjects;
            },
            set: function (value) {
                this._hiddenObjects = value;
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

        citydbKmlDataSource: {
            get: function () {
                return this._citydbKmlDataSource;
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

        citydbKmlTilingManager: {
            get: function () {
                return this._citydbKmlTilingManager;
            }
        },

        citydbKmlHighlightingManager: {
            get: function () {
                return this._citydbKmlHighlightingManager;
            }
        },

        isHighlightingActivated: {
            get: function () {
                return this._citydbKmlHighlightingManager == null ? false : true;
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

        mouseOverhighlightColor: {
            get: function () {
                return this._mouseOverhighlightColor;
            },
            set: function (value) {
                this._mouseOverhighlightColor = value;
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

        gltfVersion: {
            get: function () {
                return this._gltfVersion;
            },
            set: function (value) {
                this._gltfVersion = value;
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

    function loadMasterJSON(that, isFirstLoad) {
        var deferred = Cesium.defer();
        var jsonUrl = that.checkProxyUrl(that, that._url);
        new Cesium.Resource({url: jsonUrl}).fetch({responseType: 'json'}).then(function (json) {
            that._jsonLayerInfo = json;
            that._layerType = json.displayform;
            that._cameraPosition = {
                lat: (json.bbox.ymax + json.bbox.ymin) / 2,
                lon: (json.bbox.xmax + json.bbox.xmin) / 2,
                range: 800,
                pitch: -50,
                heading: 6,
                altitude: 40
            }

            if (isFirstLoad) {
                if (!that._minLodPixels)
                    that._minLodPixels = json.minLodPixels == -1 ? Number.MIN_VALUE : json.minLodPixels;
                if (!that._maxLodPixels)
                    that._maxLodPixels = json.maxLodPixels == -1 ? Number.MAX_VALUE : json.maxLodPixels;
            }

            if (that._active) {
                if (that._urlSuffix == 'json')
                    that._citydbKmlTilingManager.doStart();
                that._cesiumViewer.dataSources.add(that._citydbKmlDataSource);
            }

            var cityobjectsJsonUrl = that._cityobjectsJsonUrl;
            if (Cesium.defined(cityobjectsJsonUrl)) {
                new Cesium.Resource({url: cityobjectsJsonUrl}).fetch({responseType: 'json'}).then(function (data) {
                    deferred.resolve(that);
                    that._cityobjectsJsonData = data;
                }, function () {
                    deferred.resolve(that);
                });
            } else {
                deferred.resolve(that);
            }
        }, function (error) {
            deferred.reject(new Cesium.DeveloperError('Failed to load: ' + jsonUrl));
        });

        return deferred.promise;
    }

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

    /**
     * Support both old and new version of glTF
     *
     * @param {type} material
     * @returns {unresolved}
     */
    function _getEmissiveFactor(material) {
        var testObj = material['emissiveFactor'];
        if (Cesium.defined(testObj)) {
            return testObj;
        }
        return material['emission'];
    }

    /**
     * Support both old and new version of glTF
     *
     * @param {type} material
     * @param {type} value
     * @returns {undefined}
     */
    function _setEmissiveFactor(material, value) {
        var testObj = material['emissiveFactor'];
        if (Cesium.defined(testObj)) {
            material['emissiveFactor'] = value;
        } else {
            material['emission'] = value;
        }
    }

    CitydbKmlLayer.prototype.checkProxyUrl = function (obj, url) {
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
    CitydbKmlLayer.prototype.addToCesium = function (cesiumViewer, fnInfoTable) {
        this._cesiumViewer = cesiumViewer;
        this._fnInfoTable = fnInfoTable;
        this._urlSuffix = CitydbUtil.get_suffix_from_filename(this._url);
        var that = this;
        var deferred = Cesium.defer();
        if (this._urlSuffix === 'json') {
            this._citydbKmlDataSource = new CitydbKmlDataSource({
                layerId: this._id,
                camera: cesiumViewer.scene.camera,
                canvas: cesiumViewer.scene.canvas,
                gltfVersion: this._gltfVersion
            });
            this.registerMouseEventHandlers();
            return loadMasterJSON(that, true);
        } else if (this._urlSuffix === 'kml' || this._urlSuffix === 'kmz') {
            this._citydbKmlDataSource = new Cesium.KmlDataSource({
                camera: cesiumViewer.scene.camera,
                canvas: cesiumViewer.scene.canvas
            });

            this._citydbKmlDataSource.load(this.checkProxyUrl(this, this._url), {clampToGround: this._layerClampToGround}).then(function (dataSource) {
                assignLayerIdToDataSourceEntites(dataSource.entities, that._id);
                if (that._active) {
                    cesiumViewer.dataSources.add(dataSource);
                }
                deferred.resolve(that);
            }, function (error) {
                deferred.reject(new Cesium.DeveloperError('Failed to load: ' + that._url));
            });
        } else if (this._urlSuffix === 'czml') {
            this._citydbKmlDataSource = new Cesium.CzmlDataSource();

            this._citydbKmlDataSource.load(this.checkProxyUrl(this, this._url)).then(function (dataSource) {
                assignLayerIdToDataSourceEntites(dataSource.entities, that._id);
                if (that._active) {
                    cesiumViewer.dataSources.add(dataSource);
                }
                deferred.resolve(that);
            }, function (error) {
                deferred.reject(new Cesium.DeveloperError('Failed to load: ' + that._url));
            });
        } else {
            deferred.reject(new Cesium.DeveloperError('Unsupported Datasource from: ' + that._url));
        }

        this.registerMouseEventHandlers();

        Cesium.knockout.getObservable(this, '_highlightedObjects').subscribe(function () {
            if (that._urlSuffix === 'json')
                that._citydbKmlTilingManager.clearCaching();
        });

        Cesium.knockout.getObservable(this, '_hiddenObjects').subscribe(function () {
            if (that._urlSuffix === 'json')
                that._citydbKmlTilingManager.clearCaching();
        });

        return deferred.promise;
    }

    CitydbKmlLayer.prototype.removeFromCesium = function (cesiumViewer) {
        this.activate(false);
    }

    CitydbKmlLayer.prototype.registerMouseEventHandlers = function () {
        var highlightColor = this._highlightColor;
        var mouseOverhighlightColor = this._mouseOverhighlightColor;
        var scope = this;

        scope.registerEventHandler("CLICK", function (object) {
            var targetEntity = object.id;
            var primitive = object.primitive;
            var objectId = targetEntity.name;

            if (objectId === "Tile border")
                return;

            if (scope.isInHighlightedList(objectId))
                return;
            // clear all other Highlighting status and just highlight the clicked object...
            scope.unHighlightAllObjects();
            var highlightThis = {};

            highlightThis[objectId] = highlightColor;
            scope.highlight(highlightThis);

            scope._fnInfoTable([targetEntity, {}], scope);
        });

        // CtrlclickEvent Handler for Multi-Selection and Highlighting...
        scope.registerEventHandler("CTRLCLICK", function (object) {
            var targetEntity = object.id;
            var primitive = object.primitive;

            var objectId = targetEntity.name;

            if (objectId === "Tile border")
                return;

            if (scope.isInHighlightedList(objectId)) {
                scope.unHighlight([objectId]);
            } else {
                var highlightThis = {};
                highlightThis[objectId] = highlightColor;
                scope.highlight(highlightThis);
            }
        });

        // MouseIn- and MouseOut-Event Handler for MouseOver-Highlighting
        scope.registerEventHandler("MOUSEIN", function (object) {
            var targetEntity = object.id;
            var primitive = object.primitive;

            if (!Cesium.defined(targetEntity) || !Cesium.defined(primitive))
                return;

            if (scope.isInHighlightedList(targetEntity.name))
                return;

            if (primitive instanceof Cesium.Model) {
                if (!Cesium.defined(targetEntity.originalColor)) {
                    targetEntity.originalColor = Cesium.Color.clone(primitive.color);
                }
                // Enable highlighting
                targetEntity.model.color = Cesium.Color.clone(mouseOverhighlightColor);
                targetEntity.model.colorBlendMode = Cesium.ColorBlendMode.MIX;
                targetEntity.model.colorBlendAmount = 0.5;
                scope._cesiumViewer.scene.requestRenderMode = true;
                scope._cesiumViewer.scene.requestRender();
            } else if (primitive instanceof Cesium.Primitive) {
                try {
                    var parentEntity = targetEntity._parent;
                    var childrenEntities;
                    if (Cesium.defined(parentEntity)) {
                        childrenEntities = parentEntity._children;
                    } else {
                        childrenEntities = [targetEntity];
                    }
                } catch (e) {
                    return;
                } // not valid entities
                _doMouseoverHighlighting(childrenEntities, primitive, mouseOverhighlightColor);
            }
        });

        scope.registerEventHandler("MOUSEOUT", function (object) {
            var primitive = object.primitive;
            var targetEntity = object.id;

            if (!Cesium.defined(targetEntity) || !Cesium.defined(primitive))
                return;

            if (scope.isInHighlightedList(targetEntity.name))
                return;

            if (primitive instanceof Cesium.Model) {
                // Dismiss highlighting
                targetEntity.model.color = targetEntity.originalColor;
                targetEntity.model.colorBlendMode = undefined;
                targetEntity.model.colorBlendAmount = 0;
                scope._cesiumViewer.scene.requestRenderMode = true;
                scope._cesiumViewer.scene.requestRender();
            } else if (primitive instanceof Cesium.Primitive) {
                try {
                    var parentEntity = targetEntity._parent;
                    var childrenEntities;
                    if (Cesium.defined(parentEntity)) {
                        childrenEntities = parentEntity._children;
                    } else {
                        childrenEntities = [targetEntity];
                    }
                } catch (e) {
                    return;
                } // not valid entities
                _dismissMouseoverHighlighting(childrenEntities, primitive);
            }
        })

        function _doMouseoverHighlighting(_childrenEntities, _primitive, _mouseOverhighlightColor) {
            for (var i = 0; i < _childrenEntities.length; i++) {
                var childEntity = _childrenEntities[i];
                var attributes = _primitive.getGeometryInstanceAttributes(childEntity);
                if (!Cesium.defined(childEntity.originalSurfaceColor)) {
                    childEntity.addProperty("originalSurfaceColor");
                }
                childEntity.originalSurfaceColor = attributes.color;
                attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(_mouseOverhighlightColor);
            }
        }

        function _dismissMouseoverHighlighting(_childrenEntities, _primitive) {
            for (var i = 0; i < _childrenEntities.length; i++) {
                var childEntity = _childrenEntities[i];
                var originalSurfaceColor = childEntity.originalSurfaceColor;
                try {
                    var attributes = _primitive.getGeometryInstanceAttributes(childEntity);
                    attributes.color = originalSurfaceColor;
                } catch (e) {
                    console.log(e);
                    /* escape the DeveloperError exception: "This object was destroyed..." */
                }
            }
        }

    }

    /**
     * highlights one or more object with a given color;
     * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
     */
    CitydbKmlLayer.prototype.highlight = function (toHighlight) {
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
    CitydbKmlLayer.prototype.unHighlight = function (toUnHighlight) {
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

    CitydbKmlLayer.prototype.hideSelected = function () {
        let scope = this;
        for (let objectId in scope._highlightedObjects) {
            if (!this.isInHiddenList(objectId)) {
                this._hiddenObjects.push(objectId);
            }
            this.hideObject(this.getObjectById(objectId));
        }
    };

    /**
     * showObjects, to undo hideObjects
     * @param {Array<String>} A list of Object Ids which will be unhidden.
     */
    CitydbKmlLayer.prototype.showObjects = function (toUnhide) {
        for (var k = 0; k < toUnhide.length; k++) {
            var objectId = toUnhide[k];
            this._hiddenObjects.splice(objectId, 1);
        }
        for (var k = 0; k < toUnhide.length; k++) {
            var objectId = toUnhide[k];
            this.showObject(this.getObjectById(objectId));
        }
        this._hiddenObjects = this._hiddenObjects;
    };

    /**
     * activates or deactivates the layer
     * @param {Boolean} value
     */
    CitydbKmlLayer.prototype.activate = function (active) {
        this._active = active;
        if (this._urlSuffix == 'json') {
            if (active == false) {
                this._citydbKmlTilingManager.doTerminate();
                this._cesiumViewer.dataSources.remove(this._citydbKmlDataSource);
            } else {
                this._citydbKmlTilingManager.doStart();
                this._cesiumViewer.dataSources.add(this._citydbKmlDataSource);
            }
        } else if (this._urlSuffix == 'kml' || this._urlSuffix == 'kmz' || this._urlSuffix == 'czml') {
            if (active == false) {
                this._cesiumViewer.dataSources.remove(this._citydbKmlDataSource);
            } else {
                this._cesiumViewer.dataSources.add(this._citydbKmlDataSource);
            }
        } else {

        }
    }

    /**
     * zooms to the layer cameraPostion
     */
    CitydbKmlLayer.prototype.zoomToStartPosition = function () {
        if (this._urlSuffix == 'json') {
            var that = this;
            var lat = this._cameraPosition.lat;
            var lon = this._cameraPosition.lon;
            var center = Cesium.Cartesian3.fromDegrees(lon, lat);
            var heading = Cesium.Math.toRadians(this._cameraPosition.heading);
            var pitch = Cesium.Math.toRadians(this._cameraPosition.pitch);
            var range = this._cameraPosition.range;
            var cesiumCamera = this._cesiumViewer.scene.camera;
            cesiumCamera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lon, lat, range),
                complete: function () {
                    cesiumCamera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
                    cesiumCamera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                    setTimeout(function () {
                        if (this._urlSuffix == 'json')
                            that._citydbKmlTilingManager.triggerWorker();
                    }, 3000)
                }
            })
        } else if (this._urlSuffix == 'kml' || this._urlSuffix == 'kmz' || this._urlSuffix == 'czml') {
            this._cesiumViewer.flyTo(this._citydbKmlDataSource);
        } else {

        }
    }

    /**
     * removes an Eventhandler
     * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
     * @param {function} callback function to be called
     */
    CitydbKmlLayer.prototype.removeEventHandler = function (event, callback) {
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
    CitydbKmlLayer.prototype.registerEventHandler = function (event, callback) {
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
    CitydbKmlLayer.prototype.triggerEvent = function (event, object) {
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
    //---------------------- Extended Methods and Functions for CitydbKmlLayer--------------------------------//
    //--------------------------------------------------------------------------------------------------------//

    CitydbKmlLayer.prototype.reActivate = function () {
        this._highlightedObjects = {};
        this._hiddenObjects = [];
        this._cityobjectsJsonData = {};
        if (this._active) {
            if (this._urlSuffix == 'json') {
                this._citydbKmlTilingManager.doTerminate();
                this._cesiumViewer.dataSources.remove(this._citydbKmlDataSource);
            } else if (this._urlSuffix == 'kml' || this._urlSuffix == 'kmz' || this._urlSuffix == 'czml') {
                this._cesiumViewer.dataSources.remove(this._citydbKmlDataSource);
            } else {
            }
        }
        var deferred = Cesium.defer();
        var that = this;
        if (this._urlSuffix == 'json') {
            this._citydbKmlDataSource = new CitydbKmlDataSource({
                layerId: this._id,
                camera: this._cesiumViewer.scene.camera,
                canvas: this._cesiumViewer.scene.canvas,
                gltfVersion: this._gltfVersion
            });
            this._citydbKmlTilingManager = new CitydbKmlTilingManager(this);
            return loadMasterJSON(this, false);
        } else if (this._urlSuffix == 'kml' || this._urlSuffix == 'kmz') {
            this._citydbKmlDataSource = new Cesium.KmlDataSource({
                camera: this._cesiumViewer.scene.camera,
                canvas: this._cesiumViewer.scene.canvas
            });

            this._citydbKmlDataSource.load(this.checkProxyUrl(this, this._url), {clampToGround: this._layerClampToGround}).then(function (dataSource) {
                assignLayerIdToDataSourceEntites(dataSource.entities, that._id);
                that._cesiumViewer.dataSources.add(dataSource);
                deferred.resolve(that);
            }, function (error) {
                deferred.reject(new Cesium.DeveloperError('Failed to load: ' + that._url));
            });
        } else if (this._urlSuffix == 'czml') {
            this._citydbKmlDataSource = new Cesium.CzmlDataSource();

            this._citydbKmlDataSource.load(this.checkProxyUrl(this, this._url)).then(function (dataSource) {
                assignLayerIdToDataSourceEntites(dataSource.entities, that._id);
                cesiumViewer.dataSources.add(dataSource);
                deferred.resolve(that);
            }, function (error) {
                deferred.reject(new Cesium.DeveloperError('Failed to load: ' + that._url));
            });
        } else {
            deferred.reject(new Cesium.DeveloperError('Unsupported Datasource from: ' + that._url));
        }

        return deferred.promise;
    }

    CitydbKmlLayer.prototype.getObjectById = function (objectId) {
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

    CitydbKmlLayer.prototype.getEntitiesById = function (objectId) {
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

    CitydbKmlLayer.prototype.setEntityColorByPrimitive = function (entity, color) {
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

    CitydbKmlLayer.prototype.highlightObject = function (object) {
        if (object == null) return;
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
                    // Store camera position
                    let boundingSphere = new Cesium.BoundingSphere();
                    this._cesiumViewer.dataSourceDisplay.getBoundingSphere(targetEntity, false, boundingSphere);
                    targetEntity._storedBoundingSphere = boundingSphere;
                    targetEntity._storedHeadingPitchRange = new Cesium.HeadingPitchRange(
                        this._cesiumViewer.camera.heading,
                        this._cesiumViewer.camera.pitch,
                        this._cesiumViewer.camera.positionCartographic.height
                    )
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
                // Store camera position
                let boundingSphere = new Cesium.BoundingSphere();
                this._cesiumViewer.dataSourceDisplay.getBoundingSphere(childEntity, false, boundingSphere);
                childEntity._storedBoundingSphere = boundingSphere;
                childEntity._storedHeadingPitchRange = new Cesium.HeadingPitchRange(
                    this._cesiumViewer.camera.heading,
                    this._cesiumViewer.camera.pitch,
                    this._cesiumViewer.camera.positionCartographic.height
                )
            }
        }
    };

    CitydbKmlLayer.prototype.unHighlightObject = function (object) {
        if (object == null) return;
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

    CitydbKmlLayer.prototype.unHighlightAllObjects = function () {
        for (var id in this._highlightedObjects) {
            delete this._highlightedObjects[id];
            this.unHighlightObject(this.getObjectById(id));
        }
        this._highlightedObjects = this._highlightedObjects;
        if (this._citydbKmlHighlightingManager != null)
            this._citydbKmlHighlightingManager.triggerWorker();
    };

    CitydbKmlLayer.prototype.isHighlighted = function (objectId) {
        var object = this.getObjectById(id);
        return this.isHighlightedObject(object);
    };

    CitydbKmlLayer.prototype.isHighlightedObject = function (object) {
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

    CitydbKmlLayer.prototype.isInHighlightedList = function (objectId) {
        return this._highlightedObjects.hasOwnProperty(objectId);
    };

    CitydbKmlLayer.prototype.hasHighlightedObjects = function () {
        return Object.keys(this._highlightedObjects).length > 0 ? true : false;
    };

    CitydbKmlLayer.prototype.hideObject = function (object) {
        if (object == null) return;
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

    CitydbKmlLayer.prototype.showObject = function (object) {
        if (object == null) return;
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

    CitydbKmlLayer.prototype.isHiddenObject = function (object) {
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

    CitydbKmlLayer.prototype.showAllObjects = function () {
        for (var k = 0; k < this._hiddenObjects.length; k++) {
            var objectId = this._hiddenObjects[k];
            this.showObject(this.getObjectById(objectId));
        }
        this._hiddenObjects = this._hiddenObjects;
        this._hiddenObjects = [];
    };

    CitydbKmlLayer.prototype.isInHiddenList = function (objectId) {
        return this._hiddenObjects.indexOf(objectId) > -1 ? true : false;
    };

    CitydbKmlLayer.prototype.hasHiddenObjects = function () {
        return this._hiddenObjects.length > 0 ? true : false;
    };

    CitydbKmlLayer.prototype.setObjectMaterial = function (object, material) {
        if (Cesium.defined(object.polygon)) {
            object.polygon.material = material;
        } else if (Cesium.defined(object.polyline)) {
            object.polyline.material = material;
        } else if (Cesium.defined(object.point)) {
            object.point.material = material;
        }
    };

    CitydbKmlLayer.prototype.getObjectMaterial = function (object) {
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

    CitydbKmlLayer.prototype.getAllHighlightedObjects = function () {
        let scope = this;
        let result = {}
        for (let h in scope._highlightedObjects) {
            let objects = scope.getObjectById(h);
            if (Cesium.defined(objects) && objects.length !== 0) {
                let o = objects[0]; // a 3D model may have multiple surfaces -> use one to represent all
                result[o._id] = o;
            }
        }
        return result;
    };

    CitydbKmlLayer.prototype.getAllHiddenObjects = function () {
        let scope = this;
        let result = {};
        for (let objectId of scope._hiddenObjects) {
            let objects = scope.getObjectById(objectId);
            if (Cesium.defined(objects) && objects.length !== 0) {
                let o = objects[0]; // a 3D model may have multiple surfaces -> use one to represent all
                result[o._id] = o;
            }
        }
        return result;
    };

    window.CitydbKmlLayer = CitydbKmlLayer;
})();

