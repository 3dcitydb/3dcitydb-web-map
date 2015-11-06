

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

function B3DMLayer(options){
	this._url = options.url;
	this._id = options.id;
	this._name = options.name;
	this._region = options.region;
	this._highlightedObjects = {};
	this._highlightedObjectsLastUpdated = Date.now();
	this._highlightedObjectsOriginalColor = {};
	this._highlightedObjectsOriginalModels = {};
	//this._highlightedObjectsToRemove = [];
	this._active = false;
	this._hiddenObjects = {};
	this._hiddenObjectsModels = {};
	this._cameraPosition = {};

	this._style	= null;
	this._styleDirty = false;
	this._debugging = options["debugging"] ? options["debugging"] : false;

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
    active : {
        get : function(){
        	return this._active;
        }
    },
    /**
     * Gets the currently highlighted Objects as an array
     * @memberof 3DCityDBLayer.prototype
     * @type {Array}
     */
    highlightedObjects : {
        get : function(){
        	return this._highlightedObjects;
        }
    },
    /**
     * Gets the currently hidden Objects as an array
     * @memberof 3DCityDBLayer.prototype
     * @type {Array}
     */
    hiddenObjects : {
        get : function(){
        	return this._hiddenObjects;
        }
    },
    /**
     * Gets/Sets the CameraPosition.
     * @memberof DataSource.prototype
     * @type {Object}
     */
    cameraPosition : {
        get : function(){
        	return this._cameraPosition;
        },
        set : function(value){
        	this._cameraPosition = value;
        }
    },
    /**
     * Gets the url of the datasource
     * @memberof DataSource.prototype
     * @type {String}
     */
    url : {
        get : function(){
        	return this._url;
        }
    },
    /**
     * Gets the name of this datasource.
     * @memberof DataSource.prototype
     * @type {String}
     */
    name : {
        get : function(){
        	return this._name;
        }
    },
    /**
     * Gets the id of this datasource, the id should be unique.
     * @memberof DataSource.prototype
     * @type {String}
     */
    id : {
        get : function(){
        	return this._id;
        }
    },
    /**
     * Gets boundingbox of this layer as an Cesium Rectangle Object with longitude/latitude values in radians.
     * @memberof DataSource.prototype
     * @type {Cesium.Rectangle}
     */
    region : {
        get : function(){
        	return this._region;
        }
    }

});

/**
 * Whether to return the clicked feature itself or its (parent) top-level feature
 * @param {string} pickMode "toplevelfeature" | "clickedfeature"
 */
B3DMLayer.prototype.setClickPickMode = function(pickMode){
	if(pickMode == "toplevelfeature" || pickMode == "clickedfeature"){
		if(pickMode != this.clickPickMode){
			this.clickPickMode = pickMode;
		}
	}
};
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
/**
 * adds this layer to the given cesium viewer
 * @param {CesiumViewer} cesiumViewer
 */
B3DMLayer.prototype.addToCesium = function(cesiumViewer){
	this._cesium3DTileset = new Cesium.Cesium3DTileset({
    	url:this._url, //"http://PC205/temp/b3dm/tms",
    	maximumScreenSpaceError : 16,
    	debugShowStatistics : this._debugging,
    	debugFreezeFrame : false,
    	debugShowBox : this._debugging,
    	debugShowcontentBox : this._debugging,
    	debugShowBoundingVolume : this._debugging,
    	debugShowContentsBoundingVolume : this._debugging
    });
	cesiumViewer.scene.primitives.add(this._cesium3DTileset);
	var that = this;
	this._cesium3DTileset.tileVisible.addEventListener(function(tile){

		if(!tile.style_lastUpdated || tile.style_lastUpdated < that._styleLastUpdated){

			if(that._style instanceof Cesium.Color){
				if(tile.content instanceof Cesium.Batched3DModel3DTileContentProvider){
					tile.content.setAllColor(that._style);
				}
			}else if(isFunction(that._style)){
				var batchSize = tile.content.batchSize;
				for(var j = 0; j < batchSize; j++){
					model = tile.content.getModel(j);
					var color = that._style.call(null, model);
					if(color === false){
						model.show = false;
					}else{
						//model.show = true;
					}
					if (color){
						model.color = color;
					}
				}
			}
			tile["style_lastUpdated"] = Date.now();
		}
		if(!tile.b3dmlayer_LastUpdated || tile.b3dmlayer_LastUpdated < that._highlightedObjectsLastUpdated){
			if(tile.content instanceof Cesium.Batched3DModel3DTileContentProvider){
				var batchTable = tile.content.batchTable;
				var batchSize = tile.content.batchSize;
				var batchId = 0;
				var batchIds =[];
				var model = null;
				for(var i = 0; i < batchTable["subId"].length; i++){
					var id = batchTable["subId"][i];
					if(that._highlightedObjects[id]){
						// highlight
						batchId = i;
						batchIds =[];
						if(batchId >= batchSize){
							//var rootId = getRootId(batchTable, id);
							getBatchIdsByParentId(batchTable, batchSize, id, batchIds);
						} else{
							batchIds.push(batchId);
						}

						for(var j = 0; j < batchIds.length; j++){
							//var color = new Cesium.Color(1,1,1,1);
							model = tile.content.getModel(batchIds[j]);
							that._highlightedObjectsOriginalModels[id][batchIds[j]] = model;
							var color = model.color;
							if(!that._highlightedObjectsOriginalColor[id]){
								that._highlightedObjectsOriginalColor[id] = color.clone();
							}
							model.color = that._highlightedObjects[id];
						}
					}
				}
				for(var key in that._hiddenObjects){
					batchId = getFirstBatchIdByProperty(batchTable, "subId", key);
					if(batchId !== null){
						batchIds =[];
						if(batchId >= batchSize){
							var rootId = getRootId(batchTable, key);
							getBatchIdsByParentId(batchTable, batchSize, rootId, batchIds);
						} else{
							batchIds.push(batchId);
						}
						for(var k = 0; k < batchIds.length; k++){
							//var color = new Cesium.Color(1,1,1,1);
							model = tile.content.getModel(batchIds[k]);
							that._hiddenObjectsModels[key][batchIds[k]] = model;
							model.show = false;
						}
					}
				}

				tile["b3dmlayer_LastUpdated"] = Date.now();
			}
		}
		//console.log(tile);
	});
};

function getBatchIdsByParentId(batchTable, batchSize, pid, result){
	var propertyValues = batchTable["topId"];
    if(propertyValues){
    	var hasNoChildren = false;
    	var index = propertyValues.indexOf(pid);
    	if(index >= 0){
	        for(var i = index; i < propertyValues.length; i++){
	            if(pid == propertyValues[i]){
	            	if(i >= batchSize){
	            		var check = getBatchIdsByParentId(batchTable, batchSize, getPropertyByBatchId(batchTable, "subId", i), result);
	            		if(check === null){
	                		result.push(i);
	                	}
	            	}else{
	            		result.push(i);
	            	}

	            	hasNoChildren = true;
	            }
	        }
    	}
        if(!hasNoChildren){
        	return null;
        }
    }
    return result;
}

function getObjectForBatchId(batchTable, batchId){
	var jsonObject = {};
	jsonObject.id = getPropertyByBatchId(batchTable, "subId", batchId);
	jsonObject.type = getPropertyByBatchId(batchTable, "classId", batchId);
	jsonObject.batchId = batchId;
	jsonObject.attributes = {};
	for (var key in batchTable){
		if(batchTable[key] && batchTable[key][batchId] && key != "subId" && key != "topId" && key != "classId"){
			jsonObject.attributes[key] = batchTable[key][batchId];
		}
	}
	jsonObject.children = [];
	var childrenBatchIds = getBatchIdsByProperty(batchTable, "topId", jsonObject.id);
	for(var i = 0; i < childrenBatchIds.length; i++){
		var childBatchId = childrenBatchIds[i];
		jsonObject.children.push(getObjectForBatchId(batchTable, childBatchId));
	}
	return jsonObject;
}
function getObjectForId(batchTable, id){
	var batchId = getFirstBatchIdByProperty(batchTable, "subId", id);
	return getObjectForBatchId(batchTable, batchId);
}
function getBatchIdsByProperty(batchTable, property, value){
	var batchIds = [];
	var propertyValues = batchTable[property];
	if(propertyValues){
        for(var i = 0; i < propertyValues.length; i++){
            if(value == propertyValues[i]){
                batchIds.push(i);
            }
        }
    }
    return batchIds;
}

function getFirstBatchIdByProperty(batchTable, property, value){
	var i = batchTable[property].indexOf(value);
	if(i < 0){
		return null;
	}else{
		return i;
	}

}
function getPropertyByBatchId(batchTable, property, batchId){
	return batchTable[property][batchId];
}
function getRootId(batchTable, id){
	var pid = id;
	while(pid !== null){
		id = pid;
		var batchId = getFirstBatchIdByProperty(batchTable, "subId", id);
		pid = getPropertyByBatchId(batchTable,"topId", batchId);
	}
	return id;
}

/**
 * adds this layer to the given cesium viewer
 * @param {CesiumViewer} cesiumViewer
 */
B3DMLayer.prototype.removeFromCesium = function(cesiumViewer){
	cesiumViewer.scene.primitives.remove(this._cesium3DTileset);
};



/**
 * activates or deactivates the layer
 * @param {Boolean} value
 */
B3DMLayer.prototype.activate = function(active){
	if(this._cesium3DTileset){
		this._cesium3DTileset.show = active;
	}
};

/**
 * highlights one or more object with a given color;
 * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
 */
B3DMLayer.prototype.highlight = function(toHighlight){
	var highlightedObjects = this._highlightedObjects;
	var dirty = false;
	for (var id in toHighlight){
		if(!highlightedObjects[id]){
			highlightedObjects[id] = toHighlight[id];
			this._highlightedObjectsOriginalModels[id] = {};
			dirty = true;
		}
		delete toHighlight[id];
	}
	if(dirty){
		this._highlightedObjectsLastUpdated = Date.now();
	}
};

/**
 * undo highlighting
 * @param {Array<String>} A list of Object Ids. The default material will be restored
 */
B3DMLayer.prototype.unHighlight = function(toUnHighlight){
	for(var i = 0; i < toUnHighlight.length; i++){
		var id = toUnHighlight[i];
		if(this._highlightedObjects[id]){

			var models = this._highlightedObjectsOriginalModels[id];
			for (var batchId in models) { //j = 0; j < models.length; j++){
				if(this._highlightedObjectsOriginalColor[id]){
					models[batchId].color = this._highlightedObjectsOriginalColor[id];
				}
			}
			this._highlightedObjectsOriginalModels[id] = {};
			//delete this._highlightedObjectsOriginalModels[id];
			delete this._highlightedObjects[id];
			delete this._highlightedObjectsOriginalColor[id];
		}
	}
	//this._highlightedObjectsLastUpdated = Date.now();
};
/**
 * clear all current Highlighted Objects
 */
B3DMLayer.prototype.clearHighlight = function(){
	var toUnHighlight = [];
	for(var key in this._highlightedObjects){
		toUnHighlight.push(key);
	}
	this.unHighlight(toUnHighlight);
};


/**
 * hideObjects
 * @param {Array<String>} A list of Object Ids which will be hidden
 */
B3DMLayer.prototype.hideObjects = function(toHide){
	var hiddenObjects = this._hiddenObjects;
	var dirty = false;
	for (var i = 0; i < toHide.length; i++){
		if(!hiddenObjects[toHide[i]]){
			hiddenObjects[toHide[i]] = true;
			this._hiddenObjectsModels[toHide[i]] = {};
			dirty = true;
		}
		//delete toHide[toHide[i]];
	}
	if(dirty){
		this._highlightedObjectsLastUpdated = Date.now();
	}
};


/**
 * showObjects, to undo hideObjects
 * @param {Array<String>} A list of Object Ids which will be unhidden.
 */
B3DMLayer.prototype.showObjects = function(toUnhide){
	for(var i = 0; i < toUnhide.length; i++){
		var id = toUnhide[i];
		if(this._hiddenObjects[id]){

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
B3DMLayer.prototype.removeEventHandler = function(event, callback){
	if(event == "CLICK"){
		this._clickEvent.removeEventListener(callback, this);
	}else if(event == "CTRLCLICK"){
		this._ctrlclickEvent.removeEventListener(callback, this);
	}else if(event == "MOUSEIN"){
		this._mouseInEvent.removeEventListener(callback, this);
	}else if(event == "MOUSEOUT"){
		this._mouseOutEvent.removeEventListener(callback, this);
	}
};

/**
 * adds an Eventhandler
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {function} callback function to be called
 * @return {String} id of the event Handler, can be used to remove the event Handler
 */
B3DMLayer.prototype.registerEventHandler = function(event, callback){
	if(event == "CLICK"){
		this._clickEvent.addEventListener(callback, this);
	}else if(event == "CTRLCLICK"){
		this._ctrlclickEvent.addEventListener(callback, this);
	}else if(event == "MOUSEIN"){
		this._mouseInEvent.addEventListener(callback, this);
	}else if(event == "MOUSEOUT"){
		this._mouseOutEvent.addEventListener(callback, this);
	}
};

/**
 * triggers an Event
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {*} arguments, any number of arguments
 */
B3DMLayer.prototype.triggerEvent = function(event, object){
	var objectId = object.getProperty("subId");
	var batchTable = object._content.batchTable;
	var batchSize =  object._content.batchSize;
	if(this.clickPickMode === "toplevelfeature"){
		objectId = getRootId(batchTable, objectId);
	}
	var JSONObject;
	if(event == "CLICK"){
		JSONobject = getObjectForId(batchTable, objectId);
		this._clickEvent.raiseEvent(objectId, JSONobject);
	}else if(event == "CTRLCLICK"){
		if (this.clickPickMode !== "toplevelfeature" && this.ctrlclickPickMode == "toplevelfeature"){
			 objectId = getRootId(batchTable, objectId);
		}
		JSONobject = getObjectForId(batchTable, objectId);
		this._ctrlclickEvent.raiseEvent(objectId, JSONobject);
	}else if(event == "MOUSEIN"){
		if(this.mouseMoveId != objectId){
			this.mouseMoveId = objectId;
			this._mouseInEvent.raiseEvent(objectId);
		}
	}else if(event == "MOUSEOUT"){
		if(this.mouseMoveId == objectId){
			this.mouseMoveId = null;
			this._mouseOutEvent.raiseEvent(objectId);
		}
	}
};

/**
 * sets the Style for the whole layer
 * @param {Cesium.Color | Function} a cesium color, or a function which returns a cesium color
 */
B3DMLayer.prototype.setStyle = function(color){
	this._style = color;
	this._styleLastUpdated = Date.now();
};
