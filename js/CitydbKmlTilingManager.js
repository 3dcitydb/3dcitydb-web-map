/**
 * test
 * **/
(function() {
	function CitydbKmlTilingManager(citydbKmlLayerInstance){	
		this.oWorker = null;
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.showedTiles = new Object();
		this.cachedTiles = new Object();
		this.globeBboxEntity = null;
	}
	
	CitydbKmlTilingManager.prototype.doStart = function() {		
		var scope = this;
		this.oWorker = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlTilingManager") + "Webworkers/CitydbKmlTilingManagerWebworker.js");
		var cesiumViewer = this.citydbKmlLayerInstance._cesiumViewer;
    	var dataSourceCollection = cesiumViewer._dataSourceCollection;
    	var scene = cesiumViewer.scene;
    	var canvas = scene.canvas; 
    	
    	var minLodPixels = this.citydbKmlLayerInstance.minLodPixels;
    	var maxLodPixels = this.citydbKmlLayerInstance.maxLodPixels;
    	
    	// start Hihgighting Manager
    	if (this.citydbKmlLayerInstance.isHighlightingActivated) {
    		this.citydbKmlLayerInstance.citydbKmlHighlightingManager.doStart();
    	}
    	
    	// displayed layers
    	var showedTiles = this.showedTiles;
    	
    	// Caching
    	var cachedTiles = this.cachedTiles;
    	
    	// url of the data layer
    	var masterUrl = this.citydbKmlLayerInstance.url;
    	
		var hostAndPath = null, layername = null, displayForm = null, fileextension = null;
		
    	// check if one json layer or kml layer...
    	if (masterUrl.indexOf(".json") >= 0) {
    		// parsing layer infos..
			var jsonLayerInfo = this.citydbKmlLayerInstance._citydbKmlDataSource._proxy;			
			hostAndPath = CitydbUtil.get_host_and_path_from_URL(masterUrl);
			layername = jsonLayerInfo.layername;
			displayForm = jsonLayerInfo.displayform;
			fileextension = jsonLayerInfo.fileextension;
			var colnum = jsonLayerInfo.colnum;
			var rownum = jsonLayerInfo.rownum;  
			var bbox = jsonLayerInfo.bbox;
			var rowDelta = (bbox.ymax - bbox.ymin) / (rownum + 1);
			var colDelta = (bbox.xmax - bbox.xmin) / (colnum + 1);
			scope.oWorker.triggerEvent('createMatrix', bbox, rowDelta, colDelta, rownum, colnum);	
			// create the master bounding box 
			scope.createBboxGeometry(bbox);    			
    	}
    	else {
    		// creating R Tree as Data pool		
			var networkLinkItems = this.citydbKmlLayerInstance._citydbKmlDataSource._entityCollection._entities._array; 			
			scope.oWorker.triggerEvent('createRTree', networkLinkItems.length - 1);
			for(var i = 0; i < networkLinkItems.length; i++) {					        		
    			var networkLinkKml = networkLinkItems[i];   
    			var kmlLayerInfo = networkLinkKml._pathSubscription;
          		if (typeof kmlLayerInfo != 'undefined') {
          			var url = kmlLayerInfo.kmlUrl;
	        		var minX = kmlLayerInfo.minX;
	        		var minY = kmlLayerInfo.minY;
	        		var maxX = kmlLayerInfo.maxX;
	        		var maxY = kmlLayerInfo.maxY;
	        		var item = [minX, minY, maxX, maxY, {key: url}];
	        		scope.oWorker.triggerEvent('addItemToRTree', item);
          		}
          	}
    	}

		//------------------------------below are the relevant listeners call from the worker--------------------------------//

		/**
		 * 
		 * remove the layers which are not in the vincity
		 * 
		 */
		this.oWorker.addListener("removeDatasources", function () {	
			var promises = [];
			for (var datasourceUrl in showedTiles){
            	var networklinkItem = showedTiles[datasourceUrl];			                	
        		var kmlDatasource = networklinkItem.kmlDatasource;
        		var v1Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerRightCorner);
        		var v2Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperRightCorner);
        		var v3Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperLeftCorner);
        		var v4Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerLeftCorner);
        		if (typeof v1Pos != 'undefined' && typeof v2Pos != 'undefined' && typeof v3Pos != 'undefined'&& typeof v4Pos != 'undefined') {
        			var clientWidth = canvas.clientWidth;
            		var clientHeight = canvas.clientHeight;					        							        		
            		var polygon1 = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
    	        	var polygon2 = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];   	        	
    	        	var promise = scope.calculateTilePixels(polygon1, polygon2, datasourceUrl).then(function(resolveValue){
    	        		var tilePixels = resolveValue[0];
    	        		var datasourceUrl = resolveValue[1];
        	        	if (tilePixels < minLodPixels || tilePixels > maxLodPixels) {
        	        		dataSourceCollection.remove(showedTiles[datasourceUrl].kmlDatasource);
        	        		delete showedTiles[datasourceUrl];
        	        		scope.oWorker.triggerEvent('updateDataPoolRecord');
        	        	} 
    	        	});
    	        	promises.push(promise);
        		}
            }
			Cesium.when.all(promises).then(function() {
				if (masterUrl.indexOf(".json") >= 0) {
					scope.oWorker.triggerEvent('checkDataPool', scope.createFrameBbox(), 'matrix');   			
	        	}
				else {
					scope.oWorker.triggerEvent('checkDataPool', scope.createFrameBbox(), 'rtree');
				}
            })
		});
		
		/**
		 * 
		 * manage the caching and display of the obejcts
		 * matrixItem -> [ minX, minY, maxX, maxY, colnum, rownum ]
		 * 
		 */
		this.oWorker.addListener("checkMasterPool", function (matrixItem) {
			var minX = matrixItem[0];
    		var minY = matrixItem[1];
    		var maxX = matrixItem[2];
    		var maxY = matrixItem[3];
    		
    		var datasourceUrl = null;        		
    		if (masterUrl.indexOf(".json") >= 0) {
    			var colIndex = matrixItem[4].col;
        		var rowIndex = matrixItem[4].row;
        		datasourceUrl = hostAndPath + layername + "_Tile_" + rowIndex + "_" + colIndex + "_" + displayForm + fileextension; 			
        	}
			else {
				datasourceUrl = matrixItem[4].key;
			}

			var lowerRightCorner = Cesium.Cartesian3.fromDegrees(maxX, minY);
			var upperRightCorner = Cesium.Cartesian3.fromDegrees(maxX, maxY);
			var upperLeftCorner = Cesium.Cartesian3.fromDegrees(minX, maxY);
			var lowerLeftCorner = Cesium.Cartesian3.fromDegrees(minX, minY);	
			var v1Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, lowerRightCorner);
    		var v2Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, upperRightCorner);
    		var v3Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, upperLeftCorner);
    		var v4Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, lowerLeftCorner);

    		if (typeof v1Pos != 'undefined' && typeof v2Pos != 'undefined' && typeof v3Pos != 'undefined'&& typeof v4Pos != 'undefined') {
    			var clientWidth = canvas.clientWidth;
        		var clientHeight = canvas.clientHeight;					        							        		
        		var polygon1 = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
	        	var polygon2 = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
	        	
	        	scope.calculateTilePixels(polygon1, polygon2, datasourceUrl).then(function(resolveValue){
	        		var tilePixels = resolveValue[0];
	        		if (cachedTiles.hasOwnProperty(datasourceUrl)) {
		        		if (tilePixels >= minLodPixels && tilePixels <= maxLodPixels) { 
		        			if (!showedTiles.hasOwnProperty(datasourceUrl)) {		        				
		        				var networklinkItem = cachedTiles[datasourceUrl].networklinkItem;
	    	        			var kmlDatasource = networklinkItem.kmlDatasource;
	    	        			showedTiles[datasourceUrl] = networklinkItem;    
    	        				dataSourceCollection.add(kmlDatasource).then(function() { 	        					
    	        					scope.oWorker.triggerEvent('updateTaskStack');
	    		        			console.log("loading layer from Cache...");	
		    	        			// status was changed...
				        			scope.oWorker.triggerEvent('updateDataPoolRecord');		    	        			    										        							        			
		        				}).otherwise(function(error) {
		        					console.log(error);
		        					scope.oWorker.triggerEvent('updateTaskStack');
		        				});	  	    	        			  	        			
		        			} 
		        			else {
		        				scope.oWorker.triggerEvent('updateTaskStack');
		        			}
		        		}
		        		else {
		        			scope.oWorker.triggerEvent('updateTaskStack');
		        		}		        				        		
	        		}
	    			else {
	    				var newKmlDatasource = new CitydbKmlDataSource(scope.citydbKmlLayerInstance.id);
	    				var newNetworklinkItem = {
	    					url: datasourceUrl,
	    					kmlDatasource: newKmlDatasource,
	    					lowerRightCorner: lowerRightCorner,
	    					upperRightCorner: upperRightCorner,
	    					upperLeftCorner: upperLeftCorner,
	    					lowerLeftCorner: lowerLeftCorner        					
	    				};
			
	    				if (tilePixels >= minLodPixels && tilePixels <= maxLodPixels) {
    	        			console.log("loading layer...");	
    	        			// status was changed...
		        			scope.oWorker.triggerEvent('updateDataPoolRecord');
	    					dataSourceCollection.add(newKmlDatasource);  
	    					cachedTiles[datasourceUrl] = {networklinkItem: newNetworklinkItem, cacheStartTime: new Date().getTime()};	  
		        			showedTiles[datasourceUrl] = newNetworklinkItem;
		        			newKmlDatasource.load(datasourceUrl).then(function() { 
		        				scope.oWorker.triggerEvent('updateTaskStack');
	        				}).otherwise(function(error) {
	        					console.log(error);
	        					scope.oWorker.triggerEvent('updateTaskStack');
	        				});
	    				}	
	    				else {	 
	    					scope.oWorker.triggerEvent('updateTaskStack');
	    				}       				
	    			}
	        	});			
    		}
    		else {        					        						        					
				scope.oWorker.triggerEvent('updateTaskStack');	        										        							        				        										        							        			               	
    		}  				
		});

		/**
		 * 
		 * Cachingsize = [number of displayed layers] + [cached layers]
		 * [cached layers] should not be bigger than a threshold value...
		 * 
		 */
		scope.oWorker.addListener("cleanCaching", function (maxCacheSize) {
			// default value
			var _maxCacheSize = scope.citydbKmlLayerInstance.maxSizeOfCachedTiles;
			
			if (Cesium.defined(maxCacheSize)) {
				_maxCacheSize = maxCacheSize;
			}

			var cacheSize = 0;
			var tempCache = new Object();
			for (var cacheID in cachedTiles){	
				if (!showedTiles.hasOwnProperty(cacheID)) {
					tempCache[cacheID] = cachedTiles[cacheID].cacheStartTime;  	
        			cacheSize++;
    			} 
            }

			while (cacheSize > _maxCacheSize) {
				var cacheRecordMinTime = Number.MAX_VALUE;
				var cacheRocordID = null;
				for (var cacheID in tempCache){
                	var cacheStartTime = tempCache[cacheID];			                	
            		if (cacheStartTime < cacheRecordMinTime) {
                		cacheRecordMinTime = cacheStartTime;
                		cacheRocordID = cacheID;
                	}			                				                	
                } 
				tempCache[cacheRocordID] = Number.MAX_VALUE;
			//	Cesium.destroyObject(cachedTiles[cacheRocordID].networklinkItem.kmlDatasource);
				delete cachedTiles[cacheRocordID];
    			cacheSize--;
    		}
			console.log("Current Cache size is: " + Object.keys(scope.cachedTiles).length);		        										        							        			           
		});
		
		
		/**
		 * 
		 * update the statusbar and Highlighting status of the KML objects		
		 *  
		 */
		scope.oWorker.addListener("refreshView", function () {
			scope.oWorker.oListeners["cleanCaching"].call(this); 
			scope.oWorker.sleep();	
			// trigger Highlighting Manager again...
    		if (scope.citydbKmlLayerInstance.isHighlightingActivated) {
    			scope.citydbKmlLayerInstance.citydbKmlHighlightingManager.triggerWorker();
    		} 
		});	
		
		//-------------------------------------------------------------------------------------------------//
		
	    // event Listeners are so far, we start the worker...

		if (masterUrl.indexOf(".json") >= 0) {
			scope.oWorker.triggerEvent('initWorker', scope.createFrameBbox(), scope.citydbKmlLayerInstance.maxCountOfVisibleTiles, scope.citydbKmlLayerInstance.maxNumberOfConcurrentXhrs, 'matrix');  			
    	}
		else {
			scope.oWorker.triggerEvent('initWorker', scope.createFrameBbox(), scope.citydbKmlLayerInstance.maxCountOfVisibleTiles, scope.citydbKmlLayerInstance.maxNumberOfConcurrentXhrs, 'rtree');
		}
				
		this.runMonitoring();
    },
    
    CitydbKmlTilingManager.prototype.isDataStreaming = function() {
    	if (this.oWorker == null)
    		return false;
    	return this.oWorker.isSleep()? false: true;   	 
    },
    
    CitydbKmlTilingManager.prototype.clearCaching = function() {
    	if (this.oWorker == null)
    		return false;
    	this.oWorker.oListeners["cleanCaching"].call(this, 0); 	 
    },
    
    /**
     * 
	 * create and add bounding box geometry in Cesium
	 * 
	 */
    CitydbKmlTilingManager.prototype.createBboxGeometry = function(bbox) {
    	var rectangle = Cesium.Rectangle.fromDegrees(bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax);
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
    	this.globeBboxEntity = {
        	id: Cesium.createGuid(),
            rectangle : {
                coordinates : rectangle,
                fill : false,
                outline : true,
                outlineWidth : 20,
                outlineColor : Cesium.Color.BLUE
            }
        }
        cesiumViewer.entities.add(this.globeBboxEntity);
    },
    
    CitydbKmlTilingManager.prototype.calculateTilePixels = function(polygon1, polygon2, datasourceUrl) {
    	var that = this;
    	var deferred = Cesium.when.defer();
    	var funcId = Cesium.createGuid();
    	that.oWorker.triggerEvent('calculatePixels', polygon1, polygon2, funcId); 	        	
    	that.oWorker.addListener(funcId, function (tilePixels) {    		   		
    		deferred.resolve([tilePixels, datasourceUrl]);
    		that.oWorker.removeListener(funcId);	
    	})	
    	return deferred.promise;
    },
    
    /**
     * 
	 * create bounding box in monitor coordinate system
	 * 
	 */
    CitydbKmlTilingManager.prototype.createFrameBbox = function() {
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
    	var cesiumWidget = cesiumViewer.cesiumWidget; 
    	var camera = cesiumWidget.scene.camera;
    	var canvas = cesiumWidget.scene.canvas;

    	var frameWidth = canvas.clientWidth;
    	var frameHeight = canvas.clientHeight;

    	var factor = 0;
    	var originHeight = 0;
    	var cartesian3Indicator = camera.pickEllipsoid(new Cesium.Cartesian2(0, 0));
    	
    	while (!Cesium.defined(cartesian3Indicator)) {
    		factor++
    		if (factor > 10)
    			break;
    		originHeight = originHeight + frameHeight*factor*0.1;
    		cartesian3Indicator = camera.pickEllipsoid(new Cesium.Cartesian2(0, originHeight));    		
    	}
    	    	
		var cartesian3OfFrameCorner1 = camera.pickEllipsoid(new Cesium.Cartesian2(frameWidth , frameHeight));
    	var cartesian3OfFrameCorner2 = camera.pickEllipsoid(new Cesium.Cartesian2(0, originHeight));
    	var cartesian3OfFrameCorner3 = camera.pickEllipsoid(new Cesium.Cartesian2(0, frameHeight));
    	var cartesian3OfFrameCorner4 = camera.pickEllipsoid(new Cesium.Cartesian2(frameWidth, originHeight));    	
    	
    	if (Cesium.defined(cartesian3OfFrameCorner1) && Cesium.defined(cartesian3OfFrameCorner2) && Cesium.defined(cartesian3OfFrameCorner3) && Cesium.defined(cartesian3OfFrameCorner4)) {
    		var wgs84OfFrameCorner1  = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner1);			
    		var wgs84OfFrameCorner2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner2);			
    		var wgs84OfFrameCorner3 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner3);			
    		var wgs84OfFrameCorner4 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner4);
    		
    		var frameMinX = Math.min(wgs84OfFrameCorner1.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.longitude*180 / Cesium.Math.PI);
    		var frameMaxX = Math.max(wgs84OfFrameCorner1.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.longitude*180 / Cesium.Math.PI);
    		var frameMinY = Math.min(wgs84OfFrameCorner1.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.latitude*180 / Cesium.Math.PI);
    		var frameMaxY = Math.max(wgs84OfFrameCorner1.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.latitude*180 / Cesium.Math.PI);

        	return [frameMinX, frameMinY, frameMaxX, frameMaxY];
    	}
    	else {
    		// in the case when the camera are looking at air
    		return [0,0,0,0];
    	}		
    };

    /**
     * 
	 * check if the networklink manager is started of not
	 * 
	 */
    CitydbKmlTilingManager.prototype.isStarted = function() {
    	if (this.oWorker == null) {
    		return false;
    	}
    	else {
    		return true;
    	}
    };
    
    /**
     * 
	 * terminate the networklink manager
	 * 
	 */
    CitydbKmlTilingManager.prototype.doTerminate = function() {
    	if (this.oWorker != null) {       		
    		this.oWorker.terminate();
    		this.oWorker = null;
    		
    		var cesiumViewer = this.citydbKmlLayerInstance._cesiumViewer;
        	var dataSourceCollection = cesiumViewer._dataSourceCollection;
        	        	
    		for (var datasourceUrl in this.showedTiles){
            	var networklinkItem = this.showedTiles[datasourceUrl];			                	
        		var kmlDatasource = networklinkItem.kmlDatasource;
        		dataSourceCollection.remove(kmlDatasource);
            }
    		this.showedTiles = {};
    		this.cachedTiles = {};
    		
    		if (this.globeBboxEntity != null) {
    			cesiumViewer.entities.remove(this.globeBboxEntity);
    		}
    		
    		// terminate Hihgighting Manager
        	if (this.citydbKmlLayerInstance.isHighlightingActivated) {
        		this.citydbKmlLayerInstance.citydbKmlHighlightingManager.doTerminate();
        	}
    	}	
    };
    
    /**
     * 
	 * get worker instance
	 * 
	 */
    CitydbKmlTilingManager.prototype.getWorkerInstance = function() {
    	return this.oWorker;
    },
    
    /**
     * 
	 * public function to trigger Networklnk Manager
	 * 
	 */          
    CitydbKmlTilingManager.prototype.triggerWorker = function() {
    	var scope = this;
    	if (scope.oWorker != null) {       		
    		if (scope.oWorker.isSleep()) {
         		scope.oWorker.wake();	
         		console.log("trigger starting...");
 				scope.oWorker.triggerEvent('notifyWake');  
 			}
    		else {
    			scope.oWorker.triggerEvent('abortAndnotifyWake');  
    		}	
    	}            	
    },
    
    /**
     * 
	 * control and manager the networklink manager and the highiting events
	 * 
	 */       
    CitydbKmlTilingManager.prototype.runMonitoring = function() {
    	var scope = this;
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
    	var scene = cesiumViewer.scene;
    	
    	scope.citydbKmlLayerInstance.registerEventHandler("VIEWCHANGED", function() {
    		scope.triggerWorker();
		});
    };
		
	window.CitydbKmlTilingManager = CitydbKmlTilingManager;
})()