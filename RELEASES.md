# Release Announcements

### 2.0.0 - Released [[Demo Link]](https://www.3dcitydb.org/3dcitydb-web-map/2.0.0/3dwebclient/index.html)

This is a major release.

##### New Features

* It is now possible to add **Index 3D Scene (i3s)** and **GeoJSON** layers,
  in addition to the existing layer types **KML/COLLADA/glTF** and **Cesium 3D Tiles**.

* Existing **thematic data embedded** within the 3D layers themselves can now also be extracted and displayed,
  in addition to the already available options to include
  external thematic data using **PostgreSQL/PostgREST** and **Google Spreadsheets**.
  These layers include Index 3D Scene (i3s), KML, Cesium 3D Tiles, and GeoJSON.

  **Note**: Due to the inconsistent **labelling of object identifiers** in Cesium 3D Tiles from various providers,
  the following approach was used for querying:
    * Different identifier names are considered, such as `gml:id`, `gml_id`, `gmlid`, `gml-id`, `id`, etc.,
      regardless whether the letters are given in uppercase or lowercase.
    * The same also applies to the column name of the identifiers in PostgreSQL/PostgREST and Google Spreadsheets,
      as long as the column names are valid.

* In addition to embedded and PostgreSQL/PostgREST and Google Spreadsheets,
  **OGC Feature API** is now also supported as another thematic data source.

  **Note**: Due to the different implementation of the API across regions and countries,
  the current version provides example handling of the OGC Feature API provided
  by the German states of Hamburg and North Rhine-Westphalia.

* **Web Map Tile Service (WMTS)** can now be used as another imagery or base map layer,
  in addition to the existing **Web Map Service (WMS)**.

##### Improvements

* The **Graphical User Interface (GUI)** for adding and configuring layers in the toolbox have been rearranged
  to provide more clarity and consistency. The input elements are now grouped into two groups based on their purposes:
  **layer information** and **thematic data**, as shown below:

  <img src="theme/img/gui_add_layer.png" style="display:block;float:none;margin-left:auto;margin-right:auto;">

* **Mobile support for geolocation** has been completely reworked to adhere to modern security rules on personal
  devices, especially for **iOS 13+**. The button icons and their functions are explained as follows:

  <div style="display: flex; justify-content: center; align-items: center; gap: 5px;">
    <img src="3dwebclient/images/GPS_main.png" style="width:70px">
    <img src="3dwebclient/images/GPS_single.png" style="width:70px">
    <img src="3dwebclient/images/GPS_on_ori.png" style="width:70px">
    <img src="3dwebclient/images/GPS_on_pos_ori.png" style="width:70px">
    <img src="3dwebclient/images/GPS_off.png" style="width:70px">
  </div>

  **From left to right**:
  Default button, "snapshot" location and orientation,
  live tracking of orientation (with fixed location), live tracking of orientation and position,
  and button for disabling geolocation.

* The **highlighting and hiding functions** have been reworked, so that objects from across different layer types
  can be displayed correctly and consistently together.

* **Cesium 3D Tiles** can now be navigated together with **Google Street View**, **Dual Map View**, etc.

##### Change Logs

For a complete list of all changes made for this release, please refer to the [change logs](CHANGES.md).
