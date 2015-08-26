    
	document.getElementById('loadingIndicator').style.display = 'none';
	
	// initiate 3Dcitydb-web-map instance
	var cesiumViewer = new Cesium.Viewer('cesiumContainer', {
		selectedImageryProviderViewModel  : Cesium.createDefaultImageryProviderViewModels()[1]
	});
	
//	cesiumViewer.extend(Cesium.viewerCesiumInspectorMixin);
	
	var cesiumCamera = cesiumViewer.scene.camera;
	var webMap = new WebMap3DCityDB(cesiumViewer);	
	
	// active mouseClick Event		
	webMap.activateMouseClickEvents(true);
	webMap.activateMouseMoveEvents(true);
	webMap.activateViewChangedEvent(true);

	layers = getLayersFromUrl();

  	var addLayerViewModel = {
		url : "http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/Berlin_Center_LoDs/Berlin_Center_Footprint/Berlin_Center_Footprint_MasterJSON.json",
		name : "Berlin_Center_Footprint",
		pickSurface: Cesium.knockout.observableArray([false]),
		maxSizeOfCachedTiles : 50,
		maxCountOfVisibleTiles : 200
	};  	
  	Cesium.knockout.track(addLayerViewModel);
	Cesium.knockout.applyBindings(addLayerViewModel, document.getElementById('citydb_addlayerpanel'));
	
  	var addWmsViewModel = {
        name : 'Vorarlberg WMS Service',
        iconUrl : 'http://cdn.flaggenplatz.de/media/catalog/product/all/4489b.gif',
        tooltip : 'Voralberg Luftbild',
		url: 'http://vogis.cnv.at/mapserver/mapserv',
		layers : 'ef2012_12cm',
		map: 'i_luftbilder_r_wms.map'
	};  	
  	Cesium.knockout.track(addWmsViewModel);
	Cesium.knockout.applyBindings(addWmsViewModel, document.getElementById('citydb_addwmspanel'));	
	
  	var addTerrainViewModel = {
        name : 'Vorarlberg DEM',
        iconUrl : 'http://cdn.flaggenplatz.de/media/catalog/product/all/4489b.gif',
        tooltip : 'Vorarlberg Digitales Geländemodell',
    	url : 'http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/terrain/vorarlberg_DGM'
	};
  	
  	Cesium.knockout.track(addTerrainViewModel);
	Cesium.knockout.applyBindings(addTerrainViewModel, document.getElementById('citydb_addterrainpanel'));
	
	// sync object list...
	observeObjectList();
	
	// Zoom to desired camera position...	
	zoomToDefaultCameraPosition().then(function(info){
		console.log(info);
		loadLayerGroup(layers);
	})
	
	function getLayersFromUrl() {
		var index = 0;
		var nLayers = new Array();
		var layerConfigString = CitydbUtil.parse_query_string('layer_' + index, window.location.href);
		while (layerConfigString) {
			var layerConfig = Cesium.queryToObject(Object.keys(Cesium.queryToObject(layerConfigString))[0]);			
			nLayers.push(new CitydbKmlLayer({
				url : layerConfig.url,
				name : layerConfig.name,
				pickSurface: Boolean(layerConfig.pickSurface),
				maxSizeOfCachedTiles: layerConfig.maxSizeOfCachedTiles,
				maxCountOfVisibleTiles: layerConfig.maxCountOfVisibleTiles
			}));			
			index++;
			layerConfigString = CitydbUtil.parse_query_string('layer_' + index, window.location.href);
		}
		return nLayers;
	}
	
	function observeObjectList() {
		var observable = Cesium.knockout.getObservable(webMap, '_activeLayer');
		var highlightedObjectsSubscription = undefined;
		var hiddenObjectsSubscription = undefined;
		
		var highlightingListElement = document.getElementById("citydb_highlightinglist");
		highlightingListElement.onchange = function() {
            zoomToObject(this.value);
        };
        
		var hiddenListElement = document.getElementById("citydb_hiddenlist");
		hiddenListElement.onchange = function() {
            zoomToObject(this.value);
        };
		
		observable.subscribe(function(deSelectedLayer) {
			if (Cesium.defined(highlightedObjectsSubscription)) {
				highlightedObjectsSubscription.dispose();
			}	
			if (Cesium.defined(hiddenObjectsSubscription)) {
				hiddenObjectsSubscription.dispose();
			}	
		}, observable, "beforeChange");
		
		observable.subscribe(function(selectedLayer) {
	        if (Cesium.defined(selectedLayer)) {
	      		document.getElementById(selectedLayer.id).childNodes[0].checked = true;  
	      		
	      		highlightedObjectsSubscription = Cesium.knockout.getObservable(selectedLayer, '_highlightedObjects').subscribe(function(highlightedObjects) {					
			  		while (highlightingListElement.length > 1) {
			  			highlightingListElement.remove(1);
			  		}
			  		for (var id in highlightedObjects){
			  			var option = document.createElement("option");
				  		option.text = id;
				  		highlightingListElement.add(option);						
				  	}				  		
			    });	      		
	      		selectedLayer.highlightedObjects = selectedLayer.highlightedObjects;
	      		
	      		hiddenObjectsSubscription = Cesium.knockout.getObservable(selectedLayer, '_hiddenObjects').subscribe(function(hiddenObjects) {					
			  		while (hiddenListElement.length > 1) {
			  			hiddenListElement.remove(1);
			  		}			  					  		
			  		for (var k = 0; k < hiddenObjects.length; k++){	
						var id = hiddenObjects[k];			
						var option = document.createElement("option");
				  		option.text = id;
				  		hiddenListElement.add(option);	
					}				  		
			    });	      		
	      		selectedLayer.hiddenObjects = selectedLayer.hiddenObjects;      		
	        } 
	        else {
	        	while (highlightingListElement.length > 1) {
		  			highlightingListElement.remove(1);
		  		}
	        	while (hiddenListElement.length > 1) {
		  			hiddenListElement.remove(1);
		  		}
	        }
	    });
	}

	function loadLayerGroup(_layers) {
		var k = 0;		
		registerLayerEventHandler(_layers[k]);
		
		function registerLayerEventHandler(_layer) {
			var tempMenuOption;
			_layer.registerEventHandler("STARTLOADING", function(thisLayer) {
				document.getElementById('loadingIndicator').style.display = 'block';				
			});
			_layer.registerEventHandler("FINISHLOADING", function(thisLayer) {
				console.log(thisLayer);
				addEventListeners(thisLayer);			
				document.getElementById('loadingIndicator').style.display = 'none';
				addLayerToList(_layer);
				k++;
				if (k < _layers.length) {
					var currentLayer = _layers[k];
					registerLayerEventHandler(currentLayer);
					webMap.addLayer(currentLayer);
				}
				else {
					webMap.activeLayer = _layers[0];
				}
			});
		}
		
		// adding layer to Cesium Map          	          	
    	webMap.addLayer(_layers[0]); 
	}
	
  	function addLayerToList(layer) {
  		var radio = document.createElement('input');
  		radio.type = "radio";
  		radio.name = "dummyradio";
  		radio.onchange = function(event) {	    	
	        var targetRadio = event.target;
	        var layerId = targetRadio.parentNode.id;
	        webMap.activeLayer = webMap.getLayerbyId(layerId);
	        console.log(webMap.activeLayer);
	    };
  		
  		var checkbox = document.createElement('input');
	    checkbox.type = "checkbox";
	    checkbox.id = "id";
	    checkbox.checked = true;
	    checkbox.onchange = function(event) {	    	
	        var checkbox = event.target;
	        var layerId = checkbox.parentNode.id;
	        var citydbLayer = webMap.getLayerbyId(layerId);
	        if (checkbox.checked) {
	            console.log("Layer " + citydbLayer.name + " is visible now!");
	            citydbLayer.activate(true);
	        } else {
	        	console.log("Layer " + citydbLayer.name + " is not visible now!");
	        	citydbLayer.activate(false);
	        }
	    };
	    
	    var label = document.createElement('label')
	    label.appendChild(document.createTextNode(layer.name));
	    
	    var layerOption = document.createElement('div');
	    layerOption.id = layer.id;
	    layerOption.appendChild(radio);
	    layerOption.appendChild(checkbox);
	    layerOption.appendChild(label);
	    
	    label.ondblclick = function(event) {
	    	event.preventDefault();
	    	var layerId = event.target.parentNode.id;
	    	var citydbLayer = webMap.getLayerbyId(layerId);
	    	citydbLayer.zoomToLayer();
	    }

	    var layerlistpanel = document.getElementById("citydb_layerlistpanel")
	    layerlistpanel.appendChild(layerOption);
  	}
	
	function addEventListeners(citydbKmlLayer) {
		// clickEvent Handler for Highlighting...	
		var highlightColor = new Cesium.Color(0.4, 0.4, 0.0, 1.0);
		var mouseOverhighlightColor = new Cesium.Color(0.0, 0.3, 0.0, 1.0);
		var mainMouseOverhighlightColor = new Cesium.Color(0.0, 0.4, 0.0, 1.0);
		var subMouseOverhighlightColor = new Cesium.Color(0.0, 0.5, 0.0, 1.0);
		
		citydbKmlLayer.registerEventHandler("CLICK", function(object) {			
			var targetEntity = object.id;
			var primitive = object.primitive;
			console.log(citydbKmlLayer);
	 		console.log(primitive);
	 		createInfoTable(targetEntity);
	 		
	 		var globeId; 
	 		if (citydbKmlLayer.pickSurface != true) {
	 			globeId = targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
	 		}
	 		else {
	 			globeId = targetEntity.name;
	 		}
	 		
	 		if (citydbKmlLayer.isInHighlightedList(globeId))
				return; 
	 	    // clear all other Highlighting status and just highlight the clicked object...
			citydbKmlLayer.unHighlightAllObjects();  									
			var highlightThis = {};
			
			highlightThis[globeId] = highlightColor;
			citydbKmlLayer.highlight(highlightThis); 						
		});
		
		// CtrlclickEvent Handler for Multi-Selection and Highlighting...
		citydbKmlLayer.registerEventHandler("CTRLCLICK", function(object) {
			var targetEntity = object.id;
	 		var primitive = object.primitive;

	 		var globeId; 
	 		if (citydbKmlLayer.pickSurface != true) {
	 			globeId = targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
	 		}
	 		else {
	 			globeId = targetEntity.name;
	 		}
	 		
			if (citydbKmlLayer.isInHighlightedList(globeId)) {
				citydbKmlLayer.unHighlight([globeId]);
			}else {
				var highlightThis = {};				
				highlightThis[globeId] = highlightColor;
				citydbKmlLayer.highlight(highlightThis); 
			}								
		});
		
		// MouseIn- and MouseOut-Event Handler for MouseOver-Highlighting
		citydbKmlLayer.registerEventHandler("MOUSEIN", function(object) {
			var targetEntity = object.id;
	 		var primitive = object.primitive;
	 		
	 		if (citydbKmlLayer.isInHighlightedList(targetEntity.name))
				return;
	 		
			if (primitive instanceof Cesium.Model) {				
				var materials = object.mesh._materials;
				for (var i = 0; i < materials.length; i++) {
					// do mouseOver highlighting
					materials[i].setValue('emission', Cesium.Cartesian4.fromColor(mouseOverhighlightColor));
				} 
			}
			else if (primitive instanceof Cesium.Primitive) {	
				if ((targetEntity.name.indexOf('_RoofSurface') > -1 || targetEntity.name.indexOf('_WallSurface') > -1) && citydbKmlLayer.pickSurface != true) {
					var globeId = targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
					var roofEntities = citydbKmlLayer.getEntitiesById(globeId + '_RoofSurface');
					var wallEntities = citydbKmlLayer.getEntitiesById(globeId + '_WallSurface');
					
					if (roofEntities != null && wallEntities != null) {
						if (targetEntity.name.indexOf('_RoofSurface') > -1) {
							_doMouseoverHighlighting(roofEntities, primitive, mainMouseOverhighlightColor);
							_doMouseoverHighlighting(wallEntities, primitive, subMouseOverhighlightColor);
						}
						else {
							_doMouseoverHighlighting(roofEntities, primitive, subMouseOverhighlightColor);
							_doMouseoverHighlighting(wallEntities, primitive, mainMouseOverhighlightColor);
						}
					}
				}
				else {
					try{
						var parentEntity = targetEntity._parent;	
						var childrenEntities = parentEntity._children;						
					}
					catch(e){return;} // not valid entities
					_doMouseoverHighlighting(childrenEntities, primitive, mouseOverhighlightColor);
				}	
			}
		});
		
	 	citydbKmlLayer.registerEventHandler("MOUSEOUT", function(object) {
	 		var primitive = object.primitive;
	 		var targetEntity = object.id;
	 		if (citydbKmlLayer.isInHighlightedList(targetEntity.name))
				return; 
			if (primitive instanceof Cesium.Model) {				
				var materials = object.mesh._materials;
				for (var i = 0; i < materials.length; i++) {
					// dismiss highlighting
					materials[i].setValue('emission', new Cesium.Cartesian4(0.0, 0.0, 0.0, 1));
				} 
			}
			else if (primitive instanceof Cesium.Primitive) {				
				if ((targetEntity.name.indexOf('_RoofSurface') > -1 || targetEntity.name.indexOf('_WallSurface') > -1)  && citydbKmlLayer.pickSurface != true) {
					var globeId = targetEntity.name.replace('_RoofSurface', '').replace('_WallSurface', '');
					var roofEntities = citydbKmlLayer.getEntitiesById(globeId + '_RoofSurface');
					var wallEntities = citydbKmlLayer.getEntitiesById(globeId + '_WallSurface');
					
					if (roofEntities != null && wallEntities != null) {
						_dismissMouseoverHighlighting(roofEntities, primitive);
						_dismissMouseoverHighlighting(wallEntities, primitive);
					}
				}
				else {
					try{
						var parentEntity = targetEntity._parent;	
						var childrenEntities = parentEntity._children;		
						
					}
					catch(e){return;} // not valid entities
					_dismissMouseoverHighlighting(childrenEntities, primitive);	
				}
			}
		});	 
	 	
		function _doMouseoverHighlighting(_childrenEntities, _primitive, _mouseOverhighlightColor) {
			for (var i = 0; i < _childrenEntities.length; i++){	
				var childEntity = _childrenEntities[i];							
				var attributes = _primitive.getGeometryInstanceAttributes(childEntity);
				if (!Cesium.defined(childEntity.originalSurfaceColor)) {
					childEntity.addProperty("originalSurfaceColor");
				}						
				childEntity.originalSurfaceColor = attributes.color;
				attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(_mouseOverhighlightColor); 
			}
		}
		
		function _dismissMouseoverHighlighting(_childrenEntities, _primitive) {
			for (var i = 0; i < _childrenEntities.length; i++){	
				var childEntity = _childrenEntities[i];	
				var originalSurfaceColor = childEntity.originalSurfaceColor;
				try{
					var attributes = _primitive.getGeometryInstanceAttributes(childEntity);
					attributes.color = originalSurfaceColor; 
				}
				catch(e){
					console.log(e);
					/* escape the DeveloperError exception: "This object was destroyed..." */
				}
			}
		}
	}
 	
	function zoomToDefaultCameraPosition() {	
		var deferred = Cesium.when.defer();
		var latstr = CitydbUtil.parse_query_string('lat', window.location.href);
	    var lonstr = CitydbUtil.parse_query_string('lon', window.location.href);
	    
	    if (latstr && lonstr) {	    	
	        var lat = parseFloat(latstr);
	        var lon = parseFloat(lonstr);
	        var range = 800;
	        var heading = 6;
	        var tilt = 49;
	        var altitude = 40;

	        var rangestr = CitydbUtil.parse_query_string('range', window.location.href);
	        if (rangestr) 
	        	range = parseFloat(rangestr);

	        var headingstr = CitydbUtil.parse_query_string('heading', window.location.href);
	        if (headingstr) 
	        	heading = parseFloat(headingstr);

	        var tiltstr = CitydbUtil.parse_query_string('tilt', window.location.href);
	        if (tiltstr) 
	        	tilt = parseFloat(tiltstr);

	        var altitudestr = CitydbUtil.parse_query_string('altitude', window.location.href);
	        if (altitudestr) 
	        	altitude = parseFloat(altitudestr);

	        var _center = Cesium.Cartesian3.fromDegrees(lon, lat);
	        var _heading = Cesium.Math.toRadians(heading);
	        var _pitch = Cesium.Math.toRadians(tilt - 90);
	        var _range = range;
	        cesiumCamera.flyTo({
	            destination : Cesium.Cartesian3.fromDegrees(lon, lat, _range),
	            complete: function() {
	            	cesiumCamera.lookAt(_center, new Cesium.HeadingPitchRange(_heading, _pitch, _range));
	            	cesiumCamera.lookAtTransform(Cesium.Matrix4.IDENTITY);	            		    	    	
	    	    	deferred.resolve("fly to the desired camera position");
	            }
	        })
	    } 
	    else {
	    	// default camera postion
	    	var extent = new Cesium.Rectangle.fromDegrees(13.34572857, 52.5045771, 13.427975, 52.658449);
	    	cesiumCamera.viewRectangle(extent);
	    	deferred.resolve("fly to the default camera position");;
	    }
	    return deferred.promise;
	}

    
    /**---------------------------------  Button ClickEvent Handler  ----------------------------------------**/ 
    
    // Creation of a weblink for sharing with other people..
 	function generateLink(){
  		var cameraPostion = null;	    		    	   	
    	var ray = cesiumCamera.getPickRay(new Cesium.Cartesian2(
            Math.round(cesiumViewer.scene.canvas.clientWidth / 2),
            Math.round(cesiumViewer.scene.canvas.clientHeight / 2)
        ));
        var position = cesiumViewer.scene.globe.pick(ray, cesiumViewer.scene);
        if (Cesium.defined(position)) {
            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            var range = Cesium.Cartesian3.distance(position, cesiumCamera.position);
            cameraPostion = {
	    		lat: Cesium.Math.toDegrees(cartographic.latitude),	
	    		lon: Cesium.Math.toDegrees(cartographic.longitude),
				range: range,
				tilt: Cesium.Math.toDegrees(cesiumCamera.pitch)+ 90,
				heading:  Cesium.Math.toDegrees(cesiumCamera.heading),
				altitude: 0
	    	};  
			var	projectLink = location.protocol + '//' + location.host + location.pathname + '?' +
			'lat=' + cameraPostion.lat +
			'&lon=' + cameraPostion.lon +
			'&range=' + cameraPostion.range +
			'&tilt=' + cameraPostion.tilt +
			'&heading=' + cameraPostion.heading +
			'&altitude=' + cameraPostion.altitude + 
			'&' + layersToQuery();
			window.history.pushState("string", "Title", projectLink);
        }
  	};
  	
  	function layersToQuery() {
  		var layerGroupObject = new Object();
  		var layers = webMap._layers;
  		for (var i = 0; i < layers.length; i++) {
  			var layer = layers[i];
  			var layerConfig = {
				url : layer.url,
				name : layer.name,
				pickSurface: layer.pickSurface,
				maxSizeOfCachedTiles: layer.maxSizeOfCachedTiles,
				maxCountOfVisibleTiles: layer.maxCountOfVisibleTiles,
  			}
  			layerGroupObject["layer_" + i] = Cesium.objectToQuery(layerConfig); 			
  		} 
  		
  		return Cesium.objectToQuery(layerGroupObject)
  	}
  	
  	// Clear Highlighting effect of all highlighted objects
  	function clearhighlight(){
  		var layers = webMap._layers;
  		for (var i = 0; i < layers.length; i++) {
  			if (layers[i].active) {
  				layers[i].unHighlightAllObjects();
  			} 			
  		} 
  		cesiumViewer.selectedEntity = undefined;
  	};
  	
    // hide the selected objects
  	function hideSelectedObjects(){ 	 		
  		var layers = webMap._layers;
  		var objectIds;
  		for (var i = 0; i < layers.length; i++) {
  			if (layers[i].active) {
  	  			objectIds = Object.keys(layers[i].highlightedObjects);
  	  			layers[i].hideObjects(objectIds); 
  			} 	
  		}
  	};
  	
    // show the hidden objects
  	function showHiddenObjects(){
  		var layers = webMap._layers;
  		for (var i = 0; i < layers.length; i++) {
  			if (layers[i].active) {
  				layers[i].showAllObjects();
  			} 	  			
  		}
  	};
  	
  	function zoomToObject(gmlId) {
  		var jsonpUrl = CitydbUtil.get_host_and_file_wo_suffix_from_URL(webMap.activeLayer.url).replace('_MasterJSON', '') + 'json';  
		var promise = jsonp(jsonpUrl);
		var _deferred = Cesium.when.defer();
		Cesium.when(promise, function(result) {
			var obj = result[gmlId];
	        if (obj) {	        	
	            // the entered string is a known GMLID; let's fly
	            // to the center point of the corresponding feature
	            var lon = (obj.envelope[0] + obj.envelope[2]) / 2.0;
	            var lat = (obj.envelope[1] + obj.envelope[3]) / 2.0;
	    		var center = Cesium.Cartesian3.fromDegrees(lon, lat);
    	        var heading = Cesium.Math.toRadians(0);
    	        var pitch = Cesium.Math.toRadians(-50);
    	        var range = 150;

	            cesiumCamera.flyTo({
	                destination : Cesium.Cartesian3.fromDegrees(lon, lat, range),
	                complete: function() {
	                	cesiumCamera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
	                	cesiumCamera.lookAtTransform(Cesium.Matrix4.IDENTITY); 
	                	_deferred.resolve(gmlId);
	                }
	            })
	        }
	        else {
	        	_deferred.reject(gmlId);
	        }
		}, function() {
			throw new Cesium.DeveloperError(arguments);
		});		        
  		
  		function jsonp(jsonpUrl) {
  			var deferred = Cesium.when.defer();
  			jQuery.noConflict().ajax({		    	
		        url: jsonpUrl + '?jsoncallback=?',   
		        dataType: "jsonp",
		        jsonpCallback: "handle_3DCityDB_data", 
		        timeout: 30000, 
		        success: function(json){		        	
		        	 deferred.resolve(json);
		        },
		        error: function(){
		        	deferred.reject(arguments);
		        }
		    }); 
  			return deferred.promise;
  		}
  		
  		return _deferred;
  	}
  	
  	function addNewLayer() {
  		var _layers = new Array();
  		
		_layers.push(new CitydbKmlLayer({
			url : addLayerViewModel.url,
			name : addLayerViewModel.name,
			pickSurface: addLayerViewModel.pickSurface[0],
			maxSizeOfCachedTiles: addLayerViewModel.maxSizeOfCachedTiles,
			maxCountOfVisibleTiles : addLayerViewModel.maxCountOfVisibleTiles
		}));
		
		loadLayerGroup(_layers);	
  	}  
  	
  	function removeSelectedLayer() {
  		var layer = webMap.activeLayer;
  		if (Cesium.defined(layer)) {
  			var layerId = layer.id;
  	  		document.getElementById(layerId).remove();
  	  		webMap.removeLayer(layerId);
  	  		// update active layer of the globe webMap
  	  		var webMapLayers = webMap._layers;
  	  		if (webMapLayers.length > 0) {
  	  			webMap.activeLayer = webMapLayers[0];
  	  		}
  	  		else {
  	  			webMap.activeLayer = undefined;
  	  		}
  		} 		
  	}
  	
	function addWebMapServiceProvider() {
		var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
		var wmsProviderViewModel = new Cesium.ProviderViewModel({
	        name : addWmsViewModel.name,
	        iconUrl : addWmsViewModel.iconUrl,
	        tooltip : addWmsViewModel.tooltip,
	        creationFunction : function() {
	            return new Cesium.WebMapServiceImageryProvider({
	    			url: addWmsViewModel.url,
	    			layers : addWmsViewModel.layers,
	    			parameters: {
	    				map: addWmsViewModel.map
	    			},
	    			proxy: new Cesium.DefaultProxy('/proxy/')
	    		});
	        }
	    });
		baseLayerPickerViewModel.imageryProviderViewModels.push(wmsProviderViewModel);
		baseLayerPickerViewModel.selectedImagery = wmsProviderViewModel;
	}
	
	function removeImageryProvider() {
		var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
		var selectedImagery = baseLayerPickerViewModel.selectedImagery;
		baseLayerPickerViewModel.imageryProviderViewModels.remove(selectedImagery);
		baseLayerPickerViewModel.selectedImagery = baseLayerPickerViewModel.imageryProviderViewModels[0];
	}	  	

	function addTerrainProvider() {
		var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
		var demProviderViewModel = new Cesium.ProviderViewModel({
	        name : addTerrainViewModel.name,
	        iconUrl : addTerrainViewModel.iconUrl,
	        tooltip : addTerrainViewModel.tooltip,
	        creationFunction : function() {
	            return new Cesium.CesiumTerrainProvider({
	    			url : addTerrainViewModel.url
	    		});
	        }
	    })
		baseLayerPickerViewModel.terrainProviderViewModels.push(demProviderViewModel);
		baseLayerPickerViewModel.selectedTerrain = demProviderViewModel;
	}
	
	function removeTerrainProvider() {
		var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
		var selectedTerrain = baseLayerPickerViewModel.selectedTerrain;
		baseLayerPickerViewModel.terrainProviderViewModels.remove(selectedTerrain);
		baseLayerPickerViewModel.selectedTerrain = baseLayerPickerViewModel.terrainProviderViewModels[0];
	}
	
	function createScreenshot() {
  		cesiumViewer.render();
  		var imageUri = cesiumViewer.canvas.toDataURL();
  		var imageWin = window.open("");
  		imageWin.document.write("<html><head>" +
  				"<title>" + imageUri + "</title></head><body>" +
  				'<img src="' + imageUri + '"height="97%" width="100%">' + 
  				"</body></html>");
  		return imageWin;
	}
	
	function printCurrentview() {
  		var imageWin = createScreenshot();
  		imageWin.document.close();
  		imageWin.focus();
  		imageWin.print();
  		imageWin.close();
	}
	
	function createInfoTable(cesiumEntity) {
		var gmlid = cesiumEntity.name;
		var spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1foXFrXSX4XztW78SzpxREAvH5qeYWaeSF8xxJhhl1LY/edit#gid=1868995472";		
		cesiumEntity.description = "Loading feature information...";
		
		fetchDataFromGoogleSpreadsheet(gmlid, spreadsheetUrl).then(function(kvp){
			console.log(kvp);
			var html = '<table class="cesium-infoBox-defaultTable" style="font-size:10.5pt"><tbody>';
	        for (var key in kvp) {
	            html += '<tr><td>' + key + '</td><td>' + kvp[key] + '</td></tr>';
	        }
	        html += '</tbody></table>';

			cesiumEntity.description = html;
		}).otherwise(function(error) {
			cesiumEntity.description = 'No feature information found';
		});		
	}
	
	function fetchDataFromGoogleSpreadsheet(gmlid, spreadsheetUrl) {
		var kvp = {};
		var deferred = Cesium.when.defer();
		
		var spreadsheetKey = spreadsheetUrl.split("/")[5];
		var metaLink = 'https://spreadsheets.google.com/feeds/worksheets/' + spreadsheetKey + '/public/full?alt=json-in-script';
		
		Cesium.jsonp(metaLink).then(function(meta) {
			console.log(meta);			
			var feedCellUrl = meta.feed.entry[0].link[1].href;
			feedCellUrl += '?alt=json-in-script&min-row=1&max-row=1';
			Cesium.jsonp(feedCellUrl).then(function(cellData) {
				var feedListUrl = meta.feed.entry[0].link[0].href;
				feedListUrl += '?alt=json-in-script&sq=gmlid%3D';
				feedListUrl += gmlid;
				Cesium.jsonp(feedListUrl).then(function(listData) {
					for (var i = 1; i < cellData.feed.entry.length; i++) {
						var key = cellData.feed.entry[i].content.$t;
						var value = listData.feed.entry[0]['gsx$' + key.toLowerCase().replace(/_/g,'')].$t;
						kvp[key] = value;
					}
					deferred.resolve(kvp);
				}).otherwise(function(error) {
					deferred.reject(error);
				});
			}).otherwise(function(error) {
				deferred.reject(error);
			});
		}).otherwise(function(error) {
			deferred.reject(error);
		});
		
		return deferred.promise;
	}
	
	function showInExternalMaps() {
		var mapOptionList = document.getElementById('citydb_showinexternalmaps');
		var selectedIndex = mapOptionList.selectedIndex; 
		mapOptionList.selectedIndex = 0;
		
		var selectedEntity = cesiumViewer.selectedEntity;
		if (!Cesium.defined(selectedEntity))
			return;

		var selectedEntityPosition = selectedEntity.position;
		var wgs84OCoordinate;
		
		if (!Cesium.defined(selectedEntityPosition)) {
			var boundingSphereScratch = new Cesium.BoundingSphere();
			cesiumViewer._dataSourceDisplay.getBoundingSphere(selectedEntity, false, boundingSphereScratch);
			wgs84OCoordinate = Cesium.Ellipsoid.WGS84.cartesianToCartographic(boundingSphereScratch.center);
		}
		else {		
			wgs84OCoordinate = Cesium.Ellipsoid.WGS84.cartesianToCartographic(selectedEntityPosition._value);

		}
		var lat = Cesium.Math.toDegrees(wgs84OCoordinate.latitude);
		var lon = Cesium.Math.toDegrees(wgs84OCoordinate.longitude);
		var mapLink = "";		

		switch (selectedIndex) {
			case 1:
				mapLink = 'https://maps.google.com/maps?cbp=1,479.7175735027765,,0,-3.50219513621329&cbll=' + lat + ',' + lon + '&panoid=dmZf3jLw1OS-1bR58b03FA&gl=&hl=en&output=svembedmfe&layer=c'; 
				break;
			case 2:
				mapLink = 'http://www.openstreetmap.org/index.html?lat=' + lat + '&lon=' + lon + '&zoom=20'; 
				break;
			case 3:
				mapLink = 'http://www.bing.com/maps/default.aspx?v=2&cp=' + lat + '~' + lon + '&lvl=19&style=o';
				break;
			case 4:
				mapLink = 'http://data.dualmaps.com/dualmaps4/map.htm?x=' + lon + '&y=' + lat + '&z=16&gm=0&ve=4&gc=0&bz=0&bd=0&mw=1&sv=1&sva=1&svb=0&svp=0&svz=0&svm=2&svf=0&sve=1';
				break;
			default:
				//	do nothing...
		}
		
		window.open(mapLink);
	}
	
  	cesiumViewer.geocoder.viewModel._searchCommand.beforeExecute.addEventListener(function(info){ 	
		var gmlId = cesiumViewer.geocoder.viewModel._searchText;	
		var promise = zoomToObject(gmlId);
		Cesium.when(promise, function(result) {
			info.cancel = true;
        	cesiumViewer.geocoder.viewModel.searchText = "Object " + gmlId + " has been found!";
		},function() {
			throw new Cesium.DeveloperError(arguments);
		});	
  	});

	