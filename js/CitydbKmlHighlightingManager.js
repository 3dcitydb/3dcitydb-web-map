/**
 * test
 * **/
(function() {
	
	function CitydbKmlHighlightingManager(citydbKmlLayerInstance) {		
		this.oTask = null;
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
	}
	
	CitydbKmlHighlightingManager.prototype.doStart = function() {
    	var scope = this;
    	
    	this.oTask = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlHighlightingManager") + "Webworkers/CitydbKmlHighlightingManagerWebworker.js");
    	
		// add Listeners
		this.oTask.addListener("checkMasterPool", function (objectId, visibility) {	
			// update Hidden/Show
			if (scope.citydbKmlLayerInstance.isInHiddenList(objectId)) {
				var obj = scope.citydbKmlLayerInstance.getObjectById(objectId);
				if (!scope.citydbKmlLayerInstance.isHiddenObject(obj)) {
					scope.citydbKmlLayerInstance.hideObject(obj);
					scope.oTask.triggerEvent('updateDataPool');
				}
			}
			// update Highlighting
			if (scope.citydbKmlLayerInstance.isInHighlightedList(objectId)) {
				var obj = scope.citydbKmlLayerInstance.getObjectById(objectId);
				if (!scope.citydbKmlLayerInstance.isHighlightedObject(obj)) {
					scope.citydbKmlLayerInstance.highlightObject(obj);
					scope.oTask.triggerEvent('updateDataPool');
				}					
			}

			scope.oTask.triggerEvent('updateTaskStack');
		});

		scope.oTask.addListener("refreshView", function (isStillUpdating, dataPool) {	
			if (scope.citydbKmlLayerInstance.hasHighlightedObjects() || scope.citydbKmlLayerInstance.hasHiddenObjects()) {	
				console.log("Highlighting manager repeat updating again...");
		    	scope.rebuildDataPool();    		    	
			}
			else {		
				console.log("Highlighting Manager is sleeping...")
				scope.oTask.sleep();
			}					
		});			

		var dataPool = this.generateDataPool();

		scope.oTask.triggerEvent('initWorker', dataPool);		
    }
	
	CitydbKmlHighlightingManager.prototype.generateDataPool = function() {
		var dataPool = {};
		var primitives = this.citydbKmlLayerInstance._cesiumViewer.scene.primitives;
		for (i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Model) {
				if (primitive.ready) {
					dataPool[primitive._id._name] = false;	
				}	
			}
			else if (primitive instanceof Cesium.Primitive) {				
 				for (j = 0; j < primitive._instanceIds.length; j++){	
 					var targetEntity = primitive._instanceIds[j];
 					if (Cesium.defined(targetEntity.name)) {
 						dataPool[targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '')] = false;	
 					}					
				}							
			}
		}
		return dataPool;
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
    		if (scope.oTask.isSleep()) {
         		scope.oTask.wake();	
         		console.log("trigger starting...");
         		scope.rebuildDataPool();  
 			}
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
			var dataPool = this.generateDataPool();
			this.oTask.triggerEvent('rebuildDataPool', dataPool);
		}
    }
    
    CitydbKmlHighlightingManager.prototype.getWorkerInstance = function() {
    	return this.oTask;
    }  
    
    window.CitydbKmlHighlightingManager = CitydbKmlHighlightingManager;
})();	