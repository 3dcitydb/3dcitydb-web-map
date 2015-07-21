/**
 * 
 */
(function() {
	var dataPool = new Object();
	var shouldRun = false;
	var stack = [];
	var isStillUpdating = true;

	var eventlisteners = {
			
		initWorker : function(initDataPool) {
			dataPool = initDataPool;
			shouldRun = true;
			eventlisteners["checkDataPool"].apply(self);
		},

		checkDataPool : function() {
			if (shouldRun == false) {
				return;
			}
			if (Object.keys(dataPool).length == 0) {
				reply("refreshView", false);
			}
			for (objectId in dataPool) {
				reply("checkMasterPool", objectId, dataPool[objectId]);
				stack.push(objectId);
			}
		},

		updateDataPool : function() {
			isStillUpdating = true;
		},

		notifySleep : function() {
			shouldRun = false;
		},

		notifyWake : function() {
			shouldRun = true;
			eventlisteners["checkDataPool"].apply(self);
		},
		
		abortAndnotifyWake : function() {
			stack = [];
			eventlisteners["notifyWake"].apply(self);
		},

		addData : function(objectId) {
			dataPool[objectId] = true;
		},

		removeData : function(objectId) {
			delete dataPool[objectId];
		},

		rebuildDataPool : function(newDataPool) {
			dataPool = newDataPool;
			shouldRun = true;
			eventlisteners["checkDataPool"].apply(self);
		},

		clearDataPool : function() {
			dataPool = new Object();
		},

		updateTaskStack : function() {
			stack.pop();
			if (stack.length == 0) {
				reply("refreshView", isStillUpdating, dataPool);
				isStillUpdating = false;
			}
		}
	};

	// system functions	
	function defaultListener(vMsg) {
		// your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
		// do something
	}

	function reply(/* listener name, argument to pass 1, argument to pass 2, etc. etc */) {
		if (arguments.length < 1) {
			throw new TypeError("reply - not enough arguments");
			return;
		}
		postMessage({
			"vo42t30" : arguments[0],
			"rnb93qh" : Array.prototype.slice.call(arguments, 1)
		});
	}

	self.onmessage = function(oEvent) {
		if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty("bk4e1h0") && oEvent.data.hasOwnProperty("ktp3fm1")) {
			eventlisteners[oEvent.data.bk4e1h0].apply(self, oEvent.data.ktp3fm1);
		} else {
			defaultListener(oEvent.data);
		}
	};
})()
	