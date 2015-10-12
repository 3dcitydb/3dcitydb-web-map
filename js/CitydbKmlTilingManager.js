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
		this.oTask = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlTilingManager") + "Webworkers/CitydbKmlTilingManagerWebworker.js");    	 	
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
			scope.oTask.triggerEvent('createMatrix', bbox, rowDelta, colDelta, rownum, colnum);	
			// create the master bounding box 
			scope.createBboxGeometry(bbox);    			
    	}
    	else {
    		// creating R Tree as Data pool		
			var networkLinkItems = this.citydbKmlLayerInstance._citydbKmlDataSource._entityCollection._entities._array; 			
			scope.oTask.triggerEvent('createRTree', networkLinkItems.length - 1);
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
	        		scope.oTask.triggerEvent('addItemToRTree', item);
          		}
          	}
    	}

		//------------------------------below are the relevant listeners call from the worker--------------------------------//

		/**
		 * 
		 * remove the layers which are not in the vincity
		 * 
		 */
		this.oTask.addListener("removeDatasources", function () {					
			for (var objUrl in dataPoolKml){
            	var networklinkItem = dataPoolKml[objUrl];			                	
        		var kmlDatasource = networklinkItem.kmlDatasource;
        		var v1Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerRightCorner);
        		var v2Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperRightCorner);
        		var v3Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperLeftCorner);
        		var v4Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerLeftCorner);
        		if (typeof v1Pos != 'undefined' && typeof v2Pos != 'undefined' && typeof v3Pos != 'undefined'&& typeof v4Pos != 'undefined') {
        			var clientWidth = canvas.clientWidth;
            		var clientHeight = canvas.clientHeight;					        							        		
            		var tilePolygon = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
    	        	var framePolygon = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
    	        	var pixelCoveringSize = calculatePixels(tilePolygon, framePolygon);   	        	
    	        	if (pixelCoveringSize < minLodPixels || pixelCoveringSize > maxLodPixels) {
    	        		dataSourceCollection.remove(kmlDatasource);
    	        		delete dataPoolKml[objUrl];
    	        		scope.oTask.triggerEvent('updateDataPoolRecord');
    	        	} 
        		}
            }

			if (masterUrl.indexOf(".json") >= 0) {
				scope.oTask.triggerEvent('checkDataPool', scope.createFrameBbox(), 'matrix');   			
        	}
			else {
				scope.oTask.triggerEvent('checkDataPool', scope.createFrameBbox(), 'rtree');
			}
			
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
    		
    		var objUrl = null;        		
    		if (masterUrl.indexOf(".json") >= 0) {
    			var colIndex = matrixItem[4].col;
        		var rowIndex = matrixItem[4].row;
        		objUrl = hostAndPath + layername + "_Tile_" + rowIndex + "_" + colIndex + "_" + displayForm + fileextension; 			
        	}
			else {
				objUrl = matrixItem[4].key;
			}
    		
    		var clientWidth = canvas.clientWidth;
    		var clientHeight = canvas.clientHeight;	
    		
    		var terrainHeight = Cesium.Ellipsoid.WGS84.cartesianToCartographic(globe.pick(camera.getPickRay(new Cesium.Cartesian2(clientWidth/2 , clientHeight/2)), scene)).height;	

			var lowerRightCorner = Cesium.Cartesian3.fromDegrees(maxX, minY, terrainHeight);
			var upperRightCorner = Cesium.Cartesian3.fromDegrees(maxX, maxY, terrainHeight);
			var upperLeftCorner = Cesium.Cartesian3.fromDegrees(minX, maxY, terrainHeight);
			var lowerLeftCorner = Cesium.Cartesian3.fromDegrees(minX, minY, terrainHeight);	
			var v1Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, lowerRightCorner);
    		var v2Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, upperRightCorner);
    		var v3Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, upperLeftCorner);
    		var v4Pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, lowerLeftCorner);

    		if (typeof v1Pos != 'undefined' && typeof v2Pos != 'undefined' && typeof v3Pos != 'undefined'&& typeof v4Pos != 'undefined') {
    							        							        		
        		var tilePolygon = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
	        	var framePolygon = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
	        	var pixelCoveringSize = calculatePixels(tilePolygon, framePolygon);	        	
	        	
	        	if (scope.citydbKmlLayerInstance.cacheTiles) { // with cache
	        		if (networklinkCache.hasOwnProperty(objUrl)) {
		        		if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) { 
		        			if (!dataPoolKml.hasOwnProperty(objUrl)) {		        				
		        				var networklinkItem = networklinkCache[objUrl].networklinkItem;
	    	        			var kmlDatasource = networklinkItem.kmlDatasource;
	    	        			dataPoolKml[objUrl] = networklinkItem;    
    	        				dataSourceCollection.add(kmlDatasource).then(function() { 	        					
    	        					scope.oTask.triggerEvent('updateTaskStack');
	    		        			console.log("loading layer...");	
		    	        			// status was changed...
				        			scope.oTask.triggerEvent('updateDataPoolRecord');		    	        			    										        							        			
		        				}).otherwise(function(error) {
		        					console.log(error);
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
	    					url: objUrl,
	    					kmlDatasource: newKmlDatasource,
	    					lowerRightCorner: lowerRightCorner,
	    					upperRightCorner: upperRightCorner,
	    					upperLeftCorner: upperLeftCorner,
	    					lowerLeftCorner: lowerLeftCorner        					
	    				};
	    				networklinkCache[objUrl] = {networklinkItem: newNetworklinkItem, cacheStartTime: new Date().getTime()};	        				
	    				       				
	    				if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) {
    	        			console.log("loading layer...");	
    	        			// status was changed...
		        			scope.oTask.triggerEvent('updateDataPoolRecord');
	    					dataSourceCollection.add(newKmlDatasource);    						 
		        			dataPoolKml[objUrl] = newNetworklinkItem;
		        			newKmlDatasource.load(objUrl).then(function() { 
		        				scope.oTask.triggerEvent('updateTaskStack');
	        				}).otherwise(function(error) {
	        					console.log(error);
	        					scope.oTask.triggerEvent('updateTaskStack');
	        				});
	    				}	
	    				else {	 	    					
	    					newKmlDatasource.load(objUrl).then(function() {	
	    						scope.oTask.triggerEvent('updateTaskStack');
	        					console.log("cache loaded...");	        							        					        										        							        			
	        				}).otherwise(function(error) {
	        					console.log(error);
	        					scope.oTask.triggerEvent('updateTaskStack');
	        				});
	    				}       				
	    			}
	        	}
	        	else { // no cache
	        		if (!dataPoolKml.hasOwnProperty(objUrl)) {
		        		var newKmlDatasource = new CitydbKmlDataSource(scope.citydbKmlLayerInstance.id);
						var newNetworklinkItem = {
							url: objUrl,
							kmlDatasource: newKmlDatasource,
							lowerRightCorner: lowerRightCorner,
							upperRightCorner: upperRightCorner,
							upperLeftCorner: upperLeftCorner,
							lowerLeftCorner: lowerLeftCorner        					
						};       				
						       				
						if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) {
    	        			console.log("loading layer...");	
    	        			// status was changed...
		        			scope.oTask.triggerEvent('updateDataPoolRecord');	
		        			
		        			dataPoolKml[objUrl] = newNetworklinkItem;	        			
		        			dataSourceCollection.add(newKmlDatasource).then(function() { 								
							});  
		        			newKmlDatasource.load(objUrl).then(function() {		        					
			    				scope.oTask.triggerEvent('updateTaskStack');	        										        							        			
		        			}).otherwise(function(error) {
	        					console.log(error);
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
    		}
    		else {        					        						        					
				scope.oTask.triggerEvent('updateTaskStack');	        										        							        				        										        							        			               	
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
		});	
		
		//-------------------------------------------------------------------------------------------------//
		
	    // event Listeners are so far, we start the Networklink Manager worker...

		if (masterUrl.indexOf(".json") >= 0) {
			scope.oTask.triggerEvent('initWorker', scope.createFrameBbox(), scope.citydbKmlLayerInstance.maxCountOfVisibleTiles, 'matrix');  			
    	}
		else {
			scope.oTask.triggerEvent('initWorker', scope.createFrameBbox(), scope.citydbKmlLayerInstance.maxCountOfVisibleTiles, 'rtree');
		}
				
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
    	var cartesian3Indicator = camera.pickEllipsoid(new Cesium.Cartesian2(0, 0));
    	
    	while (!Cesium.defined(cartesian3Indicator)) {
    		factor++
    		if (factor > 10)
    			break;
    		originHeight = originHeight + frameHeight*factor*0.1;
    		cartesian3Indicator = camera.pickEllipsoid(new Cesium.Cartesian2(0, originHeight));    		
    	}

    	var cartesian3OfFrameCorner1 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(frameWidth , frameHeight)), scene);
    	var cartesian3OfFrameCorner2 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0 , originHeight)), scene);
    	var cartesian3OfFrameCorner3 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0 , frameHeight)), scene);
    	var cartesian3OfFrameCorner4 = globe.pick(camera.getPickRay(new Cesium.Cartesian2(frameWidth , originHeight)), scene);
    	
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
/*    		this.createBboxGeometry({
    			xmin: frameMinX - xOffzet,
    			ymin: frameMinY - yOffzet, 
    			xmax: frameMaxX + xOffzet, 
    			ymax: frameMaxY + yOffzet
    		}); */
        	return [frameMinX - xOffzet, frameMinY - yOffzet, frameMaxX + xOffzet, frameMaxY + yOffzet];
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
    	if (this.oTask == null) {
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
    	if (this.oTask != null) {       		
    		this.oTask.terminate();
    		this.oTask = null;
    		
    		var cesiumViewer = this.citydbKmlLayerInstance._cesiumViewer;
        	var dataSourceCollection = cesiumViewer._dataSourceCollection;
        	        	
    		for (var objUrl in this.dataPoolKml){
            	var networklinkItem = this.dataPoolKml[objUrl];			                	
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
    		scope.triggerWorker();
		});
    };
		
	window.CitydbKmlTilingManager = CitydbKmlTilingManager;
})()