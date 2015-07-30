		var terrainProvider = new Cesium.CesiumTerrainProvider({
			url : 'http://www.3dcitydb.net/3dcitydb/fileadmin/mydata/terrain/vorarlberg_DGM'
		});

		var imageryProviderViewModels = [];		
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
        })
		imageryProviderViewModels.push(wmsProviderViewModel);
		imageryProviderViewModels = imageryProviderViewModels.concat(Cesium.createDefaultImageryProviderViewModels());
		
		var terrainProviderViewModels = [];
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
		terrainProviderViewModels.push(demProviderViewModel);
		terrainProviderViewModels = terrainProviderViewModels.concat(Cesium.createDefaultTerrainProviderViewModels());

		var viewer = new Cesium.Viewer('cesiumContainer', {
			imageryProviderViewModels : imageryProviderViewModels,
			terrainProviderViewModels : terrainProviderViewModels
		});
		
		var extent = new Cesium.Rectangle.fromDegrees(9.706108, 47.220648, 9.796108, 47.320648);
		viewer.camera.viewRectangle(extent);

	//	viewer.extend(Cesium.viewerCesiumInspectorMixin);
	//	viewer.scene.globe.maximumScreenSpaceError = 2;