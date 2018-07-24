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

/**
 * Web Worker for controlling Appearance of objects created by the dynamically loaded KML/KMZ data tiles
 */
(function () {
    var dataPool = new Object();
    var shouldRun = false;
    var stack = [];
    var isStillUpdating = true;

    var eventlisteners = {

        initWorker: function (initDataPool) {
            dataPool = initDataPool;
            shouldRun = true;
            eventlisteners["checkDataPool"].apply(self);
        },

        checkDataPool: function () {
            if (shouldRun == false) {
                return;
            }
            if (Object.keys(dataPool).length == 0) {
                reply("refreshView", false);
            }
            for (var objectId in dataPool) {
                reply("checkMasterPool", objectId, dataPool[objectId]);
                stack.push(objectId);
            }
        },

        updateDataPool: function () {
            isStillUpdating = true;
        },

        notifySleep: function () {
            shouldRun = false;
        },

        notifyWake: function () {
            shouldRun = true;
            eventlisteners["checkDataPool"].apply(self);
        },

        abortAndnotifyWake: function () {
            stack = [];
            eventlisteners["notifyWake"].apply(self);
        },

        addData: function (objectId) {
            dataPool[objectId] = true;
        },

        removeData: function (objectId) {
            delete dataPool[objectId];
        },

        rebuildDataPool: function (newDataPool) {
            dataPool = newDataPool;
            shouldRun = true;
            eventlisteners["checkDataPool"].apply(self);
        },

        clearDataPool: function () {
            dataPool = new Object();
        },

        updateTaskStack: function () {
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
            "vo42t30": arguments[0],
            "rnb93qh": Array.prototype.slice.call(arguments, 1)
        });
    }

    self.onmessage = function (oEvent) {
        if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty("bk4e1h0") && oEvent.data.hasOwnProperty("ktp3fm1")) {
            eventlisteners[oEvent.data.bk4e1h0].apply(self, oEvent.data.ktp3fm1);
        } else {
            defaultListener(oEvent.data);
        }
    };
})()
	