/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2016
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
 * @alias KmlDataSource
 * 
 * @param {Object} [options] Object with the following properties:
 * @param {String} [options.url] Url to the layer data
 * 
 */
(function() {
	function CitydbKmlLayer(options){	
		
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
		this._thematicDataProvider = Cesium.defaultValue(options.thematicDataProvider, "");
		this._cityobjectsJsonUrl = options.cityobjectsJsonUrl;
		this._cityobjectsJsonData = new Object();	
		this._maxSizeOfCachedTiles = Cesium.defaultValue(options.maxSizeOfCachedTiles, 50);	
		this._maxCountOfVisibleTiles = Cesium.defaultValue(options.maxCountOfVisibleTiles, 200);		
    	this._minLodPixels = Cesium.defaultValue(options.minLodPixels, undefined);
    	this._maxLodPixels = Cesium.defaultValue(options.maxLodPixels,  undefined);		
		this._citydbKmlDataSource = undefined;		
		this._activeHighlighting = Cesium.defaultValue(options.activeHighlighting, true);	
		this._citydbKmlHighlightingManager = this._activeHighlighting? new CitydbKmlHighlightingManager(this): null;		
		this._citydbKmlTilingManager = new CitydbKmlTilingManager(this);
		this._layerType = undefined;
		this._jsonLayerInfo = undefined;
		this._startLoadingEvent = new Cesium.Event();		
		this._finishLoadingEvent = new Cesium.Event();		
		this._viewChangedEvent = new Cesium.Event();
		this._configParameters = {
			"id": this.id,
			"url" : this.url,
			"name" : this.name,
			"thematicDataUrl" : this.thematicDataUrl,
			"thematicDataProvider" : this._thematicDataProvider,
			"cityobjectsJsonUrl" : this.cityobjectsJsonUrl,
			"minLodPixels": this.minLodPixels,
			"maxLodPixels" : this.maxLodPixels,
			"maxSizeOfCachedTiles": this.maxSizeOfCachedTiles,
			"maxCountOfVisibleTiles" : this.maxCountOfVisibleTiles
		}
		
		Cesium.knockout.track(this, ['_highlightedObjects', '_hiddenObjects']);				
	}

	Object.defineProperties(CitydbKmlLayer.prototype, {
		
	    active : {
	        get : function(){
	        	return this._active;
	        }
	    },

	    highlightedObjects : {
	        get : function(){
	        	return this._highlightedObjects;
	        },
	        set : function(value){
	        	this._highlightedObjects = value;
	        }	    
	    },

	    hiddenObjects : {
	        get : function(){
	        	return this._hiddenObjects;
	        },
	        set : function(value){
	        	this._hiddenObjects = value;
	        }	
	    },

	    cameraPosition : {
	        get : function(){
	        	return this._cameraPosition;
	        },
	        set : function(value){
	        	this._cameraPosition = value;
	        }
	    },

	    url : {
	        get : function(){
	        	return this._url;
	        },
	        set : function(value){
	        	this._url = value;
	        }
	    },

	    name : {
	        get : function(){
	        	return this._name;
	        },
	        set : function(value){
	        	this._name = value;
	        }
	    },

	    id : {
	        get : function(){
	        	return this._id;
	        }
	    },

	    region : {
	        get : function(){
	        	return this._region;
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
	    
	    thematicDataProvider : {
	        get : function(){
	        	return this._thematicDataProvider;
	        },
	        set : function(value){
	        	this._thematicDataProvider = value;
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

	function loadMasterJSON(that, isFirstLoad) {
		var deferred = Cesium.when.defer();
		var jsonUrl = that._url;
		that._startLoadingEvent.raiseEvent(that);
		Cesium.loadJson(jsonUrl).then(function(json) {        	
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
                	that._minLodPixels = json.minLodPixels == -1? Number.MIN_VALUE: json.minLodPixels;
                if (!that._maxLodPixels)
                	that._maxLodPixels = json.maxLodPixels == -1? Number.MAX_VALUE: json.maxLodPixels;
            }
                       
            if (that._active) {
            	that._citydbKmlTilingManager.doStart();
            	that._cesiumViewer.dataSources.add(that._citydbKmlDataSource);
            }
            
            var jsonUrl = that._cityobjectsJsonUrl;
            if (Cesium.defined(jsonUrl)) {
            	Cesium.loadJson(jsonUrl).then(function(data) {
					console.log(data);
					deferred.resolve();
					that._cityobjectsJsonData = data;
					that._finishLoadingEvent.raiseEvent(that);
				}).otherwise(function(error) {
					console.log(error);
					deferred.reject(error);
					that._finishLoadingEvent.raiseEvent(that);
				});	
            }
            else {
            	deferred.resolve('There is no cityobjectJsonFile');
            	that._finishLoadingEvent.raiseEvent(that);
            }		            		                    
		}).otherwise(function(error) {
			console.log('can not find the json file for ' + kmlUrl);
			deferred.reject(error);
        	that._finishLoadingEvent.raiseEvent(that);
		});
		return deferred.promise;
	}
	
	/**
	 * adds this layer to the given Cesium viewer
	 * @param {CesiumViewer} cesiumViewer
	 */
	CitydbKmlLayer.prototype.addToCesium = function(cesiumViewer){
		this._cesiumViewer = cesiumViewer;
		this._citydbKmlDataSource = new CitydbKmlDataSource({
			layerId: this._id,
			camera: cesiumViewer.scene.camera,
		    canvas: cesiumViewer.scene.canvas
		});	
		var that = this;
		loadMasterJSON(that, true);
		
		Cesium.knockout.getObservable(this, '_highlightedObjects').subscribe(function() {					
			that._citydbKmlTilingManager.clearCaching();	
	    });
		
		Cesium.knockout.getObservable(this, '_hiddenObjects').subscribe(function() {					
			that._citydbKmlTilingManager.clearCaching();	
	    });
	}

	CitydbKmlLayer.prototype.removeFromCesium = function(cesiumViewer){
		this.activate(false);
	}

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
	}
	
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
	
	/**
	 * zooms to the layer cameraPostion
	 */	
	CitydbKmlLayer.prototype.zoomToStartPosition = function(){
		var that = this;
		var lat = this._cameraPosition.lat;
		var lon = this._cameraPosition.lon;
		var center = Cesium.Cartesian3.fromDegrees(lon, lat);
        var heading = Cesium.Math.toRadians(this._cameraPosition.heading);
        var pitch = Cesium.Math.toRadians(this._cameraPosition.pitch);
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
	
	//--------------------------------------------------------------------------------------------------------//
	//---------------------- Extended Methods and Functions for CitydbKmlLayer--------------------------------//
	//--------------------------------------------------------------------------------------------------------//
		
	CitydbKmlLayer.prototype.reActivate = function(){		
		this._highlightedObjects = {};	
		this._hiddenObjects = [];
		this._cityobjectsJsonData = {};			
		if (this._active) {
			this._citydbKmlTilingManager.doTerminate();
			this._cesiumViewer.dataSources.remove(this._citydbKmlDataSource);	
		}		
		this._citydbKmlDataSource = new CitydbKmlDataSource({
			layerId: this._id,
			camera: this._cesiumViewer.scene.camera,
		    canvas: this._cesiumViewer.scene.canvas
		});	
		this._citydbKmlTilingManager = new CitydbKmlTilingManager(this);

		return loadMasterJSON(this, false);
	}
	
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
		else if (this._layerType == "extruded" || this._layerType == "footprint" || this._layerType == "geometry") {
			return this.getEntitiesById(objectId);
		}
		return null;	
	};
	
	CitydbKmlLayer.prototype.getEntitiesById = function(objectId){		
		var primitives = this._cesiumViewer.scene.primitives;
		for (var i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Primitive && Cesium.defined(primitive._instanceIds)) {					
 				for (var j = 0; j < primitive._instanceIds.length; j++){
 					var tmpprimitiveInstance = primitive._instanceIds[j];
					if (tmpprimitiveInstance.name === objectId && tmpprimitiveInstance.layerId == this._id){						
						var targetEntity = tmpprimitiveInstance;
						var parentEntity = targetEntity._parent
						if (Cesium.defined(parentEntity)) {
							return parentEntity._children;
						}	
						else {
							return [targetEntity]
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
			if (primitive instanceof Cesium.Primitive && Cesium.defined(primitive._instanceIds)) {					
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
	
	CitydbKmlLayer.prototype.highlightObject = function(object){	
		if (object == null)
			return;
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var highlightColor = this._highlightedObjects[object._id._name];
				if (highlightColor) {
					var targetEntity = object._id;
					if (!Cesium.defined(targetEntity.originalMaterial)) {
						targetEntity.addProperty("originalMaterial");
						var materials = object._runtime.materialsByName;				
						for (var materialId in materials){
							targetEntity.originalMaterial = materials[materialId].getValue('emission').clone();
						}
					}	
					var materials = object._runtime.materialsByName;				
					for (var materialId in materials){
						materials[materialId].setValue('emission', Cesium.Cartesian4.fromColor(highlightColor));
					}
				}			
			}
		}	
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];	
				if (!Cesium.defined(childEntity.originalMaterial)) {
					childEntity.addProperty("originalMaterial");
				}	
				childEntity.originalMaterial = this.getObjectMaterial(childEntity);
				this.setObjectMaterial(childEntity, this._highlightedObjects[childEntity.name]);				
			}		
		}	
	};
	
	CitydbKmlLayer.prototype.unHighlightObject = function(object){	
		if (object == null)
			return;
		if (object instanceof Cesium.Model) {
			if (object.ready) {
				var targetEntity = object._id;
				var materials = object._runtime.materialsByName;			
				for (var materialId in materials){
					materials[materialId].setValue('emission', targetEntity.originalMaterial);
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
						this.setObjectMaterial(childEntity, originalMaterial);
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
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];					
				var globeId = childEntity.name;;
				var material = this.getObjectMaterial(childEntity);
				if (!material.color._value.equals(this._highlightedObjects[globeId])) {
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
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){	
				var childEntity = object[i];	
				childEntity.show = false;
			}		
		}
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
		else if (object instanceof Array) {
			for (var i = 0; i < object.length; i++){					
				var childEntity = object[i];	
				childEntity.show = true;	
				var globeId = childEntity.name;			
				if (!this.isInHighlightedList(globeId)) {
					var originalMaterial = childEntity.originalMaterial;
					if (Cesium.defined(originalMaterial)) {
						this.setEntityColorByPrimitive(childEntity, originalMaterial.color._value);	
						setTimeout(function(){	
							this.setObjectMaterial(childEntity, originalMaterial);
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
	};
	
	CitydbKmlLayer.prototype.isInHiddenList = function(objectId){	
		return this._hiddenObjects.indexOf(objectId) > -1? true: false;
	};
	
	CitydbKmlLayer.prototype.hasHiddenObjects = function(){	
		return this._hiddenObjects.length > 0? true : false;
	};
	
	CitydbKmlLayer.prototype.setObjectMaterial = function(object, material){	
		if (Cesium.defined(object.polygon)) {
			object.polygon.material = material;
		}
		else if (Cesium.defined(object.polyline)) {
			object.polyline.material = material;
		}
		else if (Cesium.defined(object.point)) {
			object.point.material = material;
		}
	};
	
	CitydbKmlLayer.prototype.getObjectMaterial = function(object){	
		var geometryGraphic;
		if (Cesium.defined(object.polygon)) {
			geometryGraphic = object.polygon;
		}
		else if (Cesium.defined(object.polyline)) {
			geometryGraphic = object.polyline;
		}
		else if (Cesium.defined(object.point)) {
			geometryGraphic = object.point;
		}
		return geometryGraphic.material
	};

	window.CitydbKmlLayer = CitydbKmlLayer;
})();

