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
 * Defines an Wrapper around the .
 *
 * @alias B3DMLayer
 * @constructor
 *
 * @param {Object} [options] Object with the following properties:
 * @param {String} [options.url] url to the layer data
 * @param {String} [options.id] id of this layer
 * @param {String} [options.name] name of this layer
 * @param {String} [options.region] boundingbox  of this layer Cesium.Rectangle
 * @param {Number} [options.minLevel] minLevel
 * @param {Number} [options.maxLevel] maxLevel
 *
 */

function B3DMLayer(options) {
    this._url = Cesium.appendForwardSlash(options.url);
    this._id = options.id;
    this._name = options.name;
    this._region = options.region;
    this._highlightedObjects = {};
    this._lastUpdated = Date.now();
    this._styleLastUpdated = Date.now();
    this._highlightedObjectsOriginalColor = {};
    this._highlightedObjectsOriginalModels = {};
    //this._highlightedObjectsToRemove = [];
    this._active = false;
    this._hiddenObjects = {};
    this._hiddenObjectsModels = {};
    this._cameraPosition = {};
    this._allowPicking = (typeof options["allowPicking"] != 'undefined') ? options["allowPicking"] : true;
    this._styleDirty = false;

    this._style = options.style;
    this._debugging = options["debugging"] ? options["debugging"] : false;
    this._maximumScreenSpaceError = options["screenSpaceError"] ? options["screenSpaceError"] : 16;

    /**
     * handles ClickEvents
     * @type {Cesium.Event} clickEvent
     */
    this._clickEvent = new Cesium.Event();

    /**
     * handles ClickEvents
     * @type {Cesium.Event} clickEvent
     */
    this._ctrlclickEvent = new Cesium.Event();

    /**
     * handles ClickEvents
     * @type {Cesium.Event} clickEvent
     */
    this._mouseInEvent = new Cesium.Event();

    /**
     * handles ClickEvents
     * @type {Cesium.Event} clickEvent
     */
    this._mouseOutEvent = new Cesium.Event();

    /** pickmode can be toplevelfeature or clickedfeature */
    this.clickPickMode = "toplevelfeature";

    /** pickmode can be toplevelfeature or clickedfeature */
    this.ctrlclickPickMode = "toplevelfeature";

}


Object.defineProperties(B3DMLayer.prototype, {
    /**
     * Gets the active
     * @memberof 3DCityDBLayer.prototype
     * @type {Boolean}
     */
    active: {
        get: function () {
            return this._active;
        }
    },
    /**
     * Gets the currently highlighted Objects as an array
     * @memberof 3DCityDBLayer.prototype
     * @type {Array}
     */
    highlightedObjects: {
        get: function () {
            return this._highlightedObjects;
        }
    },
    /**
     * Gets the currently hidden Objects as an array
     * @memberof 3DCityDBLayer.prototype
     * @type {Array}
     */
    hiddenObjects: {
        get: function () {
            return this._hiddenObjects;
        }
    },
    /**
     * Gets/Sets the CameraPosition.
     * @memberof DataSource.prototype
     * @type {Object}
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
     * @memberof DataSource.prototype
     * @type {String}
     */
    url: {
        get: function () {
            return this._url;
        }
    },
    /**
     * Gets the name of this datasource.
     * @memberof DataSource.prototype
     * @type {String}
     */
    name: {
        get: function () {
            return this._name;
        }
    },
    /**
     * Gets the id of this datasource, the id should be unique.
     * @memberof DataSource.prototype
     * @type {String}
     */
    id: {
        get: function () {
            return this._id;
        }
    },
    /**
     * Gets boundingbox of this layer as an Cesium Rectangle Object with longitude/latitude values in radians.
     * @memberof DataSource.prototype
     * @type {Cesium.Rectangle}
     */
    region: {
        get: function () {
            return this._region;
        }
    },
    /**
     * Gets the style of this layer can be a function or a Cesium.Color
     * @memberof DataSource.prototype
     * @type  {Cesium.Color | Function}
     */
    style: {
        get: function () {
            return this._style;
        }
    },
    maximumScreenSpaceError : {
        get : function(){
            return this._cesium3DTileset.maximumScreenSpaceError
        },
        set: function (value) {
            this._cesium3DTileset.maximumScreenSpaceError = value;
        }
    }

});

/**
 * Whether to return the clicked feature itself or its (parent) top-level feature
 * @param {string} pickMode "toplevelfeature" | "clickedfeature"
 */
B3DMLayer.prototype.setClickPickMode = function (pickMode) {
    if (pickMode == "toplevelfeature" || pickMode == "clickedfeature") {
        if (pickMode != this.clickPickMode) {
            this.clickPickMode = pickMode;
        }
    }
};
B3DMLayer.isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
/**
 * adds this layer to the given cesium viewer
 * @param {CesiumViewer} cesiumViewer
 */
B3DMLayer.prototype.addToCesium = function (cesiumViewer) {
    this._cesium3DTileset = new Cesium.Cesium3DTileset({
        url: this._url, //"http://PC205/temp/b3dm/tms",
        maximumScreenSpaceError: this._maximumScreenSpaceError,
        debugShowStatistics: this._debugging,
        debugFreezeFrame: false,
        debugShowBox: this._debugging,
        debugShowcontentBox: this._debugging,
        debugShowBoundingVolume: this._debugging,
        debugShowContentsBoundingVolume: this._debugging
    });
    this._cesium3DTileset.modelOptions = {"incrementallyLoadTextures": false, "allowPicking":this._allowPicking};
    cesiumViewer.scene.primitives.add(this._cesium3DTileset);
    var that = this;

    this._cesium3DTileset.tileVisible.addEventListener(function (tile) {

        var color;

        if (tile.content instanceof Cesium.Batched3DModel3DTileContent) {

            if (!tile._lastUpdated || tile._lastUpdated < that._lastUpdated) {

                var batchTable = tile.content._batchTableResources.batchTable;
                var batchSize = tile.content._batchTableResources.featuresLength;

                // First: styling of the complete layer either by a single color or a function (attribute values -> colors)
                if (!tile._lastUpdated ||  tile._lastUpdated < that._styleLastUpdated) {
                    // only if the style actually changed
                    var model;
                    if (that._style instanceof Cesium.Color) {
                        tile.content._batchTableResources.setAllColor(that._style);
                    } else if (B3DMLayer.isFunction(that._style)) {
                        batchSize = tile.content.featuresLength;
                        for (var j = 0; j < batchSize; j++) {
                            model = tile.content.getFeature(j);
                            var jsonObject = B3DMLayer.getObjectForBatchId(batchTable, j, true);
                            color = that._style.call(null, jsonObject, B3DMLayer.bindBatchTableToFunction(B3DMLayer.getAttributesFromParent, batchTable));
                            if (color === false) {
                                model.show = false;
                            } else {
                                //model.show = true;
                            }
                            if (color) {
                                model.color = color;
                            }
                        }
                    }
                }

                // Second: Highlighting of individual objects
                var batchIdsToHighlight = [];
                var currentModel, currentColor;
                batchTable["id"].forEach(function (id, batchId) {
                    if (that._highlightedObjects[id]) {
                        // Highlight object with "id" and "batchId"
                        batchIdsToHighlight = [];
                        if (batchId >= batchSize) {
                            // clicked object is sub-element of object to highlight -> get all other sub-elements
                            batchIdsToHighlight = B3DMLayer.getGeometryBatchIdsOfChildrenByBatchId(batchTable, batchSize, batchId);
                        } else {
                            batchIdsToHighlight.push(batchId);
                        }

                        batchIdsToHighlight.forEach(function (batchId) {
                            //Copy original model
                            currentModel = tile.content.getFeature(batchId);
                            that._highlightedObjectsOriginalModels[id][batchId] = currentModel;

                            //Copy current color if not yet set
                            currentColor = currentModel.color;
                            if (!that._highlightedObjectsOriginalColor[id]) {
                                that._highlightedObjectsOriginalColor[id] = {};
                            }
                            if (!that._highlightedObjectsOriginalColor[id][batchId] || that._styleLastUpdated > tile._lastUpdated) {
                                // only set the original color if not yet set OR reset the original color if the style has changed.
                                // otherwise the blue is overwriting the original color in the second run
                                that._highlightedObjectsOriginalColor[id][batchId] = currentColor.clone();
                            }

                            //Set new color
                            currentModel.color = that._highlightedObjects[id];
                        }, that);
                    }
                }, that);

                // Third: hiding of individual objects
                var batchId, batchIdsToHide;
                for (var hiddenObjectId in that._hiddenObjects) {
                    batchId = B3DMLayer.getFirstBatchIdByProperty(batchTable, "id", hiddenObjectId);
                    if (batchId !== null) {
                        batchIdsToHide = [];
                        if (batchId >= batchSize) {
                            batchIdsToHide = B3DMLayer.getGeometryBatchIdsOfChildrenByBatchId(batchTable, batchSize, batchId);
                        } else {
                            batchIdsToHide.push(batchId);
                        }
                        batchIdsToHide.forEach(function (batchId) {
                            model = tile.content.getFeature(batchId);
                            that._hiddenObjectsModels[hiddenObjectId][batchId] = model;
                            model.show = false;
                        }, that);
                    }
                }

                tile["_lastUpdated"] = Date.now();

            }
        }
    });

};

B3DMLayer.bindBatchTableToFunction = function(func, batchTable) {
    return function (jsonObject) {
        return func.call(this, batchTable, jsonObject);
    };
}

B3DMLayer.getAttributesFromParent = function(batchTable, jsonObject) {
    var parentBatchId = jsonObject.parentPosition || -1;
    if (parentBatchId !== -1) {
        return B3DMLayer.getObjectForBatchId(batchTable, parentBatchId, true);
    } else {
        return null;
    }
}

B3DMLayer.getObjectForBatchId = function(batchTable, batchId, skipChildren) {
    var jsonObject = {};
    jsonObject.id = B3DMLayer.getPropertyByBatchId(batchTable, "id", batchId);
    jsonObject.type = B3DMLayer.getPropertyByBatchId(batchTable, "classId", batchId);
    jsonObject.batchId = batchId;
    jsonObject.attributes = {};
    jsonObject.children = [];
    if (batchTable.attributes && batchTable.attributes[batchId]) {
        if (batchTable.attributes.attributes) {
            // JSON style attributes in B3DM
            jsonObject.attributes = batchTable.attributes.attributes[batchId];
        } else {
            // Flat hierarchy attributes in B3DM
            jsonObject.attributes = batchTable.attributes[batchId];
        }
    }
    if (batchTable.parentPosition && batchTable.parentPosition[batchId]) {
        jsonObject.parentPosition = batchTable.parentPosition[batchId];
    }
    jsonObject.attributes["gmlId"] = jsonObject.id;
    if (jsonObject.attributes.Address) {
        var address = jsonObject.attributes.Address;
        var addressJsonObject = {
            // this has to be replaced with the id in the future
            id: "Address",
            type: "_1",
            batchId: null,
            attributes: address,
            children: []
        };
        jsonObject.children.push(addressJsonObject);
    }
    /*
     if (jsonObject.attributes.vcs_Addresses){
     var address;
     var addressJsonObject;
     for (var i = 0; i < jsonObject.attributes.vcs_Addresses[i].length; i++){
     address = jsonObject.attributes.vcs_Addresses[i];
     addressJsonObject.id = null;
     addressJsonObject.type = "-1";
     addressJsonObject.batchId = null;
     addressJsonObject.attributes = address;
     jsonObject.children.push(addressJsonObject);
     }
     }
     */
    if (skipChildren) {
        return jsonObject;
    } else {
        var childrenBatchIds = B3DMLayer.getBatchIdsOfChildrenByBatchId(batchTable, jsonObject.batchId);
        for (var i = 0; i < childrenBatchIds.length; i++) {
            var childBatchId = childrenBatchIds[i];
            jsonObject.children.push(B3DMLayer.getObjectForBatchId(batchTable, childBatchId));
        }
        return jsonObject;
    }
}

B3DMLayer.getObjectForId = function(batchTable, id) {
    var batchId = B3DMLayer.getFirstBatchIdByProperty(batchTable, "id", id);
    return B3DMLayer.getObjectForBatchId(batchTable, batchId);
}

B3DMLayer.getBatchIdsOfChildrenByBatchId = function(batchTable, batchId) {
    // TODO this only gets the batchids of one level higher.. not recursively yet!
    var batchIds = [];
    var parentBatchIds = batchTable["parentPosition"];
    if (parentBatchIds) {
        for (var i = 0; i < parentBatchIds.length; i++) {
            if (parentBatchIds[i] === batchId) {
                batchIds.push(i);
            }
        }
    }
    return batchIds;
}

B3DMLayer.getGeometryBatchIdsOfChildrenByBatchId = function(batchTable, batchSize, batchId) {
    var batchIds = [];
    var parentBatchIds = [batchId];
    if (batchTable["parentPosition"]) {
        for (var i = batchTable["parentPosition"].length - 1; i >= 0; i--) {
            for (var j = 0; j < parentBatchIds.length; j++) {
                if (batchTable["parentPosition"][i] === parentBatchIds[j]) {
                    if (i >= batchSize) {
                        parentBatchIds.push(i);
                    } else {
                        batchIds.push(i);
                    }
                }
            }

        }
    }
    return batchIds;
}

B3DMLayer.getBatchIdsByProperty = function(batchTable, property, value) {
    var batchIds = [];
    var propertyValues = batchTable[property];
    if (propertyValues) {
        for (var i = 0; i < propertyValues.length; i++) {
            if (value == propertyValues[i]) {
                batchIds.push(i);
            }
        }
    }
    return batchIds;
}

B3DMLayer.getFirstBatchIdByProperty = function(batchTable, property, value) {
    var i = batchTable[property].indexOf(value);
    if (i < 0) {
        return null;
    } else {
        return i;
    }

}
B3DMLayer.getPropertyByBatchId = function(batchTable, property, batchId) {
    return batchTable[property][batchId];
}
B3DMLayer.getRootId = function(batchTable, id) {
    var parentBatchId;
    var batchId = B3DMLayer.getFirstBatchIdByProperty(batchTable, "id", id);
    parentBatchId = batchTable.parentPosition[batchId];
    while (parentBatchId !== -1) {
        batchId = parentBatchId;
        parentBatchId = batchTable.parentPosition[batchId];
    }
    return batchTable.id[batchId];
}

/**
 * adds this layer to the given cesium viewer
 * @param {CesiumViewer} cesiumViewer
 */
B3DMLayer.prototype.removeFromCesium = function (cesiumViewer) {
    cesiumViewer.scene.primitives.remove(this._cesium3DTileset);
};


/**
 * activates or deactivates the layer
 * @param {Boolean} value
 */
B3DMLayer.prototype.activate = function (active) {
    if (this._cesium3DTileset) {
        this._cesium3DTileset.show = active;
    }
};

/**
 * highlights one or more object with a given color;
 * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
 */
B3DMLayer.prototype.highlight = function (toHighlight) {
    var highlightedObjects = this._highlightedObjects;
    var dirty = false;
    for (var id in toHighlight) {
        if (!highlightedObjects[id]) {
            highlightedObjects[id] = toHighlight[id];
            this._highlightedObjectsOriginalModels[id] = {};
            dirty = true;
        }
        //delete toHighlight[id];
    }
    if (dirty) {
        this._lastUpdated = Date.now();
    }
};

/**
 * undo highlighting
 * @param {Array<String>} A list of Object Ids. The default material will be restored
 */
B3DMLayer.prototype.unHighlight = function (toUnHighlight) {
    for (var i = 0; i < toUnHighlight.length; i++) {
        var id = toUnHighlight[i];
        if (this._highlightedObjects[id]) {

            var models = this._highlightedObjectsOriginalModels[id];
            for (var batchId in models) { //j = 0; j < models.length; j++){
                if (this._highlightedObjectsOriginalColor[id] && !models[batchId]._batchTableResources.isDestroyed()) {
                    models[batchId].color = this._highlightedObjectsOriginalColor[id][batchId];
                }
            }
            this._highlightedObjectsOriginalModels[id] = {};
            // the next line was commented out, couldnt see why so removed comment
            delete this._highlightedObjectsOriginalModels[id];
            delete this._highlightedObjects[id];
            delete this._highlightedObjectsOriginalColor[id];
        }
    }
    //this._lastUpdated = Date.now();
};
/**
 * clear all current Highlighted Objects
 */
B3DMLayer.prototype.clearHighlight = function () {
    var toUnHighlight = [];
    for (var key in this._highlightedObjects) {
        toUnHighlight.push(key);
    }
    this.unHighlight(toUnHighlight);
};


/**
 * hideObjects
 * @param {Array<String>} A list of Object Ids which will be hidden
 */
B3DMLayer.prototype.hideObjects = function (toHide) {
    var hiddenObjects = this._hiddenObjects;
    var dirty = false;
    for (var i = 0; i < toHide.length; i++) {
        if (!hiddenObjects[toHide[i]]) {
            hiddenObjects[toHide[i]] = true;
            this._hiddenObjectsModels[toHide[i]] = {};
            dirty = true;
        }
        //delete toHide[toHide[i]];
    }
    if (dirty) {
        this._lastUpdated = Date.now();
    }
};


/**
 * showObjects, to undo hideObjects
 * @param {Array<String>} A list of Object Ids which will be unhidden.
 */
B3DMLayer.prototype.showObjects = function (toUnhide) {
    for (var i = 0; i < toUnhide.length; i++) {
        var id = toUnhide[i];
        if (this._hiddenObjects[id]) {

            var models = this._hiddenObjectsModels[id];
            for (var batchId in models) { //j = 0; j < models.length; j++){
                models[batchId].show = true;
            }
            this._hiddenObjectsModels[id] = {};
            //delete this._hiddenObjectsModels[id];
            delete this._hiddenObjects[id];
        }
    }
};


/**
 * removes an Eventhandler
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {function} callback function to be called
 */
B3DMLayer.prototype.removeEventHandler = function (event, callback) {
    if (event == "CLICK") {
        this._clickEvent.removeEventListener(callback, this);
    } else if (event == "CTRLCLICK") {
        this._ctrlclickEvent.removeEventListener(callback, this);
    } else if (event == "MOUSEIN") {
        this._mouseInEvent.removeEventListener(callback, this);
    } else if (event == "MOUSEOUT") {
        this._mouseOutEvent.removeEventListener(callback, this);
    }
};

/**
 * adds an Eventhandler
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {function} callback function to be called
 * @return {String} id of the event Handler, can be used to remove the event Handler
 */
B3DMLayer.prototype.registerEventHandler = function (event, callback) {
    if (event == "CLICK") {
        this._clickEvent.addEventListener(callback, this);
    } else if (event == "CTRLCLICK") {
        this._ctrlclickEvent.addEventListener(callback, this);
    } else if (event == "MOUSEIN") {
        this._mouseInEvent.addEventListener(callback, this);
    } else if (event == "MOUSEOUT") {
        this._mouseOutEvent.addEventListener(callback, this);
    }
};

/**
 * triggers an Event
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {*} arguments, any number of arguments
 */
B3DMLayer.prototype.triggerEvent = function (event, object) {
    var objectId = object.getProperty("id");
    var batchTable = object._batchTableResources.batchTable;
    var batchSize = object._batchTableResources.featuresLength;
    if (this.clickPickMode === "toplevelfeature") {
        objectId = B3DMLayer.getRootId(batchTable, objectId);
    }
    var JSONobject;
    if (event == "CLICK") {
        JSONobject = B3DMLayer.getObjectForId(batchTable, objectId);
        JSONobject.clickedPosition = object.clickedPosition ? object.clickedPosition : {};
        this._clickEvent.raiseEvent(objectId, JSONobject);
    } else if (event == "CTRLCLICK") {
        if (this.clickPickMode !== "toplevelfeature" && this.ctrlclickPickMode == "toplevelfeature") {
            objectId = B3DMLayer.getRootId(batchTable, objectId);
        }
        JSONobject = B3DMLayer.getObjectForId(batchTable, objectId);
        JSONobject.clickedPosition = object.clickedPosition ? object.clickedPosition : {};
        this._ctrlclickEvent.raiseEvent(objectId, JSONobject);
    } else if (event == "MOUSEIN") {
        if (this.mouseMoveId != objectId) {
            this.mouseMoveId = objectId;
            this._mouseInEvent.raiseEvent(objectId);
        }
    } else if (event == "MOUSEOUT") {
        if (this.mouseMoveId == objectId) {
            this.mouseMoveId = null;
            this._mouseOutEvent.raiseEvent(objectId);
        }
    }
};

/**
 * sets the Style for the whole layer
 * @param {Cesium.Color | Function} a cesium color, or a function which returns a cesium color
 */
B3DMLayer.prototype.setStyle = function (color) {
    this._style = color;
    this._lastUpdated = Date.now();
    this._styleLastUpdated = Date.now();
};
