/**
 * A Web-Map3DCityDB class to visualize Layer3DCityDB with Cesium.
 *
 * @alias Web-Map3DCityDB
 * @constructor
 *
 * @param {CesiumViewer} cesiumViewer
 */
(function() {
	function WebMap3DCityDB(cesiumViewer){
		this._cesiumViewerInstance = cesiumViewer;
		this._layers = [];
		this._mouseMoveEvents = false;
		this._mouseClickEvents = false;
		this._eventHandler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
		this._cameraEventAggregator = new Cesium.CameraEventAggregator(cesiumViewer.scene.canvas);
		this._activeLayer = undefined;
		Cesium.knockout.track(this, ['_activeLayer']);
	}

	Object.defineProperties(WebMap3DCityDB.prototype, {
	    /**
	     * Gets or sets the active layer
	     * @memberof WebMap3DCityDB.prototype
	     * @type {3DCityDBLayer}
	     */
		activeLayer : {
	        get : function(){
	        	return this._activeLayer;
	        },
			set : function(value) {
				if (Cesium.defined(this._activeLayer)) {
					if (this._activeLayer.id != value.id) {
						this._activeLayer = value;
					}
				}
				else {
					this._activeLayer = value;
				}
			}
	    }
	});

	/**
	 * pass the object and modifier to the layer
	 * @param {string} modifier
	 * @param {Object} object
	 */
	WebMap3DCityDB.prototype.passEventToLayer = function(modifier, object){
		if(object){
			var i = 0;
			if(Cesium.BatchedModel && object instanceof Cesium.BatchedModel){
				var url = object.primitive.url;
				for(i = 0; i < this._layers.length; i++){
					if(this._layers[i].url == url){
						this._layers[i].triggerEvent(modifier, object);
						return true;
					}
				}
			}else{
				if(object.id && object.id.layerId){
					var layerid = object.id.layerId;
					for(i = 0; i < this._layers.length; i++){
						if(this._layers[i].id == layerid){
							this._layers[i].triggerEvent(modifier, object);
							return true;
						}
					}
				}
			}
		}
		return false;
	};

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
	};

	/**
	 * get a 3DCityDBLayer with the specified id
	 * @param {String} layerId
	 * @returns {3DCityDBLayer} The 3DCityDBLayer with the provided id or null if the id did not exist.
	 */
	WebMap3DCityDB.prototype.getLayerbyId = function(layerId){
		for (var i = 0; i < this._layers.length; i++){
			if (layerId == this._layers[i].id){
				return this._layers[i];
			}
		}
		return null;
	};

	/**
	 * @returns {Array.<3DCityDBLayer>} An array with 3dcitydb layer
	 */
	WebMap3DCityDB.prototype.getLayers = function(){
		return this._layers;
	};

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
	};

	/**
	 * activates viewchanged Event
	 * This event will be fired many times when the camera position or direction is changing
	 * @param {Boolean} active
	 */
	WebMap3DCityDB.prototype.activateViewChangedEvent = function(active){
		var that = this;
		var cesiumWidget = this._cesiumViewerInstance.cesiumWidget;
	    var camera = cesiumWidget.scene.camera;
	    var posX = camera.position.x;
	    var posY = camera.position.y;
	    var posZ = camera.position.z;
	    var dirX = camera.direction.x;
	    var dirY = camera.direction.y;
	    var dirZ = camera.direction.z;

	    // tolerance
	    var posD = 3;
		var dirD = 0.001;

		var listenerFunc = function() {
	    	var currentCamera = cesiumWidget.scene.camera;
	        var _posX = currentCamera.position.x;
	        var _posY = currentCamera.position.y;
	        var _posZ = currentCamera.position.z;
	        var _dirX = currentCamera.direction.x;
	        var _dirY = currentCamera.direction.y;
	        var _dirZ = currentCamera.direction.z;

	        if (Math.abs(posX - _posX) > posD ||
		    		Math.abs(posY - _posY) > posD ||
		    		Math.abs(posZ - _posZ) > posD ||
		    		Math.abs(dirX - _dirX) > dirD ||
		    		Math.abs(dirY - _dirY) > dirD ||
		    		Math.abs(dirZ - _dirZ) > dirD) {
	            console.log('view changed');
	            posX = _posX;
	            posY = _posY;
	            posZ = _posZ;
	            dirX = _dirX;
	            dirY = _dirY;
	            dirZ = _dirZ;
	            for (var i = 0; i < that._layers.length; i++){
					that._layers[i].triggerEvent("VIEWCHANGED");
				}
	        }
	    };

		if (active){
		    cesiumWidget.clock.onTick.addEventListener(listenerFunc);
		}
	};

	/**
	 * activates mouseClick Events over objects
	 * @param {boolean} active
	 */
	WebMap3DCityDB.prototype.activateMouseClickEvents = function(active){
		if(active){
			this._eventHandler.setInputAction(goog.bind(function(event){
				var object = this._cesiumViewerInstance.scene.pick(event.position);
				this.passEventToLayer("CLICK", object);
			}, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
			this._eventHandler.setInputAction(goog.bind(function(event){
				var object = this._cesiumViewerInstance.scene.pick(event.position);
				this.passEventToLayer("CTRLCLICK", object);
			}, this), Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
		}else{
			this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
			this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
		}
		this._mouseClickEvents = active;
	};

	/**
	 * activates mouseMove Events over objects
	 * @param {Boolean} active
	 */
	WebMap3DCityDB.prototype.activateMouseMoveEvents = function(active){
		var pickingInProgress = false;
		var currentObject = null;
		if(active){
			this._eventHandler.setInputAction(goog.bind(function(event){
				// When camera is moved do not trigger any other events
				if (this._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.LEFT_DRAG) ||
						this._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.MIDDLE_DRAG) ||
						this._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.PINCH ) ||
						this._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.RIGHT_DRAG ) ||
						this._cameraEventAggregator.isButtonDown(Cesium.CameraEventType.WHEEL)){
					return;
				}
				if(pickingInProgress) return;
				pickingInProgress = true;
				var object = this._cesiumViewerInstance.scene.pick(event.endPosition);
				if(currentObject && currentObject != object){
					if(this.passEventToLayer("MOUSEOUT", currentObject)){
						currentObject = null;
					}
				}
				if(object && currentObject != object){
					if(!this.passEventToLayer("MOUSEIN", object)){
						currentObject = null;
					}else{
						currentObject = object;
					}
				}
				pickingInProgress =false;
			}, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		}else{
			if(currentObject !== null){
				this.passEventToLayer("MOUSEOUT", currentObject);
				currentObject = null;
			}
			this._eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		}
		this._mouseMoveEvents = active;
	};
	window.WebMap3DCityDB = WebMap3DCityDB;
})();
