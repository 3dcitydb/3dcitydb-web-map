/**
 * test
 * **/
(function() {
	function CitydbKmlTilingManager(citydbKmlLayerInstance){	
		scope = this;
		console.log(CitydbUtil.retrieveURL("CitydbKmlTilingManager"))
		this.oTask = new CitydbWebworker(CitydbUtil.retrieveURL("CitydbKmlTilingManager") + "Webworkers/CitydbKmlTilingManagerWebworker.js");
		this.citydbKmlLayerInstance = citydbKmlLayerInstance;
		this.handler = null;
	}
	
	CitydbKmlTilingManager.prototype.doStart = function() {
		var scope = this;
		var cesiumViewer = this.citydbKmlLayerInstance._cesiumViewer;
    	var dataSourceCollection = cesiumViewer._dataSourceCollection;
    	var scene = cesiumViewer.scene;
    	var canvas = scene.canvas; 
    	
    	// displayed layers
    	var dataPoolKml = new Object();
    	
    	// Caching
    	var networklinkCache = new Object();
    	
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
            		var polygon1 = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
    	        	var polygon2 = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
    	        	var intersectPolygon = intersectionPolygons(polygon1, polygon2);
    	        	var pixelCoveringSize = Math.sqrt(CitydbUtil.polygonArea(intersectPolygon));
    	        	if (pixelCoveringSize < 140) {
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
	        	var intersectPolygon = intersectionPolygons(polygon1, polygon2);
	        	var pixelCoveringSize = Math.sqrt(CitydbUtil.polygonArea(intersectPolygon));
	        	
	        	if (networklinkCache.hasOwnProperty(objUrl)) {
	        		if (pixelCoveringSize >= 140) { 
	        			if (!dataPoolKml.hasOwnProperty(objUrl)) {
	        				var networklinkItem = networklinkCache[objUrl].networklinkItem;
    	        			var kmlDatasource = networklinkItem.kmlDatasource;
    	        			dataSourceCollection.add(kmlDatasource);
    	        			console.log("loading layer...");	
    	        			dataPoolKml[objUrl] = networklinkItem;
    	        			// status was changed...
		        			scope.oTask.triggerEvent('updateDataPoolRecord');
	        			}   	        			
	        		}
	        		setTimeout(function(){		        					
    					scope.oTask.triggerEvent('updateTaskStack');	        										        							        			
                	}, 5);
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
    				       				
    				if (pixelCoveringSize >= 140) {
    					console.log("loading layer...");
    					dataSourceCollection.add(newKmlDatasource);       						 
	        			dataPoolKml[objUrl] = newNetworklinkItem;
	        			newKmlDatasource.load(objUrl).then(function() {    					
	        				scope.oTask.triggerEvent('updateTaskStack');	        										        							        			
        				});
    				}	
    				else {
    					newKmlDatasource.load(objUrl).then(function() {
        					console.log("cache loaded...");	        					
	        				scope.oTask.triggerEvent('updateTaskStack');	        										        							        			
        				});
    				}       				
    			}	        	
    		}
    		else {        					        					
    			setTimeout(function(){		        					
					scope.oTask.triggerEvent('updateTaskStack');	        										        							        			
            	}, 5);  	        										        							        			               	
    		}  				
		});

		/**
		 * 
		 * Cachingsize = [number of displayed layers] + [cached layers]
		 * [cached layers] should not be bigger than a threshold value...
		 * 
		 */
		scope.oTask.addListener("cleanCaching", function () {
			var cacheSize = 0;
			var tempCache = new Object();
			for (var cacheID in networklinkCache){	
				if (!dataPoolKml.hasOwnProperty(cacheID)) {
					tempCache[cacheID] = networklinkCache[cacheID].cacheStartTime;  	
        			cacheSize++;
    			} 
            }

			var maxCacheSize = 50;

			while (cacheSize > maxCacheSize) {
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
			
			console.log("Current Cache size is: " + Object.keys(networklinkCache).length);		        										        							        			           
		});
		
		
		/**
		 * 
		 * update the statusbar and Highlighting status of the KML objects		
		 *  
		 */
		scope.oTask.addListener("refreshView", function () {			
			scope.oTask.sleep();				
		});	
		
		//-------------------------------------------------------------------------------------------------//
		
	    // event Listeners are so far, we start the Networklink Manager worker...

		if (masterUrl.indexOf(".json") >= 0) {
			scope.oTask.triggerEvent('initWorker', scope.createFrameBbox(), 'matrix');  			
    	}
		else {
			scope.oTask.triggerEvent('initWorker', scope.createFrameBbox(), 'rtree');
		}
				
		this.runMonitoring();
    },
    
    CitydbKmlTilingManager.prototype.isDataStreaming = function() {
    	return !this.oTask.isSleep();   	 
    },
    
    /**
     * 
	 * create and add bounding box geometry in Cesium
	 * 
	 */
    CitydbKmlTilingManager.prototype.createBboxGeometry = function(bbox) {
    	var rectangle = Cesium.Rectangle.fromDegrees(bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax);
    	var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
        cesiumViewer.entities.add({
            rectangle : {
                coordinates : rectangle,
                fill : false,
                outline : true,
                outlineWidth : 20,
                outlineColor : Cesium.Color.BLUE
            }
        });
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
    		originHeight = originHeight + frameHeight*factor*0.1;
    		cartesian3Indicator = camera.pickEllipsoid(new Cesium.Cartesian2(0, originHeight));    		
    	}
    	originHeight = originHeight + (frameHeight - originHeight) / 2;
    	    	
		var cartesian3OfFrameCorner1 = camera.pickEllipsoid(new Cesium.Cartesian2(frameWidth , frameHeight));
    	var cartesian3OfFrameCorner2 = camera.pickEllipsoid(new Cesium.Cartesian2(0, originHeight));
    	var cartesian3OfFrameCorner3 = camera.pickEllipsoid(new Cesium.Cartesian2(0, frameHeight));
    	var cartesian3OfFrameCorner4 = camera.pickEllipsoid(new Cesium.Cartesian2(frameWidth, originHeight));    	    	

		var wgs84OfFrameCorner1  = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner1);			
		var wgs84OfFrameCorner2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner2);			
		var wgs84OfFrameCorner3 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner3);			
		var wgs84OfFrameCorner4 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner4);
		
		var frameMinX = Math.min(wgs84OfFrameCorner1.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.longitude*180 / Cesium.Math.PI);
		var frameMaxX = Math.max(wgs84OfFrameCorner1.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.longitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.longitude*180 / Cesium.Math.PI);
		var frameMinY = Math.min(wgs84OfFrameCorner1.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.latitude*180 / Cesium.Math.PI);
		var frameMaxY = Math.max(wgs84OfFrameCorner1.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner2.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner3.latitude*180 / Cesium.Math.PI, wgs84OfFrameCorner4.latitude*180 / Cesium.Math.PI);

		// buffer for caching, 300 meter
		var offzet = 300;
		var xOffzet = offzet / (111000 * Math.cos(Math.PI * (frameMinY + frameMaxY)/360));
		var yOffzet = offzet / 111000;
		
		console.log(frameMinX - xOffzet + "; " + frameMaxY + yOffzet);
		
    	return [frameMinX - xOffzet, frameMinY - yOffzet, frameMaxX + xOffzet, frameMaxY + yOffzet];			
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

    		this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
    		this.handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL);
    		this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_UP);
    		this.handler = null;
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
         		console.log("triger starting...");
 				scope.oTask.triggerEvent('notifyWake');  
 			}
    		else {
    			scope.oTask.triggerEvent('abortAndnotifyWake');  
    		}
    		// trigger Highlighting Manager...
    		if (scope.citydbKmlLayerInstance.isHighlightingActivated) {
    			scope.citydbKmlLayerInstance.citydbKmlHighlightingManager.triggerWorker();
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

        if (this.handler == null) {
        	this.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        	var isMouseDown = false;
        	
        	this.handler.setInputAction(function(position) {
        		isMouseDown = true;
        	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        	
        	this.handler.setInputAction(function(position) {
        		isMouseDown = false;
        		scope.triggerWorker();
        	}, Cesium.ScreenSpaceEventType.LEFT_UP);
        	
        	this.handler.setInputAction(function(position) {
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        	
        	this.handler.setInputAction(function(position) {
        		if(typeof timer != 'undefined'){
        		    clearTimeout(timer);
        		}
    		    timer = setTimeout(function(){
    		    	scope.triggerWorker();
    		    }, 500);      		        		
        	}, Cesium.ScreenSpaceEventType.WHEEL);
        	
        	this.handler.setInputAction(function(position) {
        		scope.triggerWorker();
        	}, Cesium.ScreenSpaceEventType.MIDDLE_UP);
        }
    };
		
	window.CitydbKmlTilingManager = CitydbKmlTilingManager;
})()