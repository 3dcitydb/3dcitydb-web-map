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
[Demo 1: Visualization of semantic 3D City Model of Berlin. This Demo shows all Berlin buildings (> 500,000) with textured 3D geometries (LoD2) and thematic attributes per building](http://www.3dcitydb.net/3dcitydb-web-map/0.91/3dwebclient/index.html?title=Berlin_Texture_Demo&lat=52.521935238792295&lon=13.409191115302134&range=623.7623480550842&tilt=50.148079816711096&heading=15.39554613801837&altitude=0&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_All_Texture_Rgb%252FBerlin_All_Texture_Rgb_MasterJSON.json%26name%3DBerlin_All_Texture%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

[Demo 2: Visualization of semantic 3D City Model of Berlin. This Demo shows all Berlin buildings (> 500,000) with different level of detail 3D geometries (LoD1 and LoD2) and thematic attributes per building](http://www.3dcitydb.net/3dcitydb-web-map/0.91/3dwebclient/index.html?title=Berlin_Geometry_Demo&lat=52.52114141362578&lon=13.408484804529383&range=778.4372152222605&tilt=46.27014432078075&heading=3.4744284821378826&altitude=0&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_All_Geometry%252FBerlin_All_Geometry_MasterJSON.json%26name%3DBerlin_Building_Geometry%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26minLodPixels%3D450%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D30%26maxCountOfVisibleTiles%3D30&layer_1=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_All_Extruded%252FBerlin_All_Extruded_MasterJSON.json%26name%3DBerlin_Building_Extruded%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26minLodPixels%3D150%26maxLodPixels%3D450%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)

[Demo 3: Visualization of semantic 3D city model of New York City (NYC), This Demo shows all NYC buildings (> 1 million), roads (> 140,000), and lots (> 800,000) – all with 3D geometries (LoD1) and thematic attributes per object](http://www.3dcitydb.net/3dcitydb-web-map/0.91/3dwebclient/index.html?title=NYC_Demo&lat=40.74115144365902&lon=-73.98963664627051&range=441.86673574562064&tilt=41.74637445680675&heading=212.93943590896322&altitude=0&layer_0=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FCesium_NYC_Demo%252FNYK_Building_Extruded%252FNYK_Building_Extruded_MasterJSON.json%26name%3DNYC_Buildings%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D1ivFBfqsnkv5OlvkQUybgfOSjIz_u9_98_mmJVUss%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200&layer_1=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FCesium_NYC_Demo%252FNYK_Street_Footprint%252FNYK_Street_Footprint_MasterJSON.json%26name%3DNYC_Streets%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252Fdata%253Fdocid%253D1qLk_S4yxma0MI1LmISc8DdLn_NdhrFb784Mwizas%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200&layer_2=url%3Dhttp%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fmydata%252FCesium_NYC_Demo%252FNYK_Landuse_Footprint%252FNYK_Landuse_Footprint_MasterJSON.json%26name%3DNYC_Lots%26pickSurface%3Dfalse%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252Fdata%253Fdocid%253D1cdvru7oiJIm0Us4Lgt-KYndNvGYcHjefYaTK_nK4%2523rows%253Aid%253D1%26minLodPixels%3D140%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D50%26maxCountOfVisibleTiles%3D200)


Multi-Selection (CTRL + LeftClick), Highlighting, attribute query and showing/hiding objects are supported.