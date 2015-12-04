/**
 * test
 * **/
(function() {
	function CitydbKmlTilingManager(citydbKmlLayerInstance){	
		this.oTask = null;
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.dataPoolKml = new Object();
		this.networklinkCache = new Object();
		this.boundingboxEntity = null;
	}
	
	function calculatePixels(tilePolygon, framePolygon) {
    	var intersectedPolygon = intersectionPolygons(tilePolygon, framePolygon);
    	var intersectedPixels = CitydbUtil.polygonArea(intersectedPolygon);
    	if (intersectedPixels > 0) {
    		var x1 = tilePolygon[0].x;
    		var y1 = tilePolygon[0].y;
    		var x2 = tilePolygon[1].x;
    		var y2 = tilePolygon[1].y;
    		var x3 = tilePolygon[2].x;
    		var y3 = tilePolygon[2].y;
    		var x4 = tilePolygon[3].x;
    		var y4 = tilePolygon[3].y;	        		
    		var lengthOfDiagonal1 =  Math.sqrt((x1 - x3)*(x1 - x3) + (y1 - y3)*(y1 - y3));
    		var lengthOfDiagonal2 =  Math.sqrt((x2 - x4)*(x2 - x4) + (y2 - y4)*(y2 - y4));
    		var lengthOfDiagonal = (lengthOfDiagonal1 + lengthOfDiagonal2) / 2;
    		return lengthOfDiagonal;
    	}
    	return Math.sqrt(intersectedPixels);
	}
	
	CitydbKmlTilingManager.prototype.doStart = function() {		
		var scope = this;
		var workerPath = CitydbUtil.retrieveURL("CitydbKmlTilingManager");
		if (typeof workerPath == 'undefined') {
			workerPath = CitydbUtil.retrieveURL("3dcitydb-web-map-api");
		}
		this.oTask = new CitydbWebworker(workerPath + "Webworkers/CitydbKmlTilingManagerWebworker.js");    	 	
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
    	var dataSourceCollection = cesiumViewer._dataSourceCollection;  
    	var cesiumWidget = cesiumViewer.cesiumWidget; 
    	var scene = cesiumWidget.scene;
    	var camera = scene.camera;
    	var canvas = scene.canvas;
    	var globe = scene.globe;
    	
    	var minLodPixels = this.citydbKmlLayerInstance.minLodPixels;
    	var maxLodPixels = this.citydbKmlLayerInstance.maxLodPixels;
    	
    	// start Hihgighting Manager
    	if (this.citydbKmlLayerInstance.isHighlightingActivated) {
    		this.citydbKmlLayerInstance.citydbKmlHighlightingManager.doStart();
    	}
    	
    	// displayed layers
    	var dataPoolKml = this.dataPoolKml;
    	
    	// Caching
    	var networklinkCache = this.networklinkCache;
    	
    	// url of the data layer
    	var masterUrl = this.citydbKmlLayerInstance.url;
    	
		var hostAndPath = null, layername = null, displayForm = null, fileextension = null;

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
		scope.oTask.triggerEvent('createMatrix', bbox, rowDelta, colDelta, rownum, colnum);	
		
		// create the master bounding box 
		scope.createBboxGeometry(bbox);    			

		//------------------------------below are the relevant listeners call from the worker--------------------------------//

		/**
		 * 
		 * remove the layers which are not in the vincity
		 * 
		 */
		this.oTask.addListener("removeDatasources", function () {					
			for (var tileUrl in dataPoolKml){
            	var networklinkItem = dataPoolKml[tileUrl];			                	
        		var kmlDatasource = networklinkItem.kmlDatasource;
        		var v1Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerRightCorner);
        		var v2Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperRightCorner);
        		var v3Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperLeftCorner);
        		var v4Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerLeftCorner);        	
    			var clientWidth = canvas.clientWidth;
        		var clientHeight = canvas.clientHeight;					        							        		
        		var tilePolygon = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
	        	var framePolygon = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
	        	var pixelCoveringSize = calculatePixels(tilePolygon, framePolygon);   	        	
	        	if (pixelCoveringSize < minLodPixels || pixelCoveringSize > maxLodPixels) {
	        		dataSourceCollection.remove(kmlDatasource);
	        		delete dataPoolKml[tileUrl];
	        		scope.oTask.triggerEvent('updateDataPoolRecord');
	        	}         		
            }
			scope.oTask.triggerEvent('checkDataPool', scope.createFrameBbox());   						
		});
		
		/**
		 * 
		 * manage the caching and display of the obejcts
		 * matrixItem -> [ minX, minY, maxX, maxY, colnum, rownum ]
		 * 
		 */
		this.oTask.addListener("checkMasterPool", function (matrixItem) {
			var minX = matrixItem[0];
    		var minY = matrixItem[1];
    		var maxX = matrixItem[2];
    		var maxY = matrixItem[3];
    		
			var colIndex = matrixItem[4].col;
    		var rowIndex = matrixItem[4].row;
    		var tileUrl = hostAndPath + layername + "_Tile_" + rowIndex + "_" + colIndex + "_" + displayForm + fileextension; 			

    		var lowerRightCorner;
			var upperRightCorner;
			var upperLeftCorner;
			var lowerLeftCorner;	
			
			var clientWidth = canvas.clientWidth;
    		var clientHeight = canvas.clientHeight;	   
    		
    		if (cesiumViewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
    			lowerRightCorner = Cesium.Cartesian3.fromDegrees(maxX, minY);
    			upperRightCorner = Cesium.Cartesian3.fromDegrees(maxX, maxY);
    			upperLeftCorner = Cesium.Cartesian3.fromDegrees(minX, maxY);
    			lowerLeftCorner = Cesium.Cartesian3.fromDegrees(minX, minY);
    			
        	}
        	else {        		     		
        		var intersectedPoint = globe.pick(camera.getPickRay(new Cesium.Cartesian2(clientWidth/2 , clientHeight/2)), scene);
        		if (typeof intersectedPoint == 'undefined') {
        			scope.oTask.triggerEvent('updateTaskStack');
        			scope.oTask.triggerEvent('updateDataPoolRecord');	
        			return;
        		}
        		var terrainHeight = Cesium.Ellipsoid.WGS84.cartesianToCartographic(intersectedPoint).height;	
    			lowerRightCorner = Cesium.Cartesian3.fromDegrees(maxX, minY, terrainHeight);
    			upperRightCorner = Cesium.Cartesian3.fromDegrees(maxX, maxY, terrainHeight);
    			upperLeftCorner = Cesium.Cartesian3.fromDegrees(minX, maxY, terrainHeight);
    			lowerLeftCorner = Cesium.Cartesian3.fromDegrees(minX, minY, terrainHeight);	
        	}

			var v1Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, lowerRightCorner);
    		var v2Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, upperRightCorner);
    		var v3Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, upperLeftCorner);
    		var v4Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, lowerLeftCorner);
	        							        		
    		var tilePolygon = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
        	var framePolygon = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
        	var pixelCoveringSize = calculatePixels(tilePolygon, framePolygon);	        	

    		if (networklinkCache.hasOwnProperty(tileUrl)) {
        		if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) { 
        			if (!dataPoolKml.hasOwnProperty(tileUrl)) {		        				
        				var networklinkItem = networklinkCache[tileUrl].networklinkItem;
        				networklinkItem.lowerRightCorner = lowerRightCorner;
        				networklinkItem.upperRightCorner = upperRightCorner;
        				networklinkItem.upperLeftCorner = upperLeftCorner;
        				networklinkItem.lowerLeftCorner = lowerLeftCorner;
        				
	        			var kmlDatasource = networklinkItem.kmlDatasource;
	        			dataPoolKml[tileUrl] = networklinkItem;    
        				dataSourceCollection.add(kmlDatasource).then(function() { 	        					
        					scope.oTask.triggerEvent('updateTaskStack');
		        			console.log("loading layer...");	
    	        			// status was changed...
		        			scope.oTask.triggerEvent('updateDataPoolRecord');		    	        			    										        							        			
        				}).otherwise(function(error) {
        					scope.oTask.triggerEvent('updateTaskStack');
        				});	  	    	        			  	        			
        			} 
        			else {
        				scope.oTask.triggerEvent('updateTaskStack');
        			}
        		}
        		else {
        			scope.oTask.triggerEvent('updateTaskStack');
        		}		        				        		
    		}
			else {
				var newKmlDatasource = new CitydbKmlDataSource(scope.citydbKmlLayerInstance.id);
				var newNetworklinkItem = {
					url: tileUrl,
					kmlDatasource: newKmlDatasource,
					lowerRightCorner: lowerRightCorner,
					upperRightCorner: upperRightCorner,
					upperLeftCorner: upperLeftCorner,
					lowerLeftCorner: lowerLeftCorner        					
				};
				
				if (scope.citydbKmlLayerInstance._maxSizeOfCachedTiles >= 0) {
					networklinkCache[tileUrl] = {networklinkItem: newNetworklinkItem, cacheStartTime: new Date().getTime()};	
				}
   				
				if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) {
        			console.log("loading layer...");	
        			// status was changed...
        			scope.oTask.triggerEvent('updateDataPoolRecord');
					dataSourceCollection.add(newKmlDatasource);    						 
        			dataPoolKml[tileUrl] = newNetworklinkItem;
        			newKmlDatasource.load(tileUrl).then(function() { 
        				scope.oTask.triggerEvent('updateTaskStack');
    				}).otherwise(function(error) {
    					scope.oTask.triggerEvent('updateTaskStack');
    				});
				}	
				else {	
					if (scope.citydbKmlLayerInstance._maxSizeOfCachedTiles >= 0) {
						newKmlDatasource.load(tileUrl).then(function() {	
							scope.oTask.triggerEvent('updateTaskStack');
	    					console.log("cache loaded...");	        							        					        										        							        			
	    				}).otherwise(function(error) {
	    					console.log(error);
	    					scope.oTask.triggerEvent('updateTaskStack');
	    				});
					}
					else {
						scope.oTask.triggerEvent('updateTaskStack');
					}					
				}       				
			}
		});

		/**
		 * 
		 * Cachingsize = [number of displayed layers] + [cached layers]
		 * [cached layers] should not be bigger than a threshold value...
		 * 
		 */
		scope.oTask.addListener("cleanCaching", function (maxCacheSize) {
			// default value
			var _maxCacheSize = scope.citydbKmlLayerInstance.maxSizeOfCachedTiles;
			
			if (Cesium.defined(maxCacheSize)) {
				_maxCacheSize = maxCacheSize;
			}

			var cacheSize = 0;
			var tempCache = new Object();
			for (var cacheID in networklinkCache){	
				if (!dataPoolKml.hasOwnProperty(cacheID)) {
					tempCache[cacheID] = networklinkCache[cacheID].cacheStartTime;  	
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
				Cesium.destroyObject(networklinkCache[cacheRocordID].networklinkItem.kmlDatasource);
				delete networklinkCache[cacheRocordID];
    			cacheSize--;
    		}
			console.log("Current Cache size is: " + Object.keys(scope.networklinkCache).length);		        										        							        			           
		});
		
		
		/**
		 * 
		 * update the statusbar and Highlighting status of the KML objects		
		 *  
		 */
		scope.oTask.addListener("refreshView", function () {
			scope.oTask.oListeners["cleanCaching"].call(this); 
			scope.oTask.sleep();	
			
			// trigger Highlighting Manager again...
    		if (scope.citydbKmlLayerInstance.isHighlightingActivated) {
    			scope.citydbKmlLayerInstance.citydbKmlHighlightingManager.triggerWorker();
    		} 
    		
    		// if terrain data is used, tiling manger keeps running to look up possible data tiles to be loaded event when Cesium idle...
    		setTimeout(function(){
    			if (!(cesiumViewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)) {
    				scope.triggerWorker();
    			}			
			}, 1000)     
		});	
		
		//-------------------------------------------------------------------------------------------------//
		
	    // event Listeners are so far, we start the Networklink Manager worker...
		scope.oTask.triggerEvent('initWorker', scope.createFrameBbox(), scope.citydbKmlLayerInstance.maxCountOfVisibleTiles);  			
	
		this.runMonitoring();
    },
    
    CitydbKmlTilingManager.prototype.isDataStreaming = function() {
    	if (this.oTask == null)
    		return false;
    	return this.oTask.isSleep()? false: true;   	 
    },
    
    CitydbKmlTilingManager.prototype.clearCaching = function() {
    	if (this.oTask == null)
    		return false;
    	this.oTask.oListeners["cleanCaching"].call(this, 0); 	 
    },
    
    /**
     * 
	 * create and add bounding box geometry in Cesium
	 * 
	 */
    CitydbKmlTilingManager.prototype.createBboxGeometry = function(bbox) {
    	var rectangle = Cesium.Rectangle.fromDegrees(bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax);
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
    	this.boundingboxEntity = {
        	id: Cesium.createGuid(),
            rectangle : {
                coordinates : rectangle,
                fill : false,
                outline : true,
                outlineWidth : 20,
                outlineColor : Cesium.Color.BLUE
            }
        }
        cesiumViewer.entities.add(this.boundingboxEntity);
    },
    
    /**
     * 
	 * create bounding box in monitor coordinate system
	 * 
	 */
    CitydbKmlTilingManager.prototype.createFrameBbox = function() {
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
    	var cesiumWidget = cesiumViewer.cesiumWidget; 
    	var scene = cesiumWidget.scene;
    	var camera = scene.camera;
    	var canvas = scene.canvas;
    	var globe = scene.globe;

    	var frameWidth = canvas.clientWidth;
    	var frameHeight = canvas.clientHeight;

    	var factor = 0;
    	var originHeight = 0;
    	
    	var cartesian3Indicator = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0 , 0)), scene);
    	
    	while (!Cesium.defined(cartesian3Indicator)) {
    		factor++
    		if (factor > 10)
    			break;
    		originHeight = originHeight + frameHeight*factor*0.1;   	
    		cartesian3Indicator = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0 , originHeight)), scene);
    	}

    	var cartesian3OfFrameCorner1;
    	var cartesian3OfFrameCorner2;
    	var cartesian3OfFrameCorner3;
    	var cartesian3OfFrameCorner4;
    	
    	if (cesiumViewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
    		cartesian3OfFrameCorner1 = camera.pickEllipsoid(new Cesium.Cartesian2(frameWidth , frameHeight));
    		cartesian3OfFrameCorner2 = camera.pickEllipsoid(new Cesium.Cartesian2(0, originHeight));
    		cartesian3OfFrameCorner3 = camera.pickEllipsoid(new Cesium.Cartesian2(0, frameHeight));
    		cartesian3OfFrameCorner4 = camera.pickEllipsoid(new Cesium.Cartesian2(frameWidth, originHeight)); 
    	}
    	else {
    		cartesian3OfFrameCorner1 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(frameWidth , frameHeight)), scene);
        	cartesian3OfFrameCorner2 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0 , originHeight)), scene);
        	cartesian3OfFrameCorner3 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0 , frameHeight)), scene);
        	cartesian3OfFrameCorner4 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(frameWidth , originHeight)), scene);
    	}
    	
    	if (Cesium.defined(cartesian3OfFrameCorner1) && Cesium.defined(cartesian3OfFrameCorner2) && Cesium.defined(cartesian3OfFrameCorner3) && Cesium.defined(cartesian3OfFrameCorner4)) {
    		var wgs84OfFrameCorner1  = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner1);			
    		var wgs84OfFrameCorner2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner2);			
    		var wgs84OfFrameCorner3 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner3);			
    		var wgs84OfFrameCorner4 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner4);

    		var frameMinX = Math.min(wgs84OfFrameCorner1.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.longitude*180 / Cesium.Math.PI);
    		var frameMaxX = Math.max(wgs84OfFrameCorner1.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.longitude*180 / Cesium.Math.PI);
    		var frameMinY = Math.min(wgs84OfFrameCorner1.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.latitude*180 / Cesium.Math.PI);
    		var frameMaxY = Math.max(wgs84OfFrameCorner1.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.latitude*180 / Cesium.Math.PI);

    		// buffer for caching, 300 meter
    		var offzet = 10;
    		var xOffzet = offzet / (111000 * Math.cos(Math.PI * (frameMinY + frameMaxY)/360));
    		var yOffzet = offzet / 111000;

        	return [frameMinX - xOffzet, frameMinY - yOffzet, frameMaxX + xOffzet, frameMaxY + yOffzet];
    	}
    	else {
    		// in the case when the camera are looking at air
    		return [0,0,0,0];
    	}		
    };

    /**
     * 
	 * check if the Tiling manager is started of not
	 * 
	 */
    CitydbKmlTilingManager.prototype.isStarted = function() {
    	if (this.oTask == null) {
    		return false;
    	}
    	else {
    		return true;
    	}
    };
    
    /**
     * 
	 * terminate the Tiling manager
	 * 
	 */
    CitydbKmlTilingManager.prototype.doTerminate = function() {
    	if (this.oTask != null) {       		
    		this.oTask.terminate();
    		this.oTask = null;
    		
    		var cesiumViewer = this.citydbKmlLayerInstance._cesiumViewer;
        	var dataSourceCollection = cesiumViewer._dataSourceCollection;
        	        	
    		for (var tileUrl in this.dataPoolKml){
            	var networklinkItem = this.dataPoolKml[tileUrl];			                	
        		var kmlDatasource = networklinkItem.kmlDatasource;
        		dataSourceCollection.remove(kmlDatasource);
            }
    		this.dataPoolKml = {};
    		this.networklinkCache = {};
    		
    		if (this.boundingboxEntity != null) {
    			cesiumViewer.entities.remove(this.boundingboxEntity);
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
    	return this.oTask;
    },
    
    /**
     * 
	 * public function to trigger Networklnk Manager
	 * 
	 */          
    CitydbKmlTilingManager.prototype.triggerWorker = function() {
    	var scope = this;
    	if (scope.oTask != null) {       		
    		if (scope.oTask.isSleep()) {
         		scope.oTask.wake();	
         		console.log("trigger starting...");
 				scope.oTask.triggerEvent('notifyWake');  
 			}
    		else {
    			scope.oTask.triggerEvent('abortAndnotifyWake');  
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
    		if (cesiumViewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
				scope.triggerWorker();
			}
		});
    };
		
	window.CitydbKmlTilingManager = CitydbKmlTilingManager;
})()