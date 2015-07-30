
	// initiate 3Dcitydb-web-map instance
	var cesiumViewer = new Cesium.Viewer('cesiumContainer');
	var cesiumCamera = cesiumViewer.scene.camera;
	var webMap = new WebMap3DCityDB(cesiumViewer);	
	
	// adding a new layer which was exported from 3DCityDB using KML/Collada/Gltf Exporter
	var options = {
		url : 'http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/Berlin_Center_Texture_Md/Berlin_Center_Texture_Md.kml',
		name : 'Berlin_Building_Texture',
		activeHighlighting: true,
		id : "kmlLayer"
	};
	var citydbKmlLayer = new CitydbKmlLayer(options);	

	webMap.activateViewChangedEvent(true);
	
	// enable Highlighting capability
	var highlightColor = new Cesium.Color(0.4, 0.4, 0.0, 0.5);
	
  	var highlight = function(){
		var highlightThis = {
			"BLDG_0003000e00768233": Cesium.Color.fromRandom({red : 1.0, green : 0.4, alpha : 1.0}),
			"BLDG_0003000e00768236": Cesium.Color.fromRandom({red : 1.0, green : 0.4, alpha : 1.0}),
			"BLDG_0003000f0012b2d3": Cesium.Color.fromRandom({red : 1.0, green : 0.4, alpha : 1.0}),
			"BLDG_0003000a002edb0e": Cesium.Color.fromRandom({red : 1.0, green : 0.4, alpha : 1.0}),
			"BLDG_0003000f00292bce": Cesium.Color.fromRandom({red : 1.0, green : 0.4, alpha : 1.0}) 
		};
		citydbKmlLayer.highlight(highlightThis); 
  	};
  	
  	var unhighlight = function(){
		var unHighlightThis = [
			"BLDG_0003000e00768233",
			"BLDG_0003000e00768236",
			"BLDG_0003000f0012b2d3",
			"BLDG_0003000a002edb0e",
			"BLDG_0003000f00292bce" 
		];
		citydbKmlLayer.unHighlight(unHighlightThis); 
  	};
  	
  	var doHideObjects = function(){
		var hideThis = [
 			"BLDG_0003000e00768233",
			"BLDG_0003000e00768236",
			"BLDG_0003000f0012b2d3",
			"BLDG_0003000a002edb0e",
			"BLDG_0003000f00292bce" 
		];
		citydbKmlLayer.hideObjects(hideThis); 
  	};
  	
  	var doShowObjects = function(){
  		console.log(cesiumViewer.selectedEntity);
		var showThis = [
 			"BLDG_0003000e00768233",
			"BLDG_0003000e00768236",
			"BLDG_0003000f0012b2d3",
			"BLDG_0003000a002edb0e",
			"BLDG_0003000f00292bce" 
		];
		citydbKmlLayer.showObjects(showThis); 
  	};
	
  	var hideSelectedObject = function(){
  		var selectedEntity = cesiumViewer.selectedEntity;
  		var objectId = selectedEntity.name;
  		citydbKmlLayer.hideObjects([objectId]); 
  	};
  	
  	var showHiddenObjects = function(){
  		citydbKmlLayer.showAllObjects();
  	};
  	
	// Zoom to target layer
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
            	webMap.addLayer(citydbKmlLayer);     
            }
        })
    } 
    else {
    	// default camera postion
    	var extent = new Cesium.Rectangle.fromDegrees(13.34572857, 52.5045771, 13.427975, 52.658449);
    	cesiumCamera.viewRectangle(extent);
    	// adding layer to Cesium Map          	          	
    	webMap.addLayer(citydbKmlLayer);     
    }	