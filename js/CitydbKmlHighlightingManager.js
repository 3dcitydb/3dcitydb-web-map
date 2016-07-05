/**
 *
 * Highlighting Manager for controlling Appearance of objects created by the dynamically loaded KML/KMZ data tiles
 *
 **/
(function() {
	
	function CitydbKmlHighlightingManager(citydbKmlLayerInstance) {		
		this.oTask = null;
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.dataPool = {};
		this.cachedObjects = {};
	}
	
	CitydbKmlHighlightingManager.prototype.doStart = function() {
    	var scope = this;
    	
    	var workerPath = CitydbUtil.retrieveURL("CitydbKmlHighlightingManager");
    	if (typeof workerPath == 'undefined') {
			workerPath = CitydbUtil.retrieveURL("3dcitydb-web-map-api");
		}   	
    	this.oTask = new CitydbWebworker(workerPath + "Webworkers/CitydbKmlHighlightingManagerWebworker.js");
    	
		// add Listeners
		this.oTask.addListener("checkMasterPool", function (objectId, visibility) {	

			var obj = scope.cachedObjects[objectId];
			
			if (obj != null) {
				// update Hidden/Show
				if (scope.citydbKmlLayerInstance.isInHiddenList(objectId)) {
					if (!scope.citydbKmlLayerInstance.isHiddenObject(obj)) {
						scope.citydbKmlLayerInstance.hideObject(obj);
						scope.oTask.triggerEvent('updateDataPool');
					}
				}
				else {
					if (scope.citydbKmlLayerInstance.isHiddenObject(obj)) {
						scope.citydbKmlLayerInstance.showObject(obj);
						scope.oTask.triggerEvent('updateDataPool');
					}
				}
								
				setTimeout(function(){   	
					// update Highlighting
					if (scope.citydbKmlLayerInstance.isInHighlightedList(objectId)) {				
						if (!scope.citydbKmlLayerInstance.isHighlightedObject(obj)) {
							scope.citydbKmlLayerInstance.highlightObject(obj);
							scope.oTask.triggerEvent('updateDataPool');
						}					
					}
					else {
						if (scope.citydbKmlLayerInstance.isHighlightedObject(obj)) {
							scope.citydbKmlLayerInstance.unHighlightObject(obj);
							scope.oTask.triggerEvent('updateDataPool');
						}
					}
					scope.oTask.triggerEvent('updateTaskStack'); 
			    }, 50);
			}
			else {
				setTimeout(function(){   	
					scope.oTask.triggerEvent('updateTaskStack'); 		    	
			    }, 50); 
			}						
		});

		scope.oTask.addListener("refreshView", function (isStillUpdating, dataPool) {				
			var cesiumViewer = scope.citydbKmlLayerInstance._cesiumViewer;
			if (cesiumViewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
				setTimeout(function(){   
					if (scope.citydbKmlLayerInstance.citydbKmlTilingManager.isDataStreaming()) {
						console.log("Highlighting Manager falls asleep...");
						scope.oTask.sleep();
					}
					else {
						if (scope.citydbKmlLayerInstance.hasHighlightedObjects() || scope.citydbKmlLayerInstance.hasHiddenObjects()) {	
							scope.rebuildDataPool(); 		    	  		    	
						}
						else {		
							console.log("Highlighting Manager falls asleep...");
							scope.oTask.sleep();
						} 
					}				 					
			    }, 1000); 	
			}	
			else {
				console.log("Highlighting Manager falls asleep...");
				scope.oTask.sleep();
			}				
		});			

		this.dataPool = this.generateDataPool();

		scope.oTask.triggerEvent('initWorker', this.dataPool);		
    }
	
	CitydbKmlHighlightingManager.prototype.generateDataPool = function() {
		var _dataPool = {};
		var primitives = this.citydbKmlLayerInstance._cesiumViewer.scene.primitives;
		for (i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Model) {
				if (primitive.ready) {
					if (primitive._id.layerId === this.citydbKmlLayerInstance._id) {
						var objectId = primitive._id._name;
						_dataPool[objectId] = false;
					}						
				}	
			}
			else if (primitive instanceof Cesium.Primitive && Cesium.defined(primitive._instanceIds)) {				
 				for (j = 0; j < primitive._instanceIds.length; j++){	
 					var targetEntity = primitive._instanceIds[j];
 					if (Cesium.defined(targetEntity.name) && targetEntity.layerId === this.citydbKmlLayerInstance._id) {
 						var objectId = targetEntity.name;
 						_dataPool[objectId] = false;
 					}					
				}							
			}
		}
		return _dataPool;
	}
	
	CitydbKmlHighlightingManager.prototype.updateCachedObjects = function() {
		this.cachedObjects = {}
		var primitives = this.citydbKmlLayerInstance._cesiumViewer.scene.primitives;
		if (this.citydbKmlLayerInstance._layerType == "collada") {
			for (var i = 0; i < primitives.length; i++) {
				var primitive = primitives.get(i);
				if (primitive instanceof Cesium.Model) {
					if (primitive.ready) {
						if (primitive._id.layerId === this.citydbKmlLayerInstance._id) {
							this.cachedObjects[primitive._id._name] = primitive;
						}						
					}									
				}
			}
		}
		else if (this.citydbKmlLayerInstance._layerType == "extruded" || this.citydbKmlLayerInstance._layerType == "footprint" || this.citydbKmlLayerInstance._layerType == "geometry") {
			for (var i = 0; i < primitives.length; i++) {
				var primitive = primitives.get(i);
				if (primitive instanceof Cesium.Primitive && Cesium.defined(primitive._instanceIds)) {
					for (var j = 0; j < primitive._instanceIds.length; j++){	
	 					var targetEntity = primitive._instanceIds[j];
	 					if (Cesium.defined(targetEntity.name) && targetEntity.layerId === this.citydbKmlLayerInstance._id) {
	 						var parentEntity = targetEntity._parent
							if (Cesium.defined(parentEntity)) {
								this.cachedObjects[targetEntity.name] = parentEntity._children;
							}
							else {
								if (targetEntity.name != "Tile border") {
									this.cachedObjects[targetEntity.name] = [targetEntity];
								}
							}
	 					}					
					}	
				}				
			}
		}
	}
	
	CitydbKmlHighlightingManager.prototype.doTerminate = function() {
    	if (this.oTask != null) {       		
    		this.oTask.terminate();
    		this.oTask = null;
    	}	
    }

	CitydbKmlHighlightingManager.prototype.triggerWorker = function() {
    	var scope = this;
    	if (scope.oTask != null) {   
    		if (!scope.citydbKmlLayerInstance.hasHighlightedObjects() && !scope.citydbKmlLayerInstance.hasHiddenObjects())
    			return;
    		if (scope.oTask.isSleep()) {
         		scope.oTask.wake();	
         		console.log("Wake up Highlighting Manager from sleep");
         		scope.rebuildDataPool();  
 			}
    	}            	
    }
    
    CitydbKmlHighlightingManager.prototype.addData = function(objectId) {
    	if (this.oTask != null) {
    		this.oTask.triggerEvent('addData', objectId);
		}	
    }
    
    CitydbKmlHighlightingManager.prototype.removeData = function(objectId) {
    	if (this.oTask != null) {
    		this.oTask.triggerEvent('removeData', objectId);
		}
    }
    
    CitydbKmlHighlightingManager.prototype.clearDataPool = function() {
    	if (this.oTask != null) {
    		this.oTask.triggerEvent('clearDataPool');
		}	
    }
    
    CitydbKmlHighlightingManager.prototype.rebuildDataPool = function() {
    	if (this.oTask != null) {
			console.log("Tiling Manager is sleeping, update the cached objects of layer: " + this.citydbKmlLayerInstance.name);
			this.updateCachedObjects();
			this.dataPool = this.generateDataPool();	
			this.oTask.triggerEvent('rebuildDataPool', this.dataPool);
		}
    }
    
    CitydbKmlHighlightingManager.prototype.getWorkerInstance = function() {
    	return this.oTask;
    }  
    
    window.CitydbKmlHighlightingManager = CitydbKmlHighlightingManager;
})();	