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
[Demo: Visualisation of Berlin dataset with textures](http://www.3dcitydb.net/3dcitydb/fileadmin/3dcitydb-web-map/examples/citydbKmlLayerSample/index.html?lat=52.517039839265664&lon=13.38075126356296&range=615.9455811966918&tilt=59.98878178311169&heading=359.99454860386106&altitude=0)
Highlighting, showing/hiding, and Multi-Selection (CTRL + LeftClick) of the buildings are supported