	// launch Cesium Viewer 
	var viewer = new Cesium.Viewer('cesiumContainer');
	
	// zoom to Vorarlberg	
	var extent = new Cesium.Rectangle.fromDegrees(9.706108, 47.220648, 9.796108, 47.320648);
	viewer.camera.viewRectangle(extent);

	function addWebMapServiceProvider() {
		var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
		var wmsProviderViewModel = new Cesium.ProviderViewModel({
	        name : 'Vorarlberg WMS Service',
	        iconUrl : 'http://cdn.flaggenplatz.de/media/catalog/product/all/4489b.gif',
	        tooltip : 'Voralberg Luftbild',
	        creationFunction : function() {
	            return new Cesium.WebMapServiceImageryProvider({
	    			url: 'http://vogis.cnv.at/mapserver/mapserv',
	    			layers : 'ef2012_12cm',
	    			parameters: {
	    				map: 'i_luftbilder_r_wms.map'
	    			},
	    			proxy: new Cesium.DefaultProxy('/proxy/')
	    		});
	        }
	    });
		baseLayerPickerViewModel.imageryProviderViewModels.push(wmsProviderViewModel);
		baseLayerPickerViewModel.selectedImagery = wmsProviderViewModel;
	}
	
	function removeImageryProvider() {
		var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
		var selectedImagery = baseLayerPickerViewModel.selectedImagery;
		baseLayerPickerViewModel.imageryProviderViewModels.remove(selectedImagery);
		baseLayerPickerViewModel.selectedImagery = baseLayerPickerViewModel.imageryProviderViewModels[0];
	}	
	
	function addTerrainProvider() {
		var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
		var demProviderViewModel = new Cesium.ProviderViewModel({
	        name : 'Vorarlberg DEM',
	        iconUrl : 'http://cdn.flaggenplatz.de/media/catalog/product/all/4489b.gif',
	        tooltip : 'Vorarlberg Digitales Geländemodell',
	        creationFunction : function() {
	            return new Cesium.CesiumTerrainProvider({
	    			url : 'http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/terrain/vorarlberg_DGM'
	    		});
	        }
	    })
		baseLayerPickerViewModel.terrainProviderViewModels.push(demProviderViewModel);
		baseLayerPickerViewModel.selectedTerrain = demProviderViewModel;
	}
	
	function removeTerrainProvider() {
		var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
		var selectedTerrain = baseLayerPickerViewModel.selectedTerrain;
		baseLayerPickerViewModel.terrainProviderViewModels.remove(selectedTerrain);
		baseLayerPickerViewModel.selectedTerrain = baseLayerPickerViewModel.terrainProviderViewModels[0];
	}	