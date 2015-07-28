    document.getElementById('loadingIndicator').style.display = 'none';
	// initiate 3Dcitydb-web-map instance
	var cesiumViewer = new Cesium.Viewer('cesiumContainer');
//	cesiumViewer.extend(Cesium.viewerCesiumInspectorMixin);
	var cesiumCamera = cesiumViewer.scene.camera;
	var webMap = new WebMap3DCityDB(cesiumViewer);	
	
	// active mouseClick Event		
	webMap.activateMouseClickEvents(true);
	webMap.activateMouseMoveEvents(true);
	webMap.activateViewChangedEvent(true);

    // creating some layers which were exported from 3DCityDB using KML/Collada/Gltf Exporter
	var options = {
		url : 'http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/Berlin_Center_Texture_Md/Berlin_Center_Texture_Md.kml',
		name : 'Berlin_Building_Texture',
		activeHighlighting: true,
		id : "kmlLayer"
	}; 
  	var citydbKmlLayer1 = new CitydbKmlLayer(options);
  	
	var options2 = {
		url : 'https://dl.dropboxusercontent.com/u/24313387/KML/KML%20aus%203DCityDB/StatenIsland.kml',
		name : 'Newyork_building_Lod1',
		activeHighlighting: true,
		id : 'Newyork_building_Lod1'
	};
	var citydbKmlLayer2 = new CitydbKmlLayer(options2);
	
	var options3 = {
		url : 'http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/London_LOD2_NO_HIGHLIGHTING/London_Geometry_LOD2.kml',
		name : 'London_building_Lod2',
		activeHighlighting: true,
		id : 'London_building_Lod2'
	};
	var citydbKmlLayer3 = new CitydbKmlLayer(options3);
		
	// Loading layers one by one...
	var layers = [
		citydbKmlLayer1 
		,citydbKmlLayer2 
		,citydbKmlLayer3
	];

	var k = 0;
	function loadLayer(_layer) {
		var tempMenuOption;
		_layer.registerEventHandler("STARTLOADING", function(thisLayer) {
			document.getElementById('loadingIndicator').style.display = 'block';
		});
		_layer.registerEventHandler("FINISHLOADING", function(thisLayer) {
			addEventListeners(thisLayer);
			document.getElementById('loadingIndicator').style.display = 'none';
			addLayerToMenu({
			    text : thisLayer.name,
			    onselect : function() {
			    	console.log(thisLayer);
			        thisLayer.zoomToLayer();
			    }
			});	 
			k++;
			if (k < layers.length) {
				currentLayer = layers[k];
				loadLayer(currentLayer);
				webMap.addLayer(currentLayer);
			}		 
		});
	}
	loadLayer(layers[k]);
	
	function addEventListeners(citydbKmlLayer) {
		// clickEvent Handler for Highlighting...	
		var highlightColor = new Cesium.Color(0.4, 0.4, 0.0, 1.0);
		var mouseOverhighlightColor = new Cesium.Color(0.0, 0.5, 0.0, 1.0);
		
		citydbKmlLayer.registerEventHandler("CLICK", function(object) {
			var targetEntity = object.id;
	 		var primitive = object.primitive;
	 		if (citydbKmlLayer.isInHighlightedList(targetEntity.name))
				return; 
	 	    // clear all other Highlighting status and just highlight the clicked object...
			citydbKmlLayer.unHighlightAllObjects();  									
			var highlightThis = {};
			highlightThis[targetEntity.name] = highlightColor;
			citydbKmlLayer.highlight(highlightThis); 								
		});
		
		// CtrlclickEvent Handler for Multi-Selection and Highlighting...
		citydbKmlLayer.registerEventHandler("CTRLCLICK", function(object) {
			var targetEntity = object.id;
	 		var primitive = object.primitive;

			if (citydbKmlLayer.isInHighlightedList(targetEntity.name)) {
				citydbKmlLayer.unHighlight([targetEntity.name]);
			}else {
				var highlightThis = {};
				highlightThis[targetEntity.name] = highlightColor;
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
				for (i = 0; i < materials.length; i++) {
					// do mouseOver highlighting
					materials[i].setValue('emission', Cesium.Cartesian4.fromColor(mouseOverhighlightColor));
				} 
			}
			else if (primitive instanceof Cesium.Primitive) {				
				var attributes = primitive.getGeometryInstanceAttributes(targetEntity);
				if (!Cesium.defined(targetEntity.originalSurfaceColor)) {
					targetEntity.addProperty("originalSurfaceColor");
				}						
				targetEntity.originalSurfaceColor = attributes.color;
				attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(mouseOverhighlightColor); 
				attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
			}
		});
		
	 	citydbKmlLayer.registerEventHandler("MOUSEOUT", function(object) {
	 		var primitive = object.primitive;
	 		var targetEntity = object.id;
	 		if (citydbKmlLayer.isInHighlightedList(targetEntity.name))
				return; 
			if (primitive instanceof Cesium.Model) {				
				var materials = object.mesh._materials;
				for (i = 0; i < materials.length; i++) {
					// dismiss highlighting
					materials[i].setValue('emission', new Cesium.Cartesian4(0.0, 0.0, 0.0, 1));
				} 
			}
			else if (primitive instanceof Cesium.Primitive) {
				var originalSurfaceColor = targetEntity.originalSurfaceColor;
				try{
					var attributes = primitive.getGeometryInstanceAttributes(targetEntity);
					attributes.color = originalSurfaceColor; 
					attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
				}
				catch(e){
					// escape the DeveloperError exception: "This object was destroyed..."
				}			
			}
		});	 
	}
 	
	// Zoom to desired camera position
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
  				// adding layer to Cesium Map          	          	
            	webMap.addLayer(citydbKmlLayer1);    
            }
        })
    } 
    else {
    	// default camera postion
    	var extent = new Cesium.Rectangle.fromDegrees(13.34572857, 52.5045771, 13.427975, 52.658449);
    	cesiumCamera.viewRectangle(extent);
    	// adding layer to Cesium Map          	          	
    	webMap.addLayer(citydbKmlLayer1);     
    }
    
    //---------------------------------  Button ClickEvent Handler  ----------------------------------------// 
    
    // Creation of a weblink for sharing with other people..
 	var generateLink = function(){
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
			'&altitude=' + cameraPostion.altitude;
			window.history.pushState("string", "Title", projectLink);
        }
  	};
  	
  	// Clear Highlighting effect of all highlighted objects
  	var clearhighlight = function(){
  		citydbKmlLayer1.unHighlightAllObjects(); 
  		citydbKmlLayer2.unHighlightAllObjects(); 
  		citydbKmlLayer3.unHighlightAllObjects();
  	};
  	
  	var layerMenuOptions = new Array();
    var layerMenu = document.getElementById('layerSelection');
    layerMenu.onchange = function() {
        var item = layerMenuOptions[layerMenu.selectedIndex];
        if (item && typeof item.onselect === 'function') {
            item.onselect();
        }
    };
  	function addLayerToMenu(layerOption) {
  		layerMenuOptions.push(layerOption);
		var menuOption = document.createElement('option');
		menuOption.textContent = layerOption.text;
		layerMenu.appendChild(menuOption);	
		return menuOption;
	}
  	function removeMenuOption(menuOption){
  		layerMenu.removeChild(menuOption);
  	}