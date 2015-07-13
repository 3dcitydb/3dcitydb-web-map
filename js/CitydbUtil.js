
	var Util = { 
		generateUUID: function() {
		    var d = new Date().getTime();
		    var uuid = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		        var r = (d + Math.random()*16)%16 | 0;
		        d = Math.floor(d/16);
		        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		    });
		    uuid = "UUID_" + uuid;
		    return uuid;
		},
		getTimeStamp: function() {
		    var now = new Date();
		    var timeStamp = now.getFullYear() +  "-" + (now.getMonth() + 1) + "-" + (now.getDate())+ " " +
			             now.getHours() + ':' +
			             ((now.getMinutes() < 10)
			                 ? ("0" + now.getMinutes())
			                 : (now.getMinutes())) + ':' +
			             ((now.getSeconds() < 10)
			                 ? ("0" + now.getSeconds())
			                 : (now.getSeconds()));
		    return timeStamp;
		},
		parse_query_string: function(key,url) {
		    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		    var regexS = "[\\?&#']"+key+"=([^&#]*)";
		    var regex = new RegExp( regexS );
		    var results = regex.exec(url);
		    if(results == null){
		    	return "";
		    }else{
		    	return results[1];
		    };
		},
		check_for_URL: function (url) {
	        var v = new RegExp();
	        v.compile("^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");
	        if (!v.test(url)){
	            return false;
	        }else{ 
	        	return true;
	        };
		},
		get_host_and_path_from_URL: function(url) {
		    if (url.lastIndexOf("/")==(url.length-1) || url.lastIndexOf("/")==-1) {
		        return null;
	        }else {
	            return url.substring(0, url.lastIndexOf("/")+1);
	        };
		},
		get_host_from_URL: function(url) {
		    if (url.indexOf("/",10)==(url.length-1) || url.indexOf("/",10)==-1) {
		        return null;
	        }else {
	            return url.substring(0, url.indexOf("/",10)+1);
	        };
		},

		get_host_and_file_wo_suffix_from_URL: function(url) {
		    if (url.lastIndexOf(".")==(url.length-1) || url.lastIndexOf(".")==-1) {
		        return null;
	        }else {
	            return url.substring(0, url.lastIndexOf(".")+1);
	        };
		},
		strip_suffix_from_filename: function (name) {
		    if (name.lastIndexOf(".")==-1){
		  		return name;
		  	}else{
		    	return name.substring(0,name.lastIndexOf("."));
		    };
		},
		get_filename_wo_path_from_URL: function(url) {
		    if (url.lastIndexOf("/")==(url.length-1)) {
		  		return '';
		    }else {
				return url.substring(url.lastIndexOf("/")+1);
		    };
		},		
		get_queryRequest_from_spreadsheet_url: function (sheetUrl) {
        	var gid = Util.parse_query_string('gid', sheetUrl);	
        	var ssKey = "";
        	var queryRequest = "";
        	if (sheetUrl.split("/")[4] == "d") { // new spreadsheet
        		ssKey = sheetUrl.split("/")[5];
        		queryRequest = 'https://docs.google.com/spreadsheets/d/' + ssKey + '/gviz/tq?gid=' + gid;			        		
        	}
        	else { // old spreadsheet
        		ssKey = Util.parse_query_string('key', sheetUrl);	
        		queryRequest = 'http://spreadsheets.google.com/tq?gid=' + gid + '&key=' + ssKey;
        	}
        	return queryRequest;
		},
		get_ssKey_from_spreadsheet_url: function(sheetUrl) {
			var ssKey = "";
        	if (sheetUrl.split("/")[4] == "d") { // new spreadsheet
        		ssKey = sheetUrl.split("/")[5];	        		
        	}
        	else { // old spreadsheet
        		ssKey = Util.parse_query_string('key', sheetUrl);	
        	}
        	return ssKey;
		},
		get_prefix_By_DisplayForm_for_Highliting: function (displayForm) {
			var prefix = null;
			switch (displayForm) {
			case 'footprint':
				prefix = 'KMLFootp_';
				break;
			case 'extruded':
				prefix = 'KMLExtr_';
				break;
			case 'geometry':
				prefix = 'KMLGeomHi_';
				break;
			case 'collada':
				prefix = 'KMLGeomHi_';
				break;
			default:
				break;
			}
			return prefix;
		},
		
	    flytoKmlObject_by_ID: function(ID) {	       
        	var currentKmlJSONObjects = layerTreeComponent.getActivatedLayer().kmlJSONObjects;
        	if (currentKmlJSONObjects != null) {
        		var obj = currentKmlJSONObjects[ID];
    	        if (obj) {
    	            // the entered string is a known GMLID; let's fly
    	            // to the center point of the corresponding feature
    	            var lon = (obj.envelope[0] + obj.envelope[2])/2.0;
    	            var lat = (obj.envelope[1] + obj.envelope[3])/2.0;
    	            Util.flytoLatLon(lat, lon);
    	            return true;
    	        }
			}
        	return false;
	    },
	    flytoLatLon: function(lat,lon) {
			var range = 80;   // viewing distance to the object
			var heading = 0;  // look north
			var tilt = 49;    // oblique view
			var altitude = 0; // look down to the ground level
			virtualGlobeController.setCameraPosition(lat, lon, altitude, heading, tilt, range);
		},
		isCheckRecord: function(label, grid) {
			var result = false;
			var allRecords = grid.getSelectionModel().getSelections();
			for (var i = 0; i < allRecords.length; i++){
				if(allRecords[i].data.name == label){
					result = true;
				};
			}		
			return result;
		},
		show_In_External_Map: function(mapName, lat, lon) {
			var mapLink = "";
			switch(mapName)
			{
			case 'google':			
			    mapLink = 'https://maps.google.com/maps?cbp=1,479.7175735027765,,0,-3.50219513621329&cbll=' + lat + ',' + lon + '&panoid=dmZf3jLw1OS-1bR58b03FA&gl=&hl=en&output=svembedmfe&layer=c';
			    Util.show_Webpage_In_ExtjsTab('Google Street View', mapLink);
			  break;
			case 'osm':
				mapLink = 'http://www.openstreetmap.org/export/embed.html?bbox=' + lon + '%2C' + lat + '%2C' + (lon+0.002) + '%2C' + (lat+0.002) + '&layer=mapnik';				
				Util.show_Webpage_In_ExtjsTab('Open Street Map', mapLink);
			  break;
			case 'bing':
				mapLink = 'http://dev.virtualearth.net/embeddedMap/v1/ajax/Birdseye?zoomLevel=20&center=' + lat + '_' + lon + '&pushpins=47.5_-122.5';		
				Util.show_Webpage_In_ExtjsTab('Bing Map', mapLink);
			  break;
			case 'dual':
				mapLink = 'http://data.mapchannels.com/dualmaps5/map.htm?lat=' + lat + '&lng=' + lon + '&z=16&gm=0&ve=4&gc=0&bz=0&bd=0&mw=1&sv=1&sva=1&svb=0&svp=0&svz=0&svm=2&svf=0&sve=1';
				Util.show_Webpage_In_ExtjsTab('Dual Map', mapLink);
			  break;			  		  
			default:
			  extAlert('Error', 'Can not open the map!');
			}			
		},
		show_Webpage_In_ExtjsTab: function(title, url) {
			var newPanel = new Ext.ux.iframePanel({
	            title: title,
	            closable: true,
	            src: url
	        });
			var tabPanel = viewportComponent.getCentralTabPanel();
			tabPanel.add(newPanel);
			tabPanel.activate(newPanel);
		},
		open_Website_by_Url: function(url) {
		//	window.open(url);
		},
		getWindowWidth: function() {
		    if (window.innerWidth) {	    	
		        return window.innerWidth;
		    } 
		    else if (document.body && document.body.offsetWidth) {
		    	return document.body.offsetWidth;
		    } 
		    else {
		    	return 0;
		    }
		},
		getWindowHeight: function() {
		    if (window.innerHeight) {
		    	return window.innerHeight;
		    } 
		    else if (document.body && document.body.offsetHeight) {
		    	return document.body.offsetHeight;
		    } 
		    else {
		    	return 0;
		    }
		},	
		gradientColor: function(startColor, endColor, step){
			startRGB = Util.hexToRgb(startColor);
	        startR = startRGB.r;
	        startG = startRGB.g;
	        startB = startRGB.b;	 
	        endRGB = Util.hexToRgb(endColor);
	        endR = endRGB.r;
	        endG = endRGB.g;
	        endB = endRGB.b;	 
	        sR = (endR - startR)/step;
	        sG = (endG - startG)/step;
	        sB = (endB - startB)/step;	
	        var colorArr = [];
	        for(var i = 0; i < step; i++){
	        	var kml = Util.rgbToKml(parseInt(sR*i+startR),parseInt(sG*i+startG),parseInt(sB*i+startB));
		        var hex = Util.rgbToHex(parseInt(sR*i+startR),parseInt(sG*i+startG),parseInt(sB*i+startB));
				var e = {"hexStyle": hex, "kmlStyle": kml};
		        colorArr.push(e);
		    }
		    return colorArr;	    		       
		},
		hexToRgb: function(hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		    return result ? {
		        r: parseInt(result[1], 16),
		        g: parseInt(result[2], 16),
		        b: parseInt(result[3], 16)
		    } : null;
		}, 
		componentToHex: function(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? "0" + hex : hex;
		},
		rgbToHex: function(r, g, b) {
		    return "#" + Util.componentToHex(r) + Util.componentToHex(g) + Util.componentToHex(b);
		},
		rgbToKml: function(r, g, b) {
		    return "#ff" + Util.componentToHex(b) + Util.componentToHex(g) + Util.componentToHex(r);
		},
		convert_formated_hex_to_bytes: function(hex_str) {
			  var count = 0,
			      hex_arr,
			      hex_data = [],
			      hex_len,
			      i;
			  
			  if (hex_str.trim() == "") return [];
			  
			  /// Check for invalid hex characters.
			  if (/[^0-9a-fA-F\s]/.test(hex_str)) {
			    return false;
			  }
			  
			  hex_arr = hex_str.split(/([0-9a-fA-F]+)/g);
			  hex_len = hex_arr.length;
			  
			  for (i = 0; i < hex_len; ++i) {
			    if (hex_arr[i].trim() == "") {
			      continue;
			    }
			    hex_data[count++] = parseInt(hex_arr[i], 16);
			  }
			  
			  return hex_data;
		},
		convert_formated_hex_to_string: function(s) {
			  var byte_arr = Util.convert_formated_hex_to_bytes(s);
			  var res = "";
			  for (var i = 0 ; i<byte_arr.length ; i+=2) {
			    res += String.fromCharCode(byte_arr[i] | (byte_arr[i+1]<<8));
			  }
			  return res;
		},
		convert_string_to_hex: function(s) {
			  var byte_arr = [];
			  for (var i = 0 ; i<s.length ; i++) {
			    var value = s.charCodeAt(i);
			    byte_arr.push(value & 255);
			    byte_arr.push((value>>8) & 255);
			  }
			  return Util.convert_to_formated_hex(byte_arr);
		},
		convert_to_formated_hex: function(byte_arr) {
			  var hex_str = "",
			      i,
			      len,
			      tmp_hex;
			  
			  if (!Util.is_array(byte_arr)) {
			    return false;
			  }
			  
			  len = byte_arr.length;
			  
			  for (i = 0; i < len; ++i) {
			    if (byte_arr[i] < 0) {
			      byte_arr[i] = byte_arr[i] + 256;
			    }
			    if (byte_arr[i] === undefined) {
			      alert("Boom " + i);
			      byte_arr[i] = 0;
			    }
			    tmp_hex = byte_arr[i].toString(16);
			    
			    // Add leading zero.
			    if (tmp_hex.length == 1) tmp_hex = "0" + tmp_hex;
			    
			    if ((i + 1) % 16 === 0) {
			      tmp_hex += "\n";
			    } else {
			      tmp_hex += " ";
			    }
			    
			    hex_str += tmp_hex;
			  }
			  
			  return hex_str.trim();
		},
		is_array: function(input) {
			  return typeof(input) === "object" && (input instanceof Array);
		},
		isUrl: function(text) {
			var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			var regexp2 = /mailto:([^\?]*)/;
			return regexp.test(text) || regexp2.test(text);
		},
		polygonArea: function(polygon) 
		{
			var area = 0;         // Accumulates area in the loop
			var j = polygon.length - 1;  // The last vertex is the 'previous' one to the first
			for (var i=0; i<polygon.length; i++){
				area = area +  (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y); 
		        j = i;  //j is previous vertex to i
		    }			    
			return area/2;
		}
	};	
	
