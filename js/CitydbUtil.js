var CitydbUtil = {
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
	
	retrieveURL : function(filename) {
	    var scripts = document.getElementsByTagName('script');
	    if (scripts && scripts.length > 0) {
	        for (var i in scripts) {
	            if (scripts[i].src && scripts[i].src.match(new RegExp(filename+'\\.js$'))) {
	                return scripts[i].src.replace(new RegExp('(.*)'+filename+'\\.js$'), '$1');
	            }
	        }
	    }
	},
	
	polygonArea: function(polygon) {	
		var area = 0;         // Accumulates area in the loop
		var j = polygon.length - 1;  // The last vertex is the 'previous' one to the first
		for (var i=0; i<polygon.length; i++){
			area = area +  (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y); 
	        j = i;  //j is previous vertex to i
	    }			    
		return area/2;
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
	
	get_host_and_path_from_URL: function(url) {
	    if (url.lastIndexOf("/")==(url.length-1) || url.lastIndexOf("/")==-1) {
	        return null;
        }else {
            return url.substring(0, url.lastIndexOf("/")+1);
        };
	}
}; 

