/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 *
 * Copyright 2015 - 2023
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.asg.ed.tum.de/
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
 * for processing i3s data
 *
 */
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

(function () {
    function CitydbI3SLayer(options) {

        var proxyUrl;
        if (location.host.indexOf('8000') > -1) {
            proxyUrl = '/proxy/'
        } else {
            proxyUrl = location.protocol + '//' + location.host + '/proxy/'
        }
        this._defaultProxy = new Cesium.DefaultProxy(proxyUrl)

        this._url = options.url;
        this._name = options.name;
        this._id = Cesium.defaultValue(options.id, Cesium.createGuid());
        this._region = options.region;
        this._active = Cesium.defaultValue(options.active, true);
        this._highlightedObjects = {};
        this._hiddenObjects = [];
        this._cameraPosition = {};
        this._thematicDataUrl = Cesium.defaultValue(options.thematicDataUrl, "");
        this._thematicDataSource = Cesium.defaultValue(options.thematicDataSource, "");
        var dataSourceControllerOptions = {};
        dataSourceControllerOptions.uri = this._thematicDataUrl;
        dataSourceControllerOptions.tableType = this._tableType;
        this._dataSourceController = new DataSourceController(this._thematicDataSource, signInController, dataSourceControllerOptions);
        this._tableType = Cesium.defaultValue(options.tableType, "");
        this._cityobjectsJsonUrl = options.cityobjectsJsonUrl;
        this._thematicDataProvider = Cesium.defaultValue(options.thematicDataProvider, "");
        this._cesiumViewer = undefined;
        this._i3sProvider = undefined;

        this._highlightColor = new Cesium.Color(0.4, 0.4, 0.0, 1.0);
        this._mouseOverhighlightColor = new Cesium.Color(0.0, 0.3, 0.0, 1.0);

        this._layerDataType = options.layerDataType;

        this._configParameters = {
            "id": this.id,
            "name": this.name,
            "url": this.url,
            "layerDataType": this.layerDataType,
            "thematicDataUrl": this.thematicDataUrl,
            "thematicDataProvider": this._thematicDataProvider
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

        Cesium.knockout.track(this, ['_highlightedObjects', '_hiddenObjects']);
    }

    Object.defineProperties(CitydbI3SLayer.prototype, {
        /**
         * Gets the active
         */
        active: {
            get: function () {
                return this._active;
            }
        },
        /**
         * Gets the currently highlighted Objects as an array
         */
        highlightedObjects: {
            get: function () {
                return this._highlightedObjects;
            },
            set: function (value) {
                this._highlightedObjects = value;
            }
        },
        /**
         * Gets the currently hidden Objects as an array
         */
        hiddenObjects: {
            get: function () {
                return this._hiddenObjects;
            },
            set: function (value) {
                this._hiddenObjects = value;
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

        mouseOverhighlightColor: {
            get: function () {
                return this._mouseOverhighlightColor;
            },
            set: function (value) {
                this._mouseOverhighlightColor = value;
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

        configParameters: {
            get: function () {
                return this._configParameters;
            }
        },

        i3sProvider: {
            get: function () {
                return this._i3sProvider;
            }
        }
    });

    /**
     * adds this layer to the given Cesium viewer
     * @param {CesiumViewer} cesiumViewer
     */
    CitydbI3SLayer.prototype.addToCesium = function (cesiumViewer) {
        var that = this;
        this._cesiumViewer = cesiumViewer;
        var deferred = Cesium.defer();

        // Source: https://sandcastle.cesium.com/?src=I3S%203D%20Object%20Layer.html

        // Initialize a terrain provider which provides geoid conversion between gravity related (typically I3S datasets)
        // and ellipsoidal based height systems (Cesium World Terrain).
        // If this is not specified, or the URL is invalid no geoid conversion will be applied.
        // The source data used in this transcoding service was compiled from https://earth-info.nga.mil/#tab_wgs84-data
        // and is based on EGM2008 Gravity Model
        const geoidService = new Cesium.ArcGISTiledElevationTerrainProvider({
            url:
                "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/EGM2008/ImageServer", // TODO
        });
        // Create i3s and Cesium3DTileset options to pass optional parameters useful for debugging and visualizing
        const cesium3dTilesetOptions = {
            skipLevelOfDetail: false,
            debugShowBoundingVolume: false,
        };
        const i3sOptions = {
            url: this._url,
            traceFetches: false, // for tracing I3S fetches
            geoidTiledTerrainProvider: geoidService, // pass the geoid service
            cesium3dTilesetOptions: cesium3dTilesetOptions, // options for internal Cesium3dTileset
        };
        // Create I3S data provider
        this._i3sProvider = new Cesium.I3SDataProvider(i3sOptions);

        this._i3sProvider.readyPromise.then(function () {
            // Add the i3s layer provider as a primitive data type
            that._cesiumViewer.scene.primitives.add(that._i3sProvider);
            that._i3sProvider.show = that._active;
            // TODO that.registerTilesLoadedEventHandler();
            that.registerMouseEventHandlers();
            deferred.resolve(that);
        }, function () {
            deferred.reject(new Cesium.DeveloperError('Failed to load: ' + that._url));
        });

        return deferred.promise;
    }

    CitydbI3SLayer.prototype.registerMouseEventHandlers = function () {
        var highlightColor = this._highlightColor;
        var mouseOverhighlightColor = this._mouseOverhighlightColor;

        var scope = this;
        scope.registerEventHandler("CLICK", function (object) {
            if (!(object._content instanceof Cesium.Batched3DModel3DTileContent))
                return;

            var featureArray = object._content._features;
            if (!Cesium.defined(featureArray))
                return;
            var objectId = featureArray[object._batchId].getProperty("id");
            if (!Cesium.defined(objectId))
                return;

            if (scope.isInHighlightedList(objectId))
                return;

            // clear all other Highlighting status and just highlight the clicked object...
            scope.unHighlightAllObjects();
            var highlightThis = {};

            highlightThis[objectId] = highlightColor;
            scope.highlight(highlightThis);
        });

        // CtrlclickEvent Handler for Multi-Selection and Highlighting...
        scope.registerEventHandler("CTRLCLICK", function (object) {
            if (!(object._content instanceof Cesium.Batched3DModel3DTileContent))
                return;

            var featureArray = object._content._features;
            if (!Cesium.defined(featureArray))
                return;
            var objectId = featureArray[object._batchId].getProperty("id");
            if (!Cesium.defined(objectId))
                return;

            if (scope.isInHighlightedList(objectId)) {
                scope.unHighlight([objectId]);
            } else {
                var highlightThis = {};
                highlightThis[objectId] = highlightColor;
                scope.highlight(highlightThis);
            }
        });

        scope.registerEventHandler("MOUSEIN", function (object) {
            if (!(object._content instanceof Cesium.Batched3DModel3DTileContent))
                return;

            var featureArray = object._content._features;
            if (!Cesium.defined(featureArray))
                return;
            var objectId = featureArray[object._batchId].getProperty("id");

            if (scope.isInHighlightedList(objectId))
                return;

            object.setProperty("originalColorValue", Cesium.Color.clone(object.color));
            object.color = mouseOverhighlightColor;
        });

        scope.registerEventHandler("MOUSEOUT", function (object) {
            if (!(object._content instanceof Cesium.Batched3DModel3DTileContent))
                return;

            var featureArray = object._content._features;
            if (!Cesium.defined(featureArray))
                return;
            var objectId = featureArray[object._batchId].getProperty("id");

            if (scope.isInHighlightedList(objectId))
                return;

            try {
                var originalColor = object.getProperty("originalColorValue");
                object.color = originalColor;
            } catch (e) {
                return;
            }
        });

        /*
        // An entity object which will hold info about the currently selected feature for infobox display
        const selectedEntity = new Cesium.Entity();

        // Show metadata in the InfoBox.
        scope._cesiumViewer.screenSpaceEventHandler.setInputAction(
            function onLeftClick(movement) {
                // Pick a new feature
                const pickedFeature = scope._cesiumViewer.scene.pick(movement.position);
                if (!Cesium.defined(pickedFeature)) {
                    return;
                }

                const pickedPosition = scope._cesiumViewer.scene.pickPosition(movement.position);

                if (Cesium.defined(pickedFeature.content) && Cesium.defined(pickedFeature.content.tile.i3sNode)) {
                    const i3sNode = pickedFeature.content.tile.i3sNode;
                    if (pickedPosition) {
                        i3sNode.loadFields().then(function () {
                            let description = "No attributes";
                            let name;
                            console.log(
                                `pickedPosition(x,y,z) : ${pickedPosition.x}, ${pickedPosition.y}, ${pickedPosition.z}`
                            );

                            const fields = i3sNode.getFieldsForPickedPosition(
                                pickedPosition
                            );
                            if (Object.keys(fields).length > 0) {
                                description =
                                    '<table class="cesium-infoBox-defaultTable"><tbody>';
                                for (const fieldName in fields) {
                                    if (i3sNode.fields.hasOwnProperty(fieldName)) {
                                        description += `<tr><th>${fieldName}</th><td>`;
                                        description += `${fields[fieldName]}</td></tr>`;
                                        console.log(`${fieldName}: ${fields[fieldName]}`);
                                        if (!Cesium.defined(name) && isNameProperty(fieldName)) {
                                            name = fields[fieldName];
                                        }
                                    }
                                }
                                description += `</tbody></table>`;
                            }
                            if (!Cesium.defined(name)) {
                                name = "unknown";
                            }
                            selectedEntity.name = name;
                            selectedEntity.description = description;
                            scope._cesiumViewer.selectedEntity = selectedEntity;
                        });
                    }
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        function isNameProperty(propertyName) {
            const name = propertyName.toLowerCase();
            if (
                name.localeCompare("name") === 0 ||
                name.localeCompare("objname") === 0
            ) {
                return true;
            }
            return false;
        }

         */
    }

    CitydbI3SLayer.prototype.zoomToStartPosition = function () {
        this._cesiumViewer.scene.camera.flyTo({
            destination: this._i3sProvider.extent
        });
    }

    /**
     * adds this layer to the given cesium viewer
     * @param {CesiumViewer} cesiumViewer
     */
    CitydbI3SLayer.prototype.removeFromCesium = function (cesiumViewer) {
        this.activate(false);
    }

    /**
     * activates the lay
     * @param {Boolean} value
     */
    CitydbI3SLayer.prototype.activate = function (active) {
        this._i3sProvider.show = active;
        this._active = active;
    }

    /**
     * deactivates the layer
     * @param undefined
     */
    CitydbI3SLayer.prototype.reActivate = function () {
        var that = this;
        var deferred = Cesium.defer();
        this._highlightedObjects = {};
        this._hiddenObjects = [];
        this._cesiumViewer.scene.primitives.remove(this._i3sProvider);

        // Initialize a terrain provider which provides geoid conversion between gravity related (typically I3S datasets)
        // and ellipsoidal based height systems (Cesium World Terrain).
        // If this is not specified, or the URL is invalid no geoid conversion will be applied.
        // The source data used in this transcoding service was compiled from https://earth-info.nga.mil/#tab_wgs84-data
        // and is based on EGM2008 Gravity Model
        const geoidService = new Cesium.ArcGISTiledElevationTerrainProvider({
            url:
                "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/EGM2008/ImageServer",
        });
        // Create i3s and Cesium3DTileset options to pass optional parameters useful for debugging and visualizing
        const cesium3dTilesetOptions = {
            skipLevelOfDetail: false,
            debugShowBoundingVolume: false,
        };
        const i3sOptions = {
            url: this._url,
            traceFetches: false, // for tracing I3S fetches
            geoidTiledTerrainProvider: geoidService, // pass the geoid service
            cesium3dTilesetOptions: cesium3dTilesetOptions, // options for internal Cesium3dTileset
        };
        // Create I3S data provider
        this._i3sProvider = new Cesium.I3SDataProvider(i3sOptions);

        this._i3sProvider.readyPromise.then(function () {
            // Add the i3s layer provider as a primitive data type
            that._cesiumViewer.scene.primitives.add(that._i3sProvider);
            // TODO that.registerTilesLoadedEventHandler();
            deferred.resolve();
        }, function () {
            deferred.reject(new Cesium.DeveloperError('Failed to load: ' + that._url));
        });

        return deferred.promise;
    }

    /**
     * highlights one or more object with a given color;
     */
    CitydbI3SLayer.prototype.highlight = function (toHighlight) {
        for (var id in toHighlight) {
            this._highlightedObjects[id] = toHighlight[id];
            var objects = this.getObjectById(id);
            for (var i = 0; i < objects.length; i++) {
                this.highlightObject(objects[i]);
            }
        }
        this._highlightedObjects = this._highlightedObjects;
    }

    CitydbI3SLayer.prototype.highlightObject = function (object) {
        if (object == null)
            return;

        if (!(object._content instanceof Cesium.Batched3DModel3DTileContent)) // TODO
            return;

        var featureArray = object._content._features;
        if (!Cesium.defined(featureArray))
            return;
        var objectId = featureArray[object._batchId].getProperty("id");

        var highlightColor = this._highlightedObjects[objectId];
        if (highlightColor) {
            if (!Cesium.defined(object.getProperty("originalColorValue"))) {
                object.setProperty("originalColorValue", Cesium.Color.clone(object.color));
            }
            object.color = highlightColor;
        }
    };

    CitydbI3SLayer.prototype.getObjectById = function (objectId) {
        var objects = [];
        var loadedTiles = this._tileset._selectedTiles;
        for (var i = 0; i < loadedTiles.length; i++) {
            if (!(loadedTiles[i]._content instanceof Cesium.Batched3DModel3DTileContent)) // TODO
                continue;

            var idArray = loadedTiles[i]._content.batchTable._properties.id;
            if (!Cesium.defined(idArray))
                break;

            var index = idArray.indexOf(objectId);
            if (index > -1 && Cesium.defined(loadedTiles[i]._content._features)) {
                var object = loadedTiles[i]._content._features[index];
                objects.push(object);
            }
        }
        return objects;
    };

    /**
     * undo highlighting
     */
    CitydbI3SLayer.prototype.unHighlight = function (toUnHighlight) {
        for (var k = 0; k < toUnHighlight.length; k++) {
            var id = toUnHighlight[k];
            delete this._highlightedObjects[id];
        }
        for (var k = 0; k < toUnHighlight.length; k++) {
            var id = toUnHighlight[k];
            var objects = this.getObjectById(id);
            for (var i = 0; i < objects.length; i++) {
                this.unHighlightObject(objects[i]);
            }
        }
        this._highlightedObjects = this._highlightedObjects;
    }

    CitydbI3SLayer.prototype.unHighlightObject = function (object) {
        var originalColor = object.getProperty("originalColorValue");
        object.color = originalColor;
    };

    /**
     * hideObjects
     */
    CitydbI3SLayer.prototype.hideObjects = function (toHide) {
        for (var i = 0; i < toHide.length; i++) {
            var objectId = toHide[i];
            if (!this.isInHiddenList(objectId)) {
                this._hiddenObjects.push(objectId);
            }
            var objects = this.getObjectById(objectId);
            for (var k = 0; k < objects.length; k++) {
                this.hideObject(objects[k]);
            }
        }
        this._hiddenObjects = this._hiddenObjects;
    }

    CitydbI3SLayer.prototype.hideObject = function (object) {
        object.show = false;
    };

    CitydbI3SLayer.prototype.isInHiddenList = function (objectId) {
        return this._hiddenObjects.indexOf(objectId) > -1 ? true : false;
    };

    CitydbI3SLayer.prototype.hasHiddenObjects = function () {
        return this._hiddenObjects.length > 0 ? true : false;
    };

    CitydbI3SLayer.prototype.isHiddenObject = function (object) {
        return object.show ? false : true;
    };

    CitydbI3SLayer.prototype.showAllObjects = function () {
        for (var k = 0; k < this._hiddenObjects.length; k++) {
            var objectId = this._hiddenObjects[k];
            var objects = this.getObjectById(objectId);
            for (var i = 0; i < objects.length; i++) {
                this.showObject(objects[i]);
            }
        }
        this._hiddenObjects = this._hiddenObjects;
        this._hiddenObjects = [];
    };

    CitydbI3SLayer.prototype.showObjects = function (toUnhide) {
        for (var k = 0; k < toUnhide.length; k++) {
            var objectId = toUnhide[k];
            this._hiddenObjects.splice(objectId, 1);
        }
        for (var k = 0; k < toUnhide.length; k++) {
            var objectId = toUnhide[k];
            var objects = this.getObjectById(objectId);
            for (var i = 0; i < objects.length; i++) {
                this.showObject(objects[i]);
            }
        }
        this._hiddenObjects = this._hiddenObjects;
    }

    CitydbI3SLayer.prototype.showObject = function (object) {
        object.show = true;
    }

    CitydbI3SLayer.prototype.unHighlightAllObjects = function () {
        for (var id in this._highlightedObjects) {
            delete this._highlightedObjects[id];
            var objects = this.getObjectById(id);
            for (var i = 0; i < objects.length; i++) {
                this.unHighlightObject(objects[i]);
            }
        }
        this._highlightedObjects = this._highlightedObjects;
    };

    CitydbI3SLayer.prototype.isInHighlightedList = function (objectId) {
        return this._highlightedObjects.hasOwnProperty(objectId);
    };

    /**
     * removes an Eventhandler
     * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
     */
    CitydbI3SLayer.prototype.removeEventHandler = function (event, callback) {
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
    CitydbI3SLayer.prototype.registerEventHandler = function (event, callback) {
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
    CitydbI3SLayer.prototype.triggerEvent = function (event, object) {
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
    window.CitydbI3SLayer = CitydbI3SLayer;
})();
