# 3dcitydb-web-map

Cesium based web mapping providing building layers to be included in Cesium.

Multiple implementations to highlight and hide/show buildings.



Architecture overview:

	WebMap3DCityDB 	   (3dcitydb-web-map.js)  --> wraps the Cesium viewer, allows to add building layers
	Layer3DCityDB 		(3dcitydb-layer.js)   --> interface for building layers
		|
		| instances 
		|
		--> B3DMLayer 		(b3DMLayer.js)     --> implementation by virtualcitySYSTEMS
		--> CitydbKmlLayer (CitydbKmlLayer.js) --> implementation by TU Muenchen



Examples of both implementations can be found under ./examples

### Demos 
[Demo 1: Visualization of semantic 3D City Model of Berlin. This Demo shows all Berlin buildings (> 500,000) with textured 3D geometries (LoD2) and thematic attributes per building](http://www.3dcitydb.org/3dcitydb-web-map/1.0/3dwebclient/index.html?batchSize=1&gltf_version=0.8&title=Berlin_Texture_Demo&latitude=52.51778655922457&longitude=13.407318454388344&height=399.72840848172166&heading=15.394059765392447&pitch=-39.85621126246738&roll=4.613334007701696e-7&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_All_Texture_Rgb%252FBerlin_All_Texture_Rgb_MasterJSON_NoJSONP.json%26name%3DBerlin_All_Texture%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

[Demo 2: Visualization of semantic 3D City Model of Berlin. This Demo shows all Berlin buildings (> 500,000) with different level of detail 3D geometries (LoD1 and LoD2) and thematic attributes per building](http://www.3dcitydb.org/3dcitydb-web-map/1.0/3dwebclient/index.html?gltf_version=0.8&title=Berlin_Geometry_Demo&latitude=52.51303384198974&longitude=13.419003387524793&height=332.5690553315315&heading=315.15087966347744&pitch=-40.2550086076328&roll=359.99999679197674&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_All_Geometry%252FBerlin_All_Geometry_MasterJSON_NoJSONP.json%26name%3DBerlin_Building_Geometry%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26minLodPixels%3D450%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200&layer_1=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_All_Extruded%252FBerlin_All_Extruded_MasterJSON_NoJSONP.json%26name%3DBerlin_Building_Extruded%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26minLodPixels%3D150%26maxLodPixels%3D450%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

[Demo 3: Visualization of semantic 3D city model of New York City (NYC), This Demo shows all NYC buildings (> 1 million), roads (> 140,000), and lots (> 800,000) – all with 3D geometries (LoD1) and thematic attributes per object](http://www.3dcitydb.org/3dcitydb-web-map/1.0/3dwebclient/index.html?batchSize=3&gltf_version=0.8&title=NYC_Demo&latitude=40.74337478856652&longitude=-73.98774263868867&height=329.6833486632038&heading=212.94068327361515&pitch=-48.25628003176496&roll=359.9999849535639&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FCesium_NYC_Demo%252FNYK_Building_Extruded%252FNYK_Building_Extruded_MasterJSON_NoJSONP.json%26name%3DNYC_Buildings%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D1ivFBfqsnkv5OlvkQUybgfOSjIz_u9_98_mmJVUss%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200&layer_1=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FCesium_NYC_Demo%252FNYK_Street_Footprint%252FNYK_Street_Footprint_MasterJSON_NoJSONP.json%26name%3DNYC_Streets%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252Fdata%253Fdocid%253D1qLk_S4yxma0MI1LmISc8DdLn_NdhrFb784Mwizas%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200&layer_2=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FCesium_NYC_Demo%252FNYK_Landuse_Footprint%252FNYK_Landuse_Footprint_MasterJSON_NoJSONP.json%26name%3DNYC_Lots%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252Fdata%253Fdocid%253D1cdvru7oiJIm0Us4Lgt-KYndNvGYcHjefYaTK_nK4%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)


Multi-Selection (CTRL + LeftClick), Highlighting, attribute query and showing/hiding objects are supported.