/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2016
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
/***
 * Webworker API
 * inspired by https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
 **/
(function() {
	
	function CitydbWebworker(sURL){	
		this.oWorker = new Worker(sURL);
		this.oListeners = {};       
        this._isSleep = false;
        this.initialWorker();
	}
	
	CitydbWebworker.prototype.initialWorker = function() {
    	var oInstance = this; 
    	this.oWorker.onmessage = function (oEvent) {
        	if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty("vo42t30") && oEvent.data.hasOwnProperty("rnb93qh")) {
        		oInstance.oListeners[oEvent.data.vo42t30].apply(oInstance, oEvent.data.rnb93qh);
            } 
            else {
                this.defaultListener.call(oInstance, oEvent.data);
            }
        }; 
    };
    
    CitydbWebworker.prototype.defaultListener = function () {
    	// do nothing...
    };
    
    CitydbWebworker.prototype.triggerEvent = function() {
    	if (arguments.length < 1) { throw new TypeError("not enough arguments"); return; }
        this.oWorker.postMessage({ "bk4e1h0": arguments[0], "ktp3fm1": Array.prototype.slice.call(arguments, 1) });         
    };
    
    CitydbWebworker.prototype.postMessage = function(vMsg) {
    	Worker.prototype.postMessage.call(this.oWorker, vMsg);         
    };
    
    CitydbWebworker.prototype.terminate = function() {
    	Worker.prototype.terminate.call(this.oWorker);         
    };
    
    CitydbWebworker.prototype.addListener = function(sName, fListener) {
    	this.oListeners[sName] = fListener;         
    };
    
    CitydbWebworker.prototype.removeListener = function(sName) {
    	delete this.oListeners[sName];         
    };
    
    CitydbWebworker.prototype.sleep = function() {
    	this._isSleep = true;
    };
    
    CitydbWebworker.prototype.wake = function() {
    	this._isSleep = false;
    };
    
    CitydbWebworker.prototype.isSleep = function() {
    	return this._isSleep;
    };
	
    window.CitydbWebworker = CitydbWebworker;
})()