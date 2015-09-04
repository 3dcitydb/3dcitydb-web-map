/**
 * test
 * **/
(function() {
	
	function CitydbKmlHighlightingManager(citydbKmlLayerInstance) {		
		this.oTask = null;
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.dataPool = {};
		this.cachedObjects = {};
	}
	
	CitydbKmlHighlightingManager.prototype.doStart = function() {
    	var scope = this;
    	
    	this.oTask = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlHighlightingManager") + "Webworkers/CitydbKmlHighlightingManagerWebworker.js");
    	
		// add Listeners
		this.oTask.addListener("checkMasterPool", function (objectId, visibility) {	
		//	var obj = scope.citydbKmlLayerInstance.getObjectById(objectId);
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
			}
			setTimeout(function(){   	
				scope.oTask.triggerEvent('updateTaskStack'); 		    	
		    }, 50); 			
		});

		scope.oTask.addListener("refreshView", function (isStillUpdating, dataPool) {	
			if (scope.citydbKmlLayerInstance.hasHighlightedObjects() || scope.citydbKmlLayerInstance.hasHiddenObjects()) {	
				console.log("Highlighting manager repeat updating again...");
				setTimeout(function(){   	
					scope.rebuildDataPool();   		    	
    		    }, 3000); 		    	  		    	
			}
			else {		
				console.log("Highlighting Manager is sleeping...")
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
			else if (primitive instanceof Cesium.Primitive) {				
 				for (j = 0; j < primitive._instanceIds.length; j++){	
 					var targetEntity = primitive._instanceIds[j];
 					if (Cesium.defined(targetEntity.name) && targetEntity.layerId === this.citydbKmlLayerInstance._id) {
 						var objectId;
 						if (this.citydbKmlLayerInstance.pickSurface) {
 							objectId = targetEntity.name;
 						}
 						else {
 							objectId = targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
 							
 						}
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
		for (i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Model) {
				if (primitive.ready) {
					if (primitive._id.layerId === this.citydbKmlLayerInstance._id) {
						var objectId = primitive._id._name;
						var tmpObject = this.citydbKmlLayerInstance.getObjectById(objectId);
						this.cachedObjects[objectId] = tmpObject;
					}						
				}	
			}
			else if (primitive instanceof Cesium.Primitive) {				
 				for (j = 0; j < primitive._instanceIds.length; j++){	
 					var targetEntity = primitive._instanceIds[j];
 					if (Cesium.defined(targetEntity.name) && targetEntity.layerId === this.citydbKmlLayerInstance._id) {
 						var objectId;
 						if (this.citydbKmlLayerInstance.pickSurface) {
 							objectId = targetEntity.name;
 						}
 						else {
 							objectId = targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
 							
 						}
						var tmpObject = this.citydbKmlLayerInstance.getObjectById(objectId);
						this.cachedObjects[objectId] = tmpObject;
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
         		console.log("trigger starting...");
         		scope.rebuildDataPool();  
 			}
    		scope.updateCachedObjects();
    	}            	
    },
    
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
			console.log("Tiling manager is sleeping and update the data pool now " + this.citydbKmlLayerInstance.name);
			this.dataPool = this.generateDataPool();	
			this.oTask.triggerEvent('rebuildDataPool', this.dataPool);
		}
    }
    
    CitydbKmlHighlightingManager.prototype.getWorkerInstance = function() {
    	return this.oTask;
    }  
    
    window.CitydbKmlHighlightingManager = CitydbKmlHighlightingManager;
})();	