# DEV / DEMO / TEST SHOWCASE

This file documents the ongoing development of new features as well as testing of existing ones for future releases.

For a full list of changes, please refer to the [change logs](CHANGES.md).

For a full list of all releases, please refer to the [release announcements](RELEASES.md).

Employed version: **2.0.0-dev**.

## Symbols used

In this document, the following symbols are used:

+ [ ] Pending test

+ [x] Test OK

:x: Problem

:heavy_check_mark: All tests done

## :earth_africa: Base Web Client > :point_right: Web client without any layers :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html)

## :earth_africa: Base Web Client > :point_right: Terrain Bavaria DTM :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.141633&lo=11.580329&h=1377.45&hd=272.19&p=-62.11&r=360&&tr=name%3DBavaria%2520DTM%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fbvv3d21.bayernwolke.de%252F3d-data%252Flatest%252Fterrain%252F&sw=showOnStart%3Dfalse)

+ [x] Insert a terrain layer
+ [x] Display the terrain layer
+ [x] Delete the terrain layer
+ [x] Reinsert after delete
+ [x] Reimport using generated URL

## :earth_africa: Base Web Client > :point_right: WMS Bavaria DOP 80

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.141287&lo=11.585618&h=35931.217&hd=360&p=-90&r=0&&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fgeoservices.bayern.de%252Fwms%252Fv2%252Fogc_dop80_oa.cgi%253F%26name%3DBavaria%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop80c%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D%252Fproxy%252F&sw=showOnStart%3Dfalse)

:x: WMS dataset currently not available/working

## :earth_africa: Base Web Client > :point_right: WMS Bavaria DOP 40 :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.141287&lo=11.585618&h=35931.217&hd=360&p=-90&r=0&&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fgeoservices.bayern.de%252Fod%252Fwms%252Fdop%252Fv1%252Fdop40%253F%26name%3DBavaria%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop40c%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D%252Fproxy%252F&sw=showOnStart%3Dfalse)

+ [x] Insert a WMS layer
+ [x] Display the WMS layer
+ [x] Delete the WMS layer
+ [x] Reinsert after delete
+ [x] Reimport using generated URL

## :earth_africa: Base Web Client > :point_right: WMS Bavaria DOP 20 :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.141287&lo=11.585618&h=35931.217&hd=360&p=-90&r=0&&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fgeoservices.bayern.de%252Fod%252Fwms%252Fdop%252Fv1%252Fdop20%253F%26name%3DBavaria%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop20c%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D%252Fproxy%252F&sw=showOnStart%3Dfalse)

+ [x] Insert a WMS layer
+ [x] Display the WMS layer
+ [x] Delete the WMS layer
+ [x] Reinsert after delete
+ [x] Reimport using generated URL

## :earth_africa: Base Web Client > :point_right: WMTS USGS Shaded Relief :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=34.253513&lo=22.289328&h=8221190.152&hd=360&p=-89.87&r=0&&bm=imageryType%3Dwmts%26url%3Dhttps%253A%252F%252Fbasemap.nationalmap.gov%252Farcgis%252Frest%252Fservices%252FUSGSShadedReliefOnly%252FMapServer%252FWMTS%26name%3DUSGS%2520Shaded%2520Relief%2520(via%2520WMTS)%26iconUrl%3D%26tooltip%3D%26layers%3DUSGSShadedReliefOnly%26tileStyle%3Ddefault%26tileMatrixSetId%3Ddefault028mm%26additionalParameters%3D%26proxyUrl%3D%252Fproxy%252F&sw=showOnStart%3Dfalse)

+ [x] Insert a WMTS layer
+ [x] Display the WMTS layer
+ [x] Delete the WMTS layer
+ [x] Reinsert after delete
+ [x] Reimport using generated URL

## :earth_africa: Base Web Client > :point_right: WMTS Bavaria DOP :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.132231&lo=11.569072&h=10363.664&hd=0&p=-90&r=0&&bm=imageryType%3Dwmts%26url%3Dhttps%253A%252F%252Fwmtsod1.bayernwolke.de%252Fwmts%252Fby_dop%252F%257BTileMatrixSet%257D%252F%257BTileMatrix%257D%252F%257BTileCol%257D%252F%257BTileRow%257D%26name%3DBavaria%2520WMTS%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop%26tileStyle%3Ddefault%26tileMatrixSetId%3Dsmerc%26additionalParameters%3D%26proxyUrl%3D&sw=showOnStart%3Dfalse)

+ [x] Insert a WMTS layer
+ [x] Display the WMTS layer
+ [x] Delete the WMTS layer
+ [x] Reinsert after delete
+ [x] Reimport using generated URL

## :earth_africa: Base Web Client > :point_right: WMTS NRW DOP

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=50.957708&lo=6.967279&h=27940.672&hd=360&p=-90&r=0&&bm=imageryType%3Dwmts%26url%3Dhttps%253A%252F%252Fwww.wmts.nrw.de%252Fgeobasis%252Fwmts_nw_dop%252Ftiles%252Fnw_dop%252F%257BTileMatrixSet%257D%252F%257BTileMatrix%257D%252F%257BTileCol%257D%252F%257BTileRow%257D%26name%3DNRW%2520WMTS%26iconUrl%3D%26tooltip%3D%26layers%3Dnw_dop%26tileStyle%3Ddefault%26tileMatrixSetId%3DEPSG_3857_16%26additionalParameters%3D%26proxyUrl%3D&sw=showOnStart%3Dfalse)

:x: WMTS dataset currently not available/working

## :basketball: Cesium 3D Tiles > :point_right: Buildings Bavaria, WMS, Terrain, PostgreSQL/PostgREST :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.136034&lo=11.567686&h=1122.942&hd=7.28&p=-45.67&r=360&l_0=u%3Dhttps%253A%252F%252Fbvv3d21.bayernwolke.de%252F3d-data%252Flatest%252Flod23d%252Ftileset.json%26n%3DBavaria%2520Buildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fbsvr.gis.lrg.tum.de%252Fpostgrest%252Fgeomassendaten%26ds%3DPostgreSQL%26tt%3DVertical%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D%26null%3D16&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fgeoservices.bayern.de%252Fod%252Fwms%252Fdop%252Fv1%252Fdop20%253F%26name%3DBavaria%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop20c%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D%252Fproxy%252F&tr=name%3DBavaria%2520DTM%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fbvv3d21.bayernwolke.de%252F3d-data%252Flatest%252Fterrain%252F&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :basketball: Cesium 3D Tiles > :point_right: Buildings Cologne, WMS, Terrain, OGC Feature API :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2024-04-23T10%3A35%3A37Z&t=3DCityDB-Web-Map-Client&s=false&ts=0&la=50.9222&lo=6.940655&h=898.086&hd=349.28&p=-49.15&r=0&l_0=u%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fbuildings-fly%252Froot.json%26n%3DBasemap.de%2520LOD2%2520Buildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fwww.ldproxy.nrw.de%252Fkataster%252Fcollections%252Fgebaeudebauwerk%252Fitems%26ds%3DOGCFeatureAPI%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fsgx.geodatenzentrum.de%252Fwms_basemapde%26name%3DGDI-DE%2520Webmap%2520Karte%26iconUrl%3Dhttps%253A%252F%252Fgdz.bkg.bund.de%252Fskin%252Ffrontend%252Fbkg%252Fbkg_blau%252Fimages%252Fbkg_logo.svg%26tooltip%3DGDI-DE%2520Webmap%2520Karte%26layers%3Dde_basemapde_web_raster_farbe%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D&tr=name%3DDGM5%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fdgm5-mesh&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :basketball: Cesium 3D Tiles > :point_right: Buildings Cologne, WMS, Terrain, embedded thematic :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2024-04-23T10%3A35%3A37Z&t=3DCityDB-Web-Map-Client&s=false&ts=0&la=50.9222&lo=6.940655&h=898.086&hd=349.28&p=-49.15&r=360&l_0=u%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fbuildings-fly%252Froot.json%26n%3DBasemap.de%2520LOD2%2520Buildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fwww.ldproxy.nrw.de%252Fkataster%252Fcollections%252Fgebaeudebauwerk%252Fitems%26ds%3DEmbedded%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fsgx.geodatenzentrum.de%252Fwms_basemapde%26name%3DGDI-DE%2520Webmap%2520Karte%26iconUrl%3Dhttps%253A%252F%252Fgdz.bkg.bund.de%252Fskin%252Ffrontend%252Fbkg%252Fbkg_blau%252Fimages%252Fbkg_logo.svg%26tooltip%3DGDI-DE%2520Webmap%2520Karte%26layers%3Dde_basemapde_web_raster_farbe%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D&tr=name%3DDGM5%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fdgm5-mesh&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :basketball: Cesium 3D Tiles > :point_right: Buildings Hamburg, WMS, Terrain, OGC Feature API :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2024-04-23T10%3A35%3A37Z&t=3DCityDB-Web-Map-Client&s=false&ts=0&la=53.544272&lo=9.991035&h=1770.099&hd=1.55&p=-72.82&r=0&l_0=u%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fbuildings-fly%252Froot.json%26n%3DBasemap.de%2520LOD2%2520Buildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fapi.hamburg.de%252Fdatasets%252Fv1%252Falkis_vereinfacht%252Fcollections%252FGebaeudeBauwerk%252Fitems%26ds%3DOGCFeatureAPI%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fsgx.geodatenzentrum.de%252Fwms_basemapde%26name%3DGDI-DE%2520Webmap%2520Karte%26iconUrl%3Dhttps%253A%252F%252Fgdz.bkg.bund.de%252Fskin%252Ffrontend%252Fbkg%252Fbkg_blau%252Fimages%252Fbkg_logo.svg%26tooltip%3DGDI-DE%2520Webmap%2520Karte%26layers%3Dde_basemapde_web_raster_farbe%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D&tr=name%3DDGM5%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fdgm5-mesh&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :basketball: Cesium 3D Tiles > :point_right: Buildings Hamburg, WMS, Terrain, embedded thematic :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2024-04-23T10%3A35%3A37Z&t=3DCityDB-Web-Map-Client&s=false&ts=0&la=53.544272&lo=9.991035&h=1770.099&hd=1.55&p=-72.82&r=360&l_0=u%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fbuildings-fly%252Froot.json%26n%3DBasemap.de%2520LOD2%2520Buildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fapi.hamburg.de%252Fdatasets%252Fv1%252Falkis_vereinfacht%252Fcollections%252FGebaeudeBauwerk%252Fitems%26ds%3DEmbedded%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fsgx.geodatenzentrum.de%252Fwms_basemapde%26name%3DGDI-DE%2520Webmap%2520Karte%26iconUrl%3Dhttps%253A%252F%252Fgdz.bkg.bund.de%252Fskin%252Ffrontend%252Fbkg%252Fbkg_blau%252Fimages%252Fbkg_logo.svg%26tooltip%3DGDI-DE%2520Webmap%2520Karte%26layers%3Dde_basemapde_web_raster_farbe%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D&tr=name%3DDGM5%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fdgm5-mesh&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :basketball: Cesium 3D Tiles > :point_right: Buildings Munich, WMS, Terrain, embedded thematic :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2024-04-23T10%3A35%3A37Z&t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.122821&lo=11.504208&h=930.269&hd=2.52&p=-46.06&r=359.81&l_0=u%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fbuildings-fly%252Froot.json%26n%3DBasemap.de%2520LOD2%2520Buildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D%26a%3Dtrue%26tdu%3D%26ds%3DEmbedded%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D%26mse%3D&bm=name%3DGDI-DE%2520Webmap%2520Karte%26iconUrl%3Dhttps%253A%252F%252Fgdz.bkg.bund.de%252Fskin%252Ffrontend%252Fbkg%252Fbkg_blau%252Fimages%252Fbkg_logo.svg%26tooltip%3DGDI-DE%2520Webmap%2520Karte%26url%3Dhttps%253A%252F%252Fsgx.geodatenzentrum.de%252Fwms_basemapde%26layers%3Dde_basemapde_web_raster_farbe%26additionalParameters%3D%26proxyUrl%3D&tr=name%3DDGM5%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fweb3d.basemap.de%252Fcesium%252Fdgm5-mesh&sw=)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :globe_with_meridians: COLLADA/KML/glTF > :point_right: Streets Bavaria, WMS, Terrain, Google Spreadsheets :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=Ingolstadt_A9&s=false&ts=0&la=48.768575&lo=11.463732&h=916.517&hd=330.05&p=-48.44&r=359.86&l_0=u%3Dhttps%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252Fingolstadt_A9%252Fkml_roads_A9%252Fkml_roads_A9_collada_MasterJSON.json%26n%3DRoads%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fdocs.google.com%252Fspreadsheets%252Fd%252F1j2lSK82S23oF4JF9Cu9bdY2e4LNl-l1ujzVMXGutjds%252Fedit%253Fusp%253Dsharing%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D125%26al%3D1.7976931348623157e%252B308%26ac%3D50%26av%3D200%26null%3D16&bm=imageryType%3Dwms%26url%3Dhttps%253A%252F%252Fgeoservices.bayern.de%252Fod%252Fwms%252Fdop%252Fv1%252Fdop20%253F%26name%3DBavaria%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop20c%26tileStyle%3D%26tileMatrixSetId%3D%26additionalParameters%3D%26proxyUrl%3D%252Fproxy%252F&tr=name%3Ddgm%26iconUrl%3D%26tooltip%3D%26url%3Dhttps%253A%252F%252Fbvv3d21.bayernwolke.de%252F3d-data%252Flatest%252Fterrain%252F&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

##  :soccer: I3S > :point_right: Buildings San Francisco, embedded thematic

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=37.756783&lo=-122.43645&h=160.854&hd=318.53&p=-43.14&r=360&l_0=u%3Dhttps%253A%252F%252Ftiles.arcgis.com%252Ftiles%252Fz2tnIkrLQ2BRzr6P%252Farcgis%252Frest%252Fservices%252FSanFrancisco_3DObjects_1_7%252FSceneServer%252Flayers%252F0%26n%3Di3s%26ld%3Di3s%26lp%3D%26lc%3D%26gv%3D%26a%3Dtrue%26tdu%3D%26ds%3DEmbedded%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D%26null%3D16&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [ ] Select and fly to a highlighted object -> Highlighting sometimes disappears due to zooming?
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :dvd: GeoJSON > :point_right: Districts NRW, OGC Feature API :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=50.333235&lo=6.427043&h=4053.567&hd=360&p=-45.06&r=360&l_0=u%3Dhttps%253A%252F%252Fwww.ldproxy.nrw.de%252Fkataster%252Fcollections%252Fflurstueck%252Fitems%253Ff%253Djson%2526bbox%253D6.4%252C50.35%252C6.45%252C50.4%2526limit%253D2000%26n%3DGeoJSON%26ld%3Dgeojson%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fwww.ldproxy.nrw.de%252Fkataster%252Fcollections%252Fflurstueck%252Fitems%26ds%3DOGCFeatureAPI%26tt%3DHorizontal%26gc%3D%26il%3D140%26al%3D1.7976931348623157e%252B308%26ac%3D200%26av%3D200%26null%3D16&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :dvd: GeoJSON > :point_right: Districts NRW, embedded thematic :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=50.333235&lo=6.427043&h=4053.567&hd=360&p=-45.06&r=360&l_0=u%3Dhttps%253A%252F%252Fwww.ldproxy.nrw.de%252Fkataster%252Fcollections%252Fflurstueck%252Fitems%253Ff%253Djson%2526bbox%253D6.4%252C50.35%252C6.45%252C50.4%2526limit%253D2000%26n%3DGeoJSON%26ld%3Dgeojson%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dtrue%26tdu%3D%26ds%3DEmbedded%26tt%3DHorizontal%26gc%3D%26il%3D140%26al%3D1.7976931348623157e%252B308%26ac%3D200%26av%3D200%26null%3D16&sw=showOnStart%3Dfalse)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :milky_way: Mixed Layers > :point_right: TUM Buildings, LODs, Solar, Vegetation :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?t=3DCityDB-Web-Map-Client&s=false&ts=0&la=48.146479&lo=11.568271&h=659.643&hd=343.25&p=-30.38&r=359.94&l_0=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FmunichSolarFull%252Fvegetation%252Fmunich_vegetation_collada_MasterJSON.json%26n%3DVegetation%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dtrue%26gv%3D2.0%26a%3Dtrue%26tdu%3D%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D120%26al%3D1.7976931348623157e%252B308%26ac%3D100%26av%3D50%26null%3D16&l_1=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FmunichSolarScenarios%252Flod1_dgm%252Fsolar-bldg-glTF%252Flod1_orgBy_dgm_solar-bldg-glTF_collada_MasterJSON.json%26n%3DBldg%2520LoD1%2520-%2520Terrain%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dtrue%26gv%3D2.0%26a%3Dfalse%26tdu%3Dhttps%253A%252F%252Fbsvr.gis.lrg.tum.de%252Fpostgrest%252Fmunich_lod1_dgm%26ds%3DPostgreSQL%26tt%3DVertical%26gc%3D%26il%3D120%26al%3D1.7976931348623157e%252B308%26ac%3D100%26av%3D50%26null%3D16&l_2=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FmunichSolarScenarios%252Flod1_dgm_vegetation%252Fsolar-bldg-glTF%252Flod1_orgBy_dgm_vegetation_solar-bldg-glTF_collada_MasterJSON.json%26n%3DBldg%2520LoD1%2520-%2520Terrain%252C%2520Vegetation%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dtrue%26gv%3D2.0%26a%3Dfalse%26tdu%3Dhttps%253A%252F%252Fbsvr.gis.lrg.tum.de%252Fpostgrest%252Fmunich_lod1_dgm_vegetation%26ds%3DPostgreSQL%26tt%3DVertical%26gc%3D%26il%3D120%26al%3D1.7976931348623157e%252B308%26ac%3D100%26av%3D50%26null%3D16&l_3=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FmunichSolarScenarios%252Flod2_dgm%252Fsolar-bldg-glTF%252Flod2_dgm_solar-bldg-glTF_collada_MasterJSON.json%26n%3DBldg%2520LoD2%2520-%2520Terrain%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dtrue%26gv%3D2.0%26a%3Dfalse%26tdu%3Dhttps%253A%252F%252Fbsvr.gis.lrg.tum.de%252Fpostgrest%252Fmunich_lod2_dgm%26ds%3DPostgreSQL%26tt%3DVertical%26gc%3D%26il%3D120%26al%3D1.7976931348623157e%252B308%26ac%3D100%26av%3D50%26null%3D16&l_4=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FmunichSolarFull%252Fsolar-bldg-glTF%252Fmunich_solar-bldg-glTF_collada_MasterJSON.json%26n%3DBldg%2520LoD2%2520-%2520Terrain%252C%2520Vegetation%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dtrue%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fbsvr.gis.lrg.tum.de%252Fpostgrest%252Fmunich_full%26ds%3DPostgreSQL%26tt%3DVertical%26gc%3D%26il%3D120%26al%3D1.7976931348623157e%252B308%26ac%3D100%26av%3D50%26null%3D16&bm=imageryType%3Dwmts%26url%3Dhttps%253A%252F%252Fwmtsod1.bayernwolke.de%252Fwmts%252Fby_dop%252F%257BTileMatrixSet%257D%252F%257BTileMatrix%257D%252F%257BTileCol%257D%252F%257BTileRow%257D%26name%3DBavaria%2520WMTS%26iconUrl%3D%26tooltip%3D%26layers%3Dby_dop%26tileStyle%3Ddefault%26tileMatrixSetId%3Dsmerc%26additionalParameters%3D%26proxyUrl%3D&tr=name%3DDGM1%26iconUrl%3D%26tooltip%3DLDBV%2520-%2520DGM1%26url%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252Fterrain_bay_geomassendaten&sw=)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**3D layer handling**:

+ [x] Activate layers
+ [x] Deactivate layers
+ [x] Remove layers
+ [x] Reinsert layers

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :milky_way: Mixed Layers > :point_right: TUM Lanes, Buildings, Solar, Vegetation :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2024-06-22T11%3A05%3A05Z&t=Munich_LaneModel&s=false&ts=0&la=48.145591&lo=11.570041&h=467.332&hd=333.36&p=-54.52&r=360&l_0=u%3Dhttps%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FLaneModel%252Ftum%252Fbuildings_height_zero%252Ftileset.json%26n%3DBuildings%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D%26a%3Dtrue%26tdu%3D%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D&l_1=u%3Dhttps%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FLaneModel%252Ftum%252FLaneModel_visexp_textured%252FLaneAreas_TUMclip%252Ftileset.json%26n%3DLane%2520Model%26ld%3DCesium%25203D%2520Tiles%26lp%3D%26lc%3D%26gv%3D%26a%3Dtrue%26tdu%3D%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D%26al%3D%26ac%3D%26av%3D&l_2=u%3Dhttps%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FLaneModel%252Ftum%252Fvegetation%252Fvegetation_collada_MasterJSON.json%26n%3DVegetation%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dtrue%26tdu%3D%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D125%26al%3D1.7976931348623157e%252B308%26ac%3D50%26av%3D200&l_3=u%3Dhttps%253A%252F%252Fwww.3dcitydb.net%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252FTUM_Streetspace%252FTUM_trafficSpace%252FTUM_trafficSpace_geometry_MasterJSON.json%26n%3DTUM%2520TrafficSpaces%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dfalse%26tdu%3Dhttps%253A%252F%252Fdocs.google.com%252Fspreadsheets%252Fd%252F1JiIJnxpZiKOrCvVittVhPkVjmBEEItRuvGlP5H1BdT4%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D0%26al%3D1.7976931348623157e%252B308%26ac%3D50%26av%3D200&sw=)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**3D layer handling**:

+ [x] Activate layers
+ [x] Deactivate layers
+ [x] Remove layers
+ [x] Reinsert layers

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps

## :milky_way: Mixed Layers > :point_right: Buildings Tokyo, Bridges, textured :heavy_check_mark:

[Demo Link](https://www.3dcitydb.net/3dcitydb-web-map/2.0.0-dev/3dwebclient/index.html?d=2021-04-20T20%3A17%3A07Z&t=3DCityDB-Web-Map-Client&s=false&ts=0&la=35.675426&lo=139.765468&h=241.186&hd=9.53&p=-26.24&r=0.03&l_0=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252Ftokyo%252Fbldg%252Fbldg-bldg-solar_collada_MasterJSON.json%26n%3DTokio_Buildings%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dtrue%26tdu%3Dhttps%253A%252F%252Fbsvr.gis.lrg.tum.de%252Fpostgrest%252Ftokyo_en%26ds%3DPostgreSQL%26tt%3DVertical%26gc%3D%26il%3D50%26al%3D1.7976931348623157e%252B308%26ac%3D200%26av%3D200&l_1=u%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252Ftokyo%252Fbridges%252Fbridges_collada_MasterJSON.json%26n%3DTokio_Bridges%26ld%3DCOLLADA%252FKML%252FglTF%26lp%3Dfalse%26lc%3Dfalse%26gv%3D2.0%26a%3Dtrue%26tdu%3D%26ds%3DGoogleSheets%26tt%3DHorizontal%26gc%3D%26il%3D50%26al%3D1.7976931348623157e%252B308%26ac%3D200%26av%3D200&tr=name%3DDGM%26iconUrl%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252Fdgm.png%26tooltip%3D%26url%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fpublic%252F3dwebclientprojects%252Ftokyo%252Fterrain&sw=)

**General information**:

+ [x] Display layer information in toolbox
+ [x] Responsive display/switch of layer information

**3D layer handling**:

+ [x] Activate layers
+ [x] Deactivate layers
+ [x] Remove layers
+ [x] Reinsert layers

**Highlighting and hiding**:

+ [x] Highlight single and multiple objects
+ [x] List highlighted objects
+ [x] Select and fly to a highlighted object
+ [x] Hide single and multiple objects
+ [x] List hidden objects
+ [x] Select and fly to a hidden object
+ [x] Show all hidden objects
+ [x] Clear highlighting

**Thematic data**:

+ [x] Info table for a clicked object

**Screenshot and print**:

+ [x] Create screenshot
+ [x] Print current view

**Enabling and disabling shadows**:

+ [x] Enable shadows
+ [x] Enable shadows first, then enable terrain shadows
+ [x] Enable terrain shadows without enabling shadows
+ [x] Disable terrain shadows
+ [x] Disable terrain shadows first, then disable shadows
+ [x] Disable shadows without disabling terrain shadows

**Display in external maps**:

+ [x] Open in Google StreetView
+ [x] Open in OpenStreetMap
+ [x] Open in BingMaps ObliqueView
+ [x] Open in DualMaps
