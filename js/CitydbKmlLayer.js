
/**
 * Defines the interface for a 3DCityDBLayer. This Object is an interface for
 * documentation purpose and is not intended to be instantiated directly.
 *
 * @alias CitydbKmlLayer
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
(function() {
	function CitydbKmlLayer(options){	
		this._url = options.url;
		this._id = options.id;
		this._name = options.name;
		this._region = options.region;
		this._highlightedObjects = {};
		this._active = true;
		this._hiddenObjects = [];
		this._cameraPosition = {};	
		this._cesiumViewer = null;
		this._jsonLayerInfo = null;
		this._citydbKmlDataSource = new CitydbKmlDataSource(this._id);
		this._citydbKmlLayerManager = new CitydbKmlLayerManager(this);
		
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

	Object.defineProperties(CitydbKmlLayer.prototype, {
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
	    },
	    
	    cesiumViewer : {
	        get : function(){
	        	return this._cesiumViewer;
	        }
	    },
	    
	    jsonLayerInfo : {
	        get : function(){
	        	return this._jsonLayerInfo;
	        }
	    },
	    
	    citydbKmlDataSource : {
	        get : function(){
	        	return this._citydbKmlDataSource;
	        }
	    },
	    
	    citydbKmlLayerManager : {
	        get : function(){
	        	return this._citydbKmlLayerManager;
	        }
	    }
	    
	});


	/**
	 * adds this layer to the given Cesium viewer
	 * @param {CesiumViewer} cesiumViewer
	 */
	CitydbKmlLayer.prototype.addToCesium = function(cesiumViewer){
		this._cesiumViewer = cesiumViewer;
		var that = this;
		if (this._url.indexOf(".json") >= 0) {	    		
			jQuery.noConflict().ajax({		    	
		        url: that._url +'?jsoncallback=?',   
		        dataType: "jsonp",
		        jsonpCallback: "handle_3DCityDB_data", // the function name was defined by 3DCityDB KML/collada Exporter
		        timeout: 30000, // timeout in order to trigger the JQuery ajax error callback function
		        success: function(json, status){		        	
		        	that._citydbKmlDataSource._name = json.layername;	
		        	that._citydbKmlDataSource._proxy = json;
		    		console.log(that._citydbKmlDataSource);
		    		cesiumViewer.dataSources.add(that._citydbKmlDataSource);
		            that._citydbKmlLayerManager.doStart();
		        },
		        error: function(XHR, textStatus, errorThrown){
		        	console.log('can not find the json file for ' + kmlUrl);
		        }
		    });	
    	}
		else {
			this._citydbKmlDataSource.load(this._url).then(function() {
				console.log(that._citydbKmlDataSource);
				cesiumViewer.dataSources.add(that._citydbKmlDataSource);
				that._citydbKmlLayerManager.doStart();
		    });
		}		
	}

	/**
	 * adds this layer to the given cesium viewer
	 * @param {CesiumViewer} cesiumViewer
	 */
	CitydbKmlLayer.prototype.removeFromCesium = function(cesiumViewer){
		// TODO
	}

	/**
	 * activates or deactivates the layer
	 * @param {Boolean} value
	 */
	CitydbKmlLayer.prototype.activate = function(active){

	}

	/**
	 * highlights one or more object with a given color;
	 * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
	 */
	CitydbKmlLayer.prototype.highlight = function(toHighlight){
		var highlightedObjects = this._highlightedObjects;	
		for (var id in toHighlight){
			highlightedObjects[id] = toHighlight[id]
			console.log(id);
			delete toHighlight[id];				
		}
	};

	/**
	 * undo highlighting
	 * @param {Array<String>} A list of Object Ids. The default material will be restored
	 */
	CitydbKmlLayer.prototype.unHighlight = function(toUnHighlight){
		// TODO
	};

	/**
	 * hideObjects
	 * @param {Array<String>} A list of Object Ids which will be hidden
	 */
	CitydbKmlLayer.prototype.hideObjects = function(toHide){
		// TODO
	};


	/**
	 * showObjects, to undo hideObjects
	 * @param {Array<String>} A list of Object Ids which will be unhidden. 
	 */
	CitydbKmlLayer.prototype.showObjects = function(toUnhide){
		// TODO
	};

	/**
	 * removes an Eventhandler
	 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
	 * @param {function} callback function to be called
	 */	
	CitydbKmlLayer.prototype.removeEventHandler = function(event, callback){
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
	CitydbKmlLayer.prototype.registerEventHandler = function(event, callback){
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
	CitydbKmlLayer.prototype.triggerEvent = function(event, object){
		if(event == "CLICK"){
			this._clickEvent.raiseEvent(object);
		}else if(event == "MOUSEIN"){
			this._mouseInEvent.raiseEvent(object);
		}else if(event == "MOUSEOUT"){
			this._mouseOutEvent.raiseEvent(object);
		}
	}
	window.CitydbKmlLayer = CitydbKmlLayer;
})();

