/**
 * test
 * **/
(function() {
	
	function CitydbKmlHighlightingManager(citydbKmlLayerInstance) {		
		this.oTask = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlHighlightingManager") + "Webworkers/CitydbKmlHighlightingManagerWebworker.js");
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.monitor = null;
		this.objectCollection = {};
		this.shouldRun = true;
	}
	
	CitydbKmlHighlightingManager.prototype.doStart = function() {
    	var scope = this;
    	var highlightedObjects = this.citydbKmlLayerInstance.highlightedObjects;
    	
		// add Listeners
		this.oTask.addListener("checkMasterPool", function (objectId, visibility) {			
			if (scope.citydbKmlLayerInstance.isInHighlightedList(objectId)) {
				var obj = scope.objectCollection[objectId];
				if (!scope.citydbKmlLayerInstance.isHighlightedObject(obj)) {
					scope.citydbKmlLayerInstance.highlightObject(obj);
					scope.oTask.triggerEvent('updateDataPool');
				}										
			}
			scope.oTask.triggerEvent('updateTaskStack');
		});

		scope.oTask.addListener("refreshView", function (isStillUpdating, dataPool) {	
			if (isStillUpdating || scope.citydbKmlLayerInstance.citydbKmlTilingManager.isDataStreaming() || scope.shouldRun) {
				setTimeout(function(){   	
					console.log("Highlighting manager repeat updating again...");
    		    	scope.rebuildDataPool();    		    	
    		    }, 1000); 
			}
			else {		
				console.log("Highlighting Manager is sleeping...")
				scope.oTask.sleep();
			}					
		});			

		var dataPool = this.generateDataPool(highlightedObjects);

		scope.oTask.triggerEvent('initWorker', dataPool);		
    }
	
	CitydbKmlHighlightingManager.prototype.generateDataPool = function(highlightedObjects) {
		var dataPool = {};
		var primitives = this.citydbKmlLayerInstance._cesiumViewer.scene.primitives;
		for (i = 0; i < primitives.length; i++) {
			var primitive = primitives.get(i);
			if (primitive instanceof Cesium.Model) {
				if (primitive.ready) {
					dataPool[primitive._id._name] = false;	
					this.objectCollection[primitive._id._name] = primitive;	
				}	
				else {
					this.shouldRun = true;
				}
			}
		}
		return dataPool;
	}
		
	CitydbKmlHighlightingManager.prototype.doTerminate = function() {
    	if (this.oTask != null) {       		
    		clearInterval(this.monitor);
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
 				scope.oTask.triggerEvent('notifyWake');  
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
    		this.shouldRun = false;
			var dataPool = this.generateDataPool(this.citydbKmlLayerInstance.highlightedObjects);
			this.oTask.triggerEvent('rebuildDataPool', dataPool);
		}
    }
    
    CitydbKmlHighlightingManager.prototype.getWorkerInstance = function() {
    	return this.oTask;
    }  
    
    window.CitydbKmlHighlightingManager = CitydbKmlHighlightingManager;
})();	