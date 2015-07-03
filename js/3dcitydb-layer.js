

/**
 * Defines the interface for a 3DCityDBLayer. This Object is an interface for
 * documentation purpose and is not intended to be instantiated directly.
 *
 * @alias Layer3DCityDB
 * @constructor
 *
 * @param {Object} [options] Object with the following properties:
 * @param {String} [options.url] url to the layer data
 * @param {String} [options.id] id of this layer 
 * @param {String} [options.name] name of this layer 
 * @param {String} [options.region] region/bbox  of this layer Cesium.Rectangle 
 *
 */

function Layer3DCityDB(options){
	/** 
	 * @type {Boolean}
	 * if the layer is currently active
	 */
	this._active = false;
	/** 
	 * @type {Array}
	 * HashMap of currently highlighted objects (objectid, color);
	 */
	this._highlightedObjects = {};
	/** 
	 * @type {Array} 
	 * list of currently hidden Objects
	 */
	this._hiddenObjects = [];
	/**
	 * @type {Array}
	 * list of eventhandler.
	 */
	this._eventhandler = [];
	/** 
	 * @type {Object} cameraPosition Object
	 * see https://github.com/AnalyticalGraphicsInc/cesium/blob/1.11/Source/Scene/Camera.js#L2353 for options.
	 */
	this._cameraPosition = {};
	/** 
	 * @type {String} url
	 */
	this._url = options.url;
	/**
	 * @type {String} name of the layer
	 */
	this._name = options.name;
	/**
	 * @type {String} id of this layer
	 * if not set by a given value an uuid is created
	 */
	this._id = options.id ? options.id : Cesium.createGuid();
	/**
	 * @type {Cesium.Rectangle} region of the whole layer
	 */
	this._region = options.region;
		
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

defineProperties(Layer3DCityDB.prototype, {
    /**
     * returns if the layer is currently active
     * @memberof Layer3DCityDB.prototype
     * @type {Boolean}
     */
    active : {
        get : throw InstantiationError
    },
    /**
     * Gets the currently highlighted Objects as an object hashmap {objectid, color}
     * @memberof Layer3DCityDB.prototype
     * @type {Object}
     */
    highlightedObjects : {
        get : throw InstantiationError
    },
    /**
     * Gets the currently hidden Objects as an array
     * @memberof Layer3DCityDB.prototype
     * @type {Array}
     */
    hiddenObjects : {
        get : throw InstantiationError
    },
    /**
     * Gets/Sets the CameraPosition.
     * @memberof Layer3DCityDB.prototype
     * @type {Object}
     * see https://github.com/AnalyticalGraphicsInc/cesium/blob/1.11/Source/Scene/Camera.js#L2353 for options.
     */
    cameraPosition : {
        get : throw InstantiationError,
        set : throw InstantiationError
    },
    /**
     * Gets the url of the layer
     * @memberof Layer3DCityDB.prototype
     * @type {String}
     */
    url : {
        get : throw InstantiationError
    },
    /**
     * Gets the name of this layer.
     * @memberof Layer3DCityDB.prototype
     * @type {String}
     */
    name : {
        get : throw InstantiationError
    },
    /**
     * Gets the id of this layer, the id should be unique.
     * @memberof Layer3DCityDB.prototype
     * @type {String}
     */
    id : {
        get : throw InstantiationError
    }
    /**
     * Gets region/bbox of this layer as an Cesium Rectangle Object with longitude/latitude values in radians. 
     * @memberof Layer3DCityDB.prototype
     * @type {Cesium.Rectangle}
     */
    region : {
        get : throw InstantiationError
    }
    
});

/**
 * activates or deactivates the layer
 * @param {Boolean} value
 */
Layer3DCityDB.prototype.activate = throw InstantiationError;

/**
 * highlights one or more object with a given color;
 * @param {Object<String, Cesium.Color>} An object hashMap with the objectId and a cesium Color
 */
Layer3DCityDB.prototype.highlight = throw InstantiationError;

/**
 * undo highlighting
 * @param {Array<String>} A list of Object Ids. The default material will be restored
 */
Layer3DCityDB.prototype.unHighlight = throw InstantiationError;

/**
 * hideObjects
 * @param {Array<String>} A list of Object Ids which will be hidden
 */
Layer3DCityDB.prototype.hideObjects = throw InstantiationError;

/**
 * showObjects, to undo hideObjects
 * @param {Array<String>} A list of Object Ids which will be unhidden. 
 */
Layer3DCityDB.prototype.showObjects = throw InstantiationError;

/**
 * removes an Eventhandler
 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
 * @param {function} callback function to be called
 */
Layer3DCityDB.prototype.removeEventHandler = function(event, callback){
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
Layer3DCityDB.prototype.registerEventHandler = function(event, callback){
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
 * @param {Object} cesium object. Scene.pick result. 
 */
Layer3DCityDB.prototype.triggerEvent = function(event, object){	
	// get Object id from object
	if(event == "CLICK"){
		this._clickEvent.raiseEvent(objectId);
	}else if(event == "MOUSEIN"){
		this._mouseInEvent.raiseEvent(objectId);
	}else if(event == "MOUSEOUT"){
		this._mouseOutEvent.raiseEvent(objectId);
	}
}

/**
 * zooms to the layer cameraPostion
 */
Layer3DCityDB.prototype.zoomToStartPosition = throw InstantiationError;
























