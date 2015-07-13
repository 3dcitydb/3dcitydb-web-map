
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