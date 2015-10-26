
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
 *
 */
(function() {
	function CitydbKmlLayer(options){	
		this._url = options.url;
		this._name = options.name;
		this._id = Cesium.defaultValue(options.id, Cesium.createGuid());		
		this._region = options.region;
		this._active = true;
		this._highlightedObjects = {};		
		this._hiddenObjects = [];
		this._cameraPosition = {};
		this._pickSurface = Cesium.defaultValue(options.pickSurface, false);
		this._cesiumViewer = undefined;
		this._thematicDataUrl = Cesium.defaultValue(options.thematicDataUrl, "");
		this._cityobjectsJsonUrl = options.cityobjectsJsonUrl;
		this._cityobjectsJsonData = {};
	
		this._maxSizeOfCachedTiles = Cesium.defaultValue(options.maxSizeOfCachedTiles, 50);	
		this._cacheTiles = this._maxSizeOfCachedTiles <= 0? false: true;
		this._maxCountOfVisibleTiles = Cesium.defaultValue(options.maxCountOfVisibleTiles, 200);
		
    	this._minLodPixels = Cesium.defaultValue(options.minLodPixels, undefined);
    	this._maxLodPixels = Cesium.defaultValue(options.maxLodPixels,  undefined);
		
		this._citydbKmlDataSource = new CitydbKmlDataSource(this._id);	
		
		this._activeHighlighting = Cesium.defaultValue(options.activeHighlighting, true);	
		this._citydbKmlHighlightingManager = this._activeHighlighting? new CitydbKmlHighlightingManager(this): null;		
		this._citydbKmlTilingManager = new CitydbKmlTilingManager(this);
		this._layerType = undefined;

		this._configParameters = {
			"id": this.id,
			"url" : this.url,
			"name" : this.name,
			"thematicDataUrl" : this.thematicDataUrl,
			"cityobjectsJsonUrl" : this.cityobjectsJsonUrl,
			"pickSurface": this.pickSurface,
			"minLodPixels": this.minLodPixels,
			"maxLodPixels" : this.maxLodPixels,
			"maxSizeOfCachedTiles": this.maxSizeOfCachedTiles,
			"maxCountOfVisibleTiles" : this.maxCountOfVisibleTiles
		}
		
		Cesium.knockout.track(this, ['_highlightedObjects', '_hiddenObjects']);
				
		/**
		 * handles ClickEvents
		 * @type {Cesium.Event} clickEvent
		 */
		this._clickEvent = new Cesium.Event();
		
		this._ctrlClickEvent = new Cesium.Event();
		
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
		
		this._startLoadingEvent = new Cesium.Event();
		
		this._finishLoadingEvent = new Cesium.Event();
		
		this._viewChangedEvent = new Cesium.Event();
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
	        },
	        set : function(value){
	        	this._highlightedObjects = value;
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
	        },
	        set : function(value){
	        	this._hiddenObjects = value;
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
	        },
	        set : function(value){
	        	this._url = value;
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
	        },
	        set : function(value){
	        	this._name = value;
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
	    
	    pickSurface : {
	        get : function(){
	        	return this._pickSurface;
	        },
	        set : function(value){
	        	this._pickSurface = value;
	        }
	    },
	    
	    thematicDataUrl : {
	        get : function(){
	        	return this._thematicDataUrl;
	        },
	        set : function(value){
	        	this._thematicDataUrl = value;
	        }
	    },
	    
	    cityobjectsJsonUrl : {
	        get : function(){
	        	return this._cityobjectsJsonUrl;
	        },
	        set : function(value){
	        	this._cityobjectsJsonUrl = value;
	        }
	    },
	    
	    cityobjectsJsonData : {
	        get : function(){
	        	return this._cityobjectsJsonData;
	        },
	        set : function(value){
	        	this._cityobjectsJsonData = value;
	        }
	    },
	    
	    cesiumViewer : {
	        get : function(){
	        	return this._cesiumViewer;
	        }
	    },
	    
	    citydbKmlDataSource : {
	        get : function(){
	        	return this._citydbKmlDataSource;
	        }
	    },
	    	    
	    cacheTiles : {
	        get : function(){
	        	return this._cacheTiles;
	        },
	        set : function(value){
	        	this._cacheTiles = value;
	        }
	    },
	    
	    minLodPixels : {
	        get : function(){
	        	return this._minLodPixels;
	        },
	        set : function(value){
	        	this._minLodPixels = value;
	        }
	    },
	    
	    maxLodPixels : {
	        get : function(){
	        	return this._maxLodPixels;
	        },
	        set : function(value){
	        	this._maxLodPixels = value;
	        }
	    },
	    
	    maxSizeOfCachedTiles : {
	        get : function(){
	        	return this._maxSizeOfCachedTiles;
	        },
	        set : function(value){
	        	this._maxSizeOfCachedTiles = value;
	        	this._cacheTiles = this._maxSizeOfCachedTiles <= 0? false: true;
	        }
	    },
	    
	    maxCountOfVisibleTiles : {
	        get : function(){
	        	return this._maxCountOfVisibleTiles;
	        },
	        set : function(value){
	        	this._maxCountOfVisibleTiles = value;
	        }
	    },
	    
	    citydbKmlTilingManager : {
	        get : function(){
	        	return this._citydbKmlTilingManager;
	        }
	    },
	    
	    citydbKmlHighlightingManager : {
	        get : function(){
	        	return this._citydbKmlHighlightingManager;
	        }
	    },
	    
	    isHighlightingActivated : {
	        get : function(){
	        	return this._citydbKmlHighlightingManager == null? false: true;
	        }
	    },
	    
	    configParameters : {
	        get : function(){
	        	return this._configParameters;
	        }
	    }
	});


	/**
	 * adds this layer to the given Cesium viewer
	 * @param {CesiumViewer} cesiumViewer
	 */
	CitydbKmlLayer.prototype.addToCesium = function(cesiumViewer){
		this._startLoadingEvent.raiseEvent(this);
		this._cesiumViewer = cesiumViewer;
		var that = this;
		if (this._url.indexOf(".json") >= 0) {	 
			Cesium.loadJson(this._url).then(function(json) {        	
	        	that._citydbKmlDataSource._name = json.layername;	
	        	that._citydbKmlDataSource._proxy = json;
	        	that._layerType = json.displayform;
	            that._cameraPosition = {
	        		lat: (json.bbox.ymax + json.bbox.ymin) / 2,	
	        		lon: (json.bbox.xmax + json.bbox.xmin) / 2,
	    			range: 800,
	    			tilt: 49,
	    			heading: 6,
	    			altitude: 40
	        	}
	            
	            if (!Cesium.defined(that._minLodPixels))
	            	that._minLodPixels = json.minLodPixels == -1? Number.MIN_VALUE: json.minLodPixels;
	            if (!Cesium.defined(that._maxLodPixels))
	            	that._maxLodPixels = json.maxLodPixels == -1? Number.MAX_VALUE: json.maxLodPixels;
	            
	    		cesiumViewer.dataSources.add(that._citydbKmlDataSource);
	            that._citydbKmlTilingManager.doStart();
	            
	            var jsonUrl = that._cityobjectsJsonUrl;
	            if (Cesium.defined(jsonUrl)) {
	            	Cesium.loadJson(jsonUrl).then(function(data) {
						console.log(data);
						that._cityobjectsJsonData = data;
						that._finishLoadingEvent.raiseEvent(that);
					}).otherwise(function(error) {
						console.log(error);
						that._finishLoadingEvent.raiseEvent(that);
					});	
	            }
	            else {
	            	that._finishLoadingEvent.raiseEvent(that);
	            }		            		            
	        
			}).otherwise(function(error) {
				console.log('can not find the json file for ' + kmlUrl);
	        	that._finishLoadingEvent.raiseEvent(that);
			});
    	}
		else {
			this._citydbKmlDataSource.load(this._url).then(function() {
				that._cameraPosition = that._citydbKmlDataSource._lookAt;
				
				// TODO
				that._minLodPixels = 140
				that._maxLodPixels = Number.MAX_VALUE;
				
				cesiumViewer.dataSources.add(that._citydbKmlDataSource);
				that._citydbKmlTilingManager.doStart();
				that._finishLoadingEvent.raiseEvent(that);
		    });
		}	
		
		Cesium.knockout.getObservable(that, '_highlightedObjects').subscribe(function() {					
			that._citydbKmlTilingManager.clearCaching();	
	    });
		
		Cesium.knockout.getObservable(that, '_hiddenObjects').subscribe(function() {					
			that._citydbKmlTilingManager.clearCaching();	
	    });
	}
	
	CitydbKmlLayer.prototype.zoomToLayer = function(){
		var that = this;
		var lat = this._cameraPosition.lat;
		var lon = this._cameraPosition.lon;
		var center = Cesium.Cartesian3.fromDegrees(lon, lat);
        var heading = Cesium.Math.toRadians(this._cameraPosition.heading);
        var pitch = Cesium.Math.toRadians(this._cameraPosition.tilt - 90);
        var range = this._cameraPosition.range;
        var cesiumCamera = this._cesiumViewer.scene.camera;
        cesiumCamera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(lon, lat, range),
            complete: function() {
            	cesiumCamera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
            	cesiumCamera.lookAtTransform(Cesium.Matrix4.IDENTITY); 
            	setTimeout(function(){
            		that._citydbKmlTilingManager.triggerWorker();
            	}, 3000)            	
            }
        })
	}

	/**
	 * adds this layer to the given cesium viewer
	 * @param {CesiumViewer} cesiumViewer
	 */
	CitydbKmlLayer.prototype.removeFromCesium = function(cesiumViewer){
		this.activate(false);
	}

	/**
	 * activates or deactivates the layer
	 * @param {Boolean} value
	 */
	CitydbKmlLayer.prototype.activate = function(active){
		if (active == false) {			
			this._citydbKmlTilingManager.doTerminate();
			this._cesiumViewer.dataSources.remove(this._citydbKmlDataSource);
		}
		else {
			this._citydbKmlTilingManager.doStart();
			this._cesiumViewer.dataSources.add(this._citydbKmlDataSource);			
		}
		this._active = active;
	}
	
	CitydbKmlLayer.prototype.reActivate = function(){
		var deferred = Cesium.when.defer();
		
		if (!this._active) {
			this.activate(true);
			deferred.resolve(this._active);
		}
		else {
			this.activate(false);
			var that = this;
			// here we simply activate layer one seconds layer...
			setTimeout(function(){
				that.activate(true);
				deferred.resolve(this._active);
        	}, 1000)  			
		}
		return deferred.promise;
	}
	
	
	/**
	 * find and return the model object by Id (GMLID)
	 * @param {String} Object Id
	 * @return {Cesium.Model} Cesium Model instance having the corresponding GMLID
	 */
	
	CitydbKmlLayer.prototype.getObjectById = function(objectId){		
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
		}
		else if (this._layerType == "geometry") {
			if (this.pickSurface) {
				return this.getEntitiesById(objectId);
			}
			else {
				var roofEntites = this.getEntitiesById(objectId + '_RoofSurface');
				var wallEntites = this.getEntitiesById(objectId + '_WallSurface');
				if (roofEntites != null && wallEntites != null) {
					return roofEntites.concat(wallEntites);
				}
				else {
					return null;
				}
			}
		}
		else if (this._layerType == "extruded" || this._layerType == "footprint") {
			return this.getEntitiesById(objectId);
		}
		return null;	
	};
	
	CitydbKmlLayer.prototype.getEntitiesById = function(objectId){		
		var primitives = this._cesiumViewer.scene.primitives;
		for (var i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Primitive) {					
 				for (var j = 0; j < primitive._instanceIds.length; j++){
 					var tmpprimitiveInstance = primitive._instanceIds[j];
					if (tmpprimitiveInstance.name === objectId && tmpprimitiveInstance.layerId == this._id){						
						var targetEntity = tmpprimitiveInstance;
						var parentEntity = targetEntity._parent
						if (Cesium.defined(parentEntity)) {
							return parentEntity._children;
						}						
					}
				}
			}
		}
		return null;		
	};
	
	CitydbKmlLayer.prototype.setEntityColorByPrimitive = function(entity, color){
		var primitives = this._cesiumViewer.scene.primitives;
		for (var i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Primitive) {					
 				for (var j = 0; j < primitive._instanceIds.length; j++){	
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

	/**
	 * highlights one or more object with a given color;
	 * @param {Object<String, Cesium.Color>} An Object with the id and a Cesium Color value
	 */
	CitydbKmlLayer.prototype.highlight = function(toHighlight){
		for (var id in toHighlight){
			this._highlightedObjects[id] = toHighlight[id];
			this.highlightObject(this.getObjectById(id));
		}	
		this._highlightedObjects = this._highlightedObjects;
	};
	
	CitydbKmlLayer.prototype.highlightObject = function(object){	
		if (object == null)
			return;
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var highlightColor = this._highlightedObjects[object._id._name];
				if (highlightColor) {
					var materials = object._runtime.materialsByName;				
					for (var materialId in materials){
						materials[materialId].setValue('emission', Cesium.Cartesian4.fromColor(highlightColor));
					}
				}			
			}
		}
		else if (object instanceof Cesium.Entity) {
			if (!Cesium.defined(object.originalMaterial)) {
				object.addProperty("originalMaterial");
			}	
			object.originalMaterial = object.polygon.material;
			object.polygon.material = this._highlightedObjects[object.name].clone();
		}	
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];	
				if (!Cesium.defined(childEntity.originalMaterial)) {
					childEntity.addProperty("originalMaterial");
				}	
				childEntity.originalMaterial = childEntity.polygon.material;
				if (this._pickSurface != true) {
					childEntity.polygon.material = this._highlightedObjects[childEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '')];
				}
				else {
					childEntity.polygon.material = this._highlightedObjects[childEntity.name];
				}				
			}		
		}	
	};

	/**
	 * undo highlighting
	 * @param {Array<String>} A list of Object Ids. The default material will be restored
	 */
	CitydbKmlLayer.prototype.unHighlight = function(toUnHighlight){
		for (var k = 0; k < toUnHighlight.length; k++){	
			var id = toUnHighlight[k];			
			delete this._highlightedObjects[id];		
		}
		for (var k = 0; k < toUnHighlight.length; k++){	
			var id = toUnHighlight[k];			
			this.unHighlightObject(this.getObjectById(id));
		}
		this._highlightedObjects = this._highlightedObjects;
	};
	
	CitydbKmlLayer.prototype.unHighlightObject = function(object){	
		if (object == null)
			return;
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var unHighlightColor = new Cesium.Color(0.0, 0.0, 0.0, 1)
				var materials = object._runtime.materialsByName;			
				for (var materialId in materials){
					materials[materialId].setValue('emission', Cesium.Cartesian4.fromColor(unHighlightColor));
				}
			}	
		}
		else if (object instanceof Cesium.Entity) {			
			var originalMaterial = object.originalMaterial;
			if (Cesium.defined(originalMaterial)) {
				if (!this.isHiddenObject(object)) {
					this.setEntityColorByPrimitive(object, originalMaterial.color._value.clone());	
					setTimeout(function(){
						object.polygon.material = originalMaterial;	
					}, 100)
				}			
			}			
		}	
		else if (object instanceof Array) {
			if (!this.isHiddenObject(object)) {
				for (var i = 0; i < object.length; i++){	
					var childEntity = object[i];	
					var originalMaterial = childEntity.originalMaterial;
					if (Cesium.defined(originalMaterial)) {
						this.setEntityColorByPrimitive(childEntity, originalMaterial.color._value.clone());	
						childEntity.polygon.material = originalMaterial;
					}
				}	
			}				
		}
	};
	
	CitydbKmlLayer.prototype.unHighlightAllObjects = function(){
		for (var id in this._highlightedObjects){
			delete this._highlightedObjects[id];	
			this.unHighlightObject(this.getObjectById(id));
		}
		this._highlightedObjects = this._highlightedObjects;
		if (this._citydbKmlHighlightingManager != null)
			this._citydbKmlHighlightingManager.triggerWorker();		
	};

	CitydbKmlLayer.prototype.isHighlighted = function(objectId){	
		var object = this.getObjectById(id);
		return this.isHighlightedObject(object);
	};
	
	CitydbKmlLayer.prototype.isHighlightedObject = function(object){	
		if (object instanceof Cesium.Model) {
			var highlightColor = this._highlightedObjects[object._id._name];
			if (!Cesium.defined(highlightColor)) {
				return false;
			}
			var materials = object._runtime.materialsByName;
			for (var materialId in materials){
				if (!materials[materialId].getValue('emission').equals(Cesium.Cartesian4.fromColor(highlightColor))) {
					return false;
				}			
			}
		}	
		else if (object instanceof Cesium.Entity) {			
			if (!object.polygon.material.color._value.equals(this._highlightedObjects[object.name])) {
				return false;
			}
		}	
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];					
				var globeId;
				if (this._pickSurface != true) {
					globeId = childEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
				}
				else {
					globeId = childEntity.name;
				}
				if (!childEntity.polygon.material.color._value.equals(this._highlightedObjects[globeId])) {
					return false;
				}
			}		
		}
		return true;
	};
	
	CitydbKmlLayer.prototype.isInHighlightedList = function(objectId){	
		return this._highlightedObjects.hasOwnProperty(objectId);
	};

	CitydbKmlLayer.prototype.hasHighlightedObjects = function(){	
		return Object.keys(this._highlightedObjects).length > 0? true : false;
	};

	/**
	 * hideObjects
	 * @param {Array<String>} A list of Object Ids which will be hidden
	 */
	CitydbKmlLayer.prototype.hideObjects = function(toHide){		
		for (var i = 0; i < toHide.length; i++){
			var objectId = toHide[i];
			if (!this.isInHiddenList(objectId)) {
				this._hiddenObjects.push(objectId);
			}				
			this.hideObject(this.getObjectById(objectId));
		}
		this._hiddenObjects = this._hiddenObjects;
	};
	
	CitydbKmlLayer.prototype.hideObject = function(object){			
		if (object == null)
			return;
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var nodes = object._runtime.nodesByName;
				for (var nodeId in nodes){
					var node = nodes[nodeId];
					var publicNode = Cesium.defined(node) ? node.publicNode : undefined
					publicNode.show = false;
				}				
			}
		}
		else if (object instanceof Cesium.Entity) {
			object.show = false;
		}
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];	
				childEntity.show = false;
			}		
		}
	//	console.log(object.show);
	};


	/**
	 * showObjects, to undo hideObjects
	 * @param {Array<String>} A list of Object Ids which will be unhidden. 
	 */
	CitydbKmlLayer.prototype.showObjects = function(toUnhide){		
		for (var k = 0; k < toUnhide.length; k++){	
			var objectId = toUnhide[k];			
			this._hiddenObjects.splice(objectId, 1);	
		}
		for (var k = 0; k < toUnhide.length; k++){	
			var objectId = toUnhide[k];			
			this.showObject(this.getObjectById(objectId));
		}
		this._hiddenObjects = this._hiddenObjects;
	};
	
	CitydbKmlLayer.prototype.showObject = function(object){
		if (object == null)
			return;
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var nodes = object._runtime.nodesByName;
				for (var nodeId in nodes){
					var node = nodes[nodeId];
					var publicNode = Cesium.defined(node) ? node.publicNode : undefined
					publicNode.show = true;
				}				
			}
		}
		else if (object instanceof Cesium.Entity) {
			object.show = true;				
			if (!this.isInHighlightedList(object.name)) {
				var originalMaterial = object.originalMaterial;
				if (Cesium.defined(originalMaterial)) {
					this.setEntityColorByPrimitive(object, originalMaterial.color._value.clone());	
					setTimeout(function(){
						object.polygon.material = originalMaterial;	
					}, 100)
				}
			}
		}
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){					
				var childEntity = object[i];	
				childEntity.show = true;	
				var globeId;
				if (this._pickSurface != true) {
					globeId = childEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
				}
				else {
					globeId = childEntity.name;
				}			
				if (!this.isInHighlightedList(globeId)) {
					var originalMaterial = childEntity.originalMaterial;
					if (Cesium.defined(originalMaterial)) {
						this.setEntityColorByPrimitive(childEntity, originalMaterial.color._value);	
						setTimeout(function(){
							childEntity.polygon.material = originalMaterial;	
						}, 100)	
					}
				}
			}		
		}	
	};
	
	CitydbKmlLayer.prototype.isHiddenObject = function(object){	
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var nodes = object._runtime.nodesByName;
				for (var nodeId in nodes){
					var node = nodes[nodeId];
					var publicNode = Cesium.defined(node) ? node.publicNode : undefined
					return !publicNode.show;									
				}				
			}
		}
		else if (object instanceof Cesium.Entity) {
			return !object.show;
		}
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];	
				return !childEntity.show;
			}		
		}
		return true;
	};
	
	CitydbKmlLayer.prototype.showAllObjects = function(){
		for (var k = 0; k < this._hiddenObjects.length; k++){	
			var objectId = this._hiddenObjects[k];			
			this.showObject(this.getObjectById(objectId));
		}
		this._hiddenObjects = this._hiddenObjects;
		
		this._hiddenObjects = [];
/*		if (this._citydbKmlHighlightingManager != null)
			this._citydbKmlHighlightingManager.triggerWorker();		*/
	};
	
	CitydbKmlLayer.prototype.isInHiddenList = function(objectId){	
		return this._hiddenObjects.indexOf(objectId) > -1? true: false;
	};
	
	CitydbKmlLayer.prototype.hasHiddenObjects = function(){	
		return this._hiddenObjects.length > 0? true : false;
	};

	/**
	 * removes an Eventhandler
	 * @param {String} event (either CLICK, MOUSEIN or MOUSEOUT)
	 * @param {function} callback function to be called
	 */	
	CitydbKmlLayer.prototype.removeEventHandler = function(event, callback){
		if(event == "CLICK"){
			this._clickEvent.removeEventListener(callback, this);
		}else if(event == "CTRLCLICK"){
			this._ctrlClickEvent.removeEventListener(callback, this);
		}else if(event == "MOUSEIN"){
			this._mouseInEvent.removeEventListener(callback, this);
		}else if(event == "MOUSEOUT"){
			this._mouseOutEvent.removeEventListener(callback, this);
		}else if(event == "STARTLOADING"){
			this._startLoadingEvent.removeEventListener(callback, this);
		}else if(event == "FINISHLOADING"){
			this._finishLoadingEvent.removeEventListener(callback, this);
		}else if(event == "VIEWCHANGED"){
			this._viewChangedEvent.removeEventListener(callback, this);
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
		}else if(event == "CTRLCLICK"){
			this._ctrlClickEvent.addEventListener(callback, this)
		}else if(event == "MOUSEIN"){
			this._mouseInEvent.addEventListener(callback, this);
		}else if(event == "MOUSEOUT"){
			this._mouseOutEvent.addEventListener(callback, this);
		}else if(event == "STARTLOADING"){
			this._startLoadingEvent.addEventListener(callback, this);
		}else if(event == "FINISHLOADING"){
			this._finishLoadingEvent.addEventListener(callback, this);
		}else if(event == "VIEWCHANGED"){
			this._viewChangedEvent.addEventListener(callback, this);
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
		}else if(event == "CTRLCLICK"){
			this._ctrlClickEvent.raiseEvent(object);
		}else if(event == "MOUSEIN"){
			this._mouseInEvent.raiseEvent(object);
		}else if(event == "MOUSEOUT"){
			this._mouseOutEvent.raiseEvent(object);
		}else if(event == "VIEWCHANGED"){
			this._viewChangedEvent.raiseEvent(object);
		}
	}
	window.CitydbKmlLayer = CitydbKmlLayer;
})();

