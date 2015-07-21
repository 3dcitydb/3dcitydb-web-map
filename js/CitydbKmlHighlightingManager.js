/**
 * test
 * **/
(function() {
	
	function CitydbKmlHighlightingManager(citydbKmlLayerInstance) {		
		this.oTask = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlHighlightingManager") + "Webworkers/CitydbKmlHighlightingManagerWebworker.js");
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.monitor = null;
		this.doStart();
	}
	
	CitydbKmlHighlightingManager.prototype.doStart = function() {
    	var scope = this;
    	var highlightedObjects = this.citydbKmlLayerInstance.highlightedObjects;
    	
		// add Listeners
		this.oTask.addListener("checkMasterPool", function (objectId, visibility) {	
			var obj = scope.citydbKmlLayerInstance.getObjectById(objectId)
			
			if (obj != null) {
				if (!obj.ready){	
					scope.oTask.triggerEvent('updateDataPool');
				}
				else {
					if (!scope.citydbKmlLayerInstance.isHighlightedObject(obj)) {
						scope.citydbKmlLayerInstance.highlightObject(obj)
					}
				}
			}		
			scope.oTask.triggerEvent('updateTaskStack');	
		});

		scope.oTask.addListener("refreshView", function (isStillUpdating, dataPool) {	
			if (isStillUpdating || scope.citydbKmlLayerInstance.citydbKmlLayerManager.isDataStreaming()) {
				setTimeout(function() {
					scope.oTask.triggerEvent('checkDataPool');
				}, 500)						
			}
			else {		
				console.log("Highlighting Manager is sleeping...")
				scope.oTask.sleep();
			}										
		});			

		var dataPool = generateDataPool(highlightedObjects);

		scope.oTask.triggerEvent('initWorker', dataPool);		
    }
	
	function generateDataPool(highlightedObjects) {
		var dataPool = {};
		for (var id in highlightedObjects){
			dataPool[id] = false;	
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
         		console.log("triger starting...");
 				scope.oTask.triggerEvent('notifyWake');  
 			}
    		else {
    			scope.oTask.triggerEvent('abortAndnotifyWake');  
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
    	if (this.oTask != null != null) {
			var dataPool =  generateDataPool(this.citydbKmlLayerInstance.highlightedObjects);
			this.oTask.triggerEvent('rebuildDataPool', dataPool);
		}
    }
    
    CitydbKmlHighlightingManager.prototype.getWorkerInstance = function() {
    	return this.oTask;
    }  
    
    window.CitydbKmlHighlightingManager = CitydbKmlHighlightingManager;
})();	