/**
 * A Web-Map3DCityDB class to visualize Layer3DCityDB with Cesium.
 * 
 * @alias Web-Map3DCityDB
 * @constructor
 * 
 * @param {CesiumViewer} cesiumViewer
 */
function WebMap3DCityDB(cesiumViewer){
	this._cesiumViewerInstance = cesiumViewer;
	this._layers = [];	
	this._mouseMoveEvents = false;
	this._mouseClickEvents = false;
	this._eventHandler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
	this._cameraEventAggregator = new Cesium.CameraEventAggregator(cesiumViewer.scene.canvas);
}



/**
 * adds a 3DCityDBLayer to the cesiumViewer
 * @param {3DCityDBLayer} layer
 */
WebMap3DCityDB.prototype.addLayer = function(layer){
	for(var i = 0; i < this._layers.length; i++){
		if(layer.id == this._layers[i].id){
			return;
		}
	}
	layer.addToCesium(this._cesiumViewerInstance);
	this._layers.push(layer);
	return;
}


/**
 * removes a 3DCityDBLayer from the cesiumViewer
 * @param {String} id
 */
WebMap3DCityDB.prototype.removeLayer = function(id){	
	for(var i = 0; i < this._layers.length; i++){
		var layer = this._layers[i]; 
		if(id == layer.id){
			layer.removeFromCesium(this._cesiumViewerInstance);
			this._layers.splice(i, 1);
			return;
		}
	}
	return;
}

/** 
 * activates mouseClick Events over objects 
 * @param {Boolean} active
 */
WebMap3DCityDB.prototype.activateMouseClickEvents = function(active){	
	if(active){
		var that = this;
		this._eventHandler.setInputAction(function(event){
			// When camera is moved do not trigger any other events
			if (that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.LEFT_DRAG) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.MIDDLE_DRAG) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.PINCH ) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG ) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.WHEEL)){
				return;
			}
			var object = that._cesiumViewerInstance.scene.pick(event.position);
			if(object){
				if(object.id.layerId){
					var layerid = object.id.layerId;
					for(var i = 0; i < that._layers.length; i++){
						if(that._layers[i].id == layerid){
							that._layers[i].triggerEvent("CLICK", object);
						}
					}
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);		
	}else{
		this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	this._mouseClickEvents = active;	
}
/** 
 * activates mouseMove Events over objects 
 * @param {Boolean} active
 */
WebMap3DCityDB.prototype.activateMouseMoveEvents = function(active){	
	if(active){
		var that = this;
		var pickingInProgress = false;
		var currentObject = null;
		this._eventHandler.setInputAction(function(event){
			// When camera is moved do not trigger any other events
			if (that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.LEFT_DRAG) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.MIDDLE_DRAG) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.PINCH ) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG ) ||
					that._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.WHEEL)){
				return;
			}
			if(pickingInProgress) return;
			pickingInProgress = true;
			var object = that._cesiumViewerInstance.scene.pick(event.endPosition);
			if(currentObject && currentObject != object){
				if(currentObject.id.layerId){
					var layerid = currentObject.id.layerId;
					for(var i = 0; i < that._layers.length; i++){
						if(that._layers[i].id == layerid){
							that._layers[i].triggerEvent("MOUSEOUT", currentObject);
						}
					}
					currentObject = null;
				}				
			}
			if(object && currentObject != object){			
				if(object.id.layerId){
					var layerid = object.id.layerId;
					for(var i = 0; i < that._layers.length; i++){
						if(that._layers[i].id == layerid){
							that._layers[i].triggerEvent("MOUSEIN", object);
						}
					}
					currentObject = object;
					pickingInProgress =false;
					return;
				}else{
					currentObject = null;
				}
			}
			pickingInProgress =false;
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);		
	}else{
		if(currentObject != null){
			if(currentObject.id.layerId){
				var layerid = currentObject.id.layerId;
				for(var i = 0; i < that._layers.length; i++){
					if(that._layers[i].id == layerid){
						that._layers[i].triggerEvent("MOUSEOUT", object);
					}
				}
			}
		}
		this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	this._mouseMoveEvents = active;	
}


