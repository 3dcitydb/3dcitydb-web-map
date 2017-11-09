/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2017
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.gis.bgu.tum.de/
 * 
 * The 3DCityDB-Web-Map is jointly developed with the following
 * cooperation partners:
 * 
 * virtualcitySYSTEMS GmbH, Berlin <http://www.virtualcitysystems.de/>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
	},
	
	get_suffix_from_filename: function (name) {
	    if (name.lastIndexOf(".")==-1){
	  		return name;
	  	}else{
	    	return name.substring(name.lastIndexOf(".") + 1, name.length);
	    };
	},
	/**
	 * Show a confirmation dialog with Title, messages, and YES&NO buttons.
	 * The code is mainly based on and inspired by the code of the Cesium class "CesiumWidget"
	 * 
	 */
	showAlertWindow: function (mode, title, message, yesBtnCallback, noBtnCallback) {		
		var element = cesiumViewer.cesiumWidget._element;
        var overlay = document.createElement('div');
        overlay.className = 'cesium-widget-errorPanel';

        var content = document.createElement('div');
        content.className = 'cesium-widget-errorPanel-content';
        overlay.appendChild(content);

        var errorHeader = document.createElement('div');
        errorHeader.className = 'cesium-widget-errorPanel-header';
        errorHeader.appendChild(document.createTextNode(title));
        content.appendChild(errorHeader);

        var errorPanelScroller = document.createElement('div');
        errorPanelScroller.className = 'cesium-widget-errorPanel-scroll';
        content.appendChild(errorPanelScroller);
        function resizeCallback() {
        	errorPanelScroller.style.maxHeight = Math.max(Math.round(element.clientHeight * 0.9 - 100), 30) + 'px';
        }
        resizeCallback();
        if (Cesium.defined(window.addEventListener)) {
            window.addEventListener('resize', resizeCallback, false);
        }

        if (Cesium.defined(message)) {
            var errorMessage = document.createElement('div');
            errorMessage.className = 'cesium-widget-errorPanel-message';
            errorMessage.innerHTML = '<p>' + message + '</p>';
            errorPanelScroller.appendChild(errorMessage);
        }

        var buttonPanel = document.createElement('div');
        buttonPanel.className = 'cesium-widget-errorPanel-buttonPanel';
        content.appendChild(buttonPanel);

        if (mode == "YESNO") {
        	var yesButton = document.createElement('button');
            yesButton.setAttribute('type', 'button');
            yesButton.className = 'cesium-button';
            yesButton.appendChild(document.createTextNode('Yes'));
            yesButton.onclick = function() {
                if (Cesium.defined(resizeCallback) && Cesium.defined(window.removeEventListener)) {
                    window.removeEventListener('resize', resizeCallback, false);
                }
                element.removeChild(overlay);
                if (Cesium.defined(yesBtnCallback)) {
                	yesBtnCallback.call(this);
                }  
            };

            var noButton = document.createElement('button');
            noButton.setAttribute('type', 'button');
            noButton.className = 'cesium-button';
            noButton.appendChild(document.createTextNode('No'));
            noButton.onclick = function() {
                if (Cesium.defined(resizeCallback) && Cesium.defined(window.removeEventListener)) {
                    window.removeEventListener('resize', resizeCallback, false);
                }
                element.removeChild(overlay);
                if (Cesium.defined(noBtnCallback)) {
                	noBtnCallback.call(this);
                }                
            };
            
            buttonPanel.appendChild(yesButton);
            buttonPanel.appendChild(noButton);
        }
        else if (mode == "OK") {
        	var okButton = document.createElement('button');
        	okButton.setAttribute('type', 'button');
        	okButton.className = 'cesium-button';
        	okButton.appendChild(document.createTextNode('OK'));
        	okButton.onclick = function() {
                if (Cesium.defined(resizeCallback) && Cesium.defined(window.removeEventListener)) {
                    window.removeEventListener('resize', resizeCallback, false);
                }
                element.removeChild(overlay);
                if (Cesium.defined(yesBtnCallback)) {
                	yesBtnCallback.call(this);
                }  
            };
            buttonPanel.appendChild(okButton);
        }
        
        element.appendChild(overlay);
        
        var showErrorPaneElement = document.getElementsByClassName('cesium-widget-errorPanel-content')[0];
  		showErrorPaneElement.style.width = '400px'; 
	}
}; 

