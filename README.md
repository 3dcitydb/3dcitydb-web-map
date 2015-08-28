# 3dcitydb-web-map

Cesium based web mapping providing building layers to be included in Cesium.

Multiple implementations to highlight and hide/show buildings.



Architecture overview:

	Web-Map3DCityDB 	(3dcitydb-web-map.js) -> wraps the cesium viewer, allows to add building layers
	Layer3DCityDB 		(3dcitydb-layer.js) -> interface for building layers
		|
		| instances 
		|
		--> TMSObjectLayer (tmsobjectlayer.js) --> implementation by virtualcitySYSTEMS
		--> CitydbKmlLayer (CitydbKmlLayer.js) --> implementation by TU Muenchen



Examples of both implementations can be found under ./examples

### Demos 
[Demo 1: Visualization of 3D City Model of Berlin (LoD2) with textures](http://www.3dcitydb.net:8000/examples/citydbKmlLayerSample/index.html?lat=52.51711033546089&lon=13.386406880186243&range=335.1643719298618&tilt=63.225430732410175&heading=357.4370479632554&altitude=0&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_Center_Texture_Md%252FBerlin_Center_Texture_Md_MasterJSON.json%26name%3DBerlin_CityCenter_Building_Texture%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252Fdata%253Fdocid%253D1Zej5O0AJCc4ZKzsVEQXaRa28fC3LJT2hEeCVIwMu%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

[Demo 2: Visualization of 3D City Model of Berlin with different level of detail geometries (LoD1 and LoD2)](http://www.3dcitydb.net:8000/examples/citydbKmlLayerSample/index.html?lat=52.52069090848949&lon=13.39700132405371&range=656.4063590751663&tilt=45.0446866373068&heading=358.40783980134154&altitude=0&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_Center_LoDs%252FBerlin_Center_Geometry%252FBerlin_Center_Geometry_MasterJSON.json%26name%3DBerlin_Center_Geometry%26pickSurface%3Dtrue%26spreadsheetUrl%3D%26minLodPixels%3D450%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D30%26maxCountOfVisibleTiles%3D30&layer_1=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_Center_LoDs%252FBerlin_Center_Extruded%252FBerlin_Center_Extruded_MasterJSON.json%26name%3DBerlin_Center_Extruded%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252Fdata%253Fdocid%253D1Zej5O0AJCc4ZKzsVEQXaRa28fC3LJT2hEeCVIwMu%2523rows%253Aid%253D1%26minLodPixels%3D150%26maxLodPixels%3D450%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

[Demo 3: Visualization of 3D City Model of New York (LoD1) with over 1 million building geometries](http://www.3dcitydb.net:8000/examples/citydbKmlLayerSample/index.html?lat=40.76794164737693&lon=-73.95093331411786&range=841.1523750283874&tilt=51.478119243223524&heading=1.6909466596740852&altitude=0&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FNYK_All_Geometry_Grey%252FNYK_All_Geometry_MasterJSON.json%26name%3DNewYork_Building_LoD1%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D1HGAd9n_JIwgrkQ3_4vL08Vtnh9O5Y_HNf1jxRF1y%2523rows%253Aid%253D1%26minLodPixels%3D100%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

Multi-Selection (CTRL + LeftClick), Highlighting, attribute query and showing/hiding objects are supported.