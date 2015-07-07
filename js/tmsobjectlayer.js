

/**
 * Defines the interface for a 3DCityDBLayer. This Object is an interface for
 * documentation purpose and is not intended to be instantiated directly.
 *
 * @alias TMSObjectLayer
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

function TMSObjectLayer(options){	
	this._url = options.url;
	this._id = options.id;
	this._name = options.name;
	this._region = options.region;
	this._highlightedObjects = [];
	this._active = false;
	this._hiddenObjects = [];
	this._cameraPosition = {};	
	this._maxLevel = options.maxLevel;	
	this._minLevel = options.minLevel;
	this._tileProvider = new TMSObjectTileProvider(options);
	/**
	 * handles ClickEvents
	 * @type {Cesium.Event} clickEvent
	 */
	this._clickEvent = new Cesium.Event();
	
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
}

Object.defineProperties(TMSObjectLayer.prototype, {
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
 * adds this layer to the given cesium viewer
 * @param {CesiumViewer} cesiumViewer
 */
TMSObjectLayer.prototype.addToCesium = function(cesiumViewer){
	this._quadTreePrimitive = new Cesium.QuadtreePrimitive({
		tileProvider:this._tileProvider, 
		tileCacheSize : 500,
		maximumScreenSpaceError: 2
	});
	cesiumViewer.scene.primitives.add(this._quadTreePrimitive);
}

/**
 * adds this layer to the given cesium viewer
 * @param {CesiumViewer} cesiumViewer
 */
TMSObjectLayer.prototype.removeFromCesium = function(cesiumViewer){
	cesiumViewer.scene.primitives.remove(this._quadTreePrimitive);
}



/**
 * activates or deactivates the layer
 * @param {Boolean} value
 */
TMSObjectLayer.prototype.activate = function(active){

}

/**
 * highlights one or more object with a given color;
 * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
 */
TMSObjectLayer.prototype.highlight = function(values){
	
}

/**
 * undo highlighting
 * @param {Array<String>} A list of Object Ids. The default material will be restored
 */
TMSObjectLayer.prototype.unHighlight = null;

/**
 * hideObjects
 * @param {Array<String>} A list of Object Ids which will be hidden
 */
TMSObjectLayer.prototype.hideObjects = null;

/**
 * showObjects, to undo hideObjects
 * @param {Array<String>} A list of Object Ids which will be unhidden. 
 */
TMSObjectLayer.prototype.showObjects = null;

/**
 * removes an Eventhandler
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {function} callback function to be called
 */
TMSObjectLayer.prototype.removeEventHandler = function(event, callback){
	if(event == "CLICK"){
		this._clickEvent.removeEventListener(callback, this);
	}else if(event == "MOUSEIN"){
		this._mouseInEvent.removeEventListener(callback, this);
	}else if(event == "MOUSEOUT"){
		this._mouseOutEvent.removeEventListener(callback, this);
	}
}

/**
 * adds an Eventhandler
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {function} callback function to be called
 * @return {String} id of the event Handler, can be used to remove the event Handler
 */
TMSObjectLayer.prototype.registerEventHandler = function(event, callback){
	if(event == "CLICK"){
		this._clickEvent.addEventListener(callback, this);
	}else if(event == "MOUSEIN"){
		this._mouseInEvent.addEventListener(callback, this);
	}else if(event == "MOUSEOUT"){
		this._mouseOutEvent.addEventListener(callback, this);
	}
}

/**
 * triggers an Event
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {*} arguments, any number of arguments
 */
TMSObjectLayer.prototype.triggerEvent = function(event, object){
	var objectId = object.node.id;
	if(event == "CLICK"){
		this._clickEvent.raiseEvent(objectId);
	}else if(event == "MOUSEIN"){
		this._mouseInEvent.raiseEvent(objectId);
	}else if(event == "MOUSEOUT"){
		this._mouseOutEvent.raiseEvent(objectId);
	}
}



























