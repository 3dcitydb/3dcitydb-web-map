/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.117
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  EllipseOutlineGeometry_default
} from "./chunk-4AJGCQFX.js";
import "./chunk-GIFJ77E4.js";
import "./chunk-S4XDCPKD.js";
import "./chunk-WWP3I7R5.js";
import "./chunk-RL73GOEF.js";
import "./chunk-34DGOKCO.js";
import "./chunk-NI2R52QD.js";
import "./chunk-I5TDPPC4.js";
import "./chunk-TMMOULW3.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-C5CE4OG6.js";
import "./chunk-4PHPQRSH.js";
import "./chunk-PEABJLCK.js";
import "./chunk-WFICTTOE.js";
import "./chunk-UCPPWV64.js";
import "./chunk-U4IMCOF5.js";
import {
  defined_default
} from "./chunk-BDUJXBVF.js";

// packages/engine/Source/Workers/createEllipseOutlineGeometry.js
function createEllipseOutlineGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseOutlineGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseOutlineGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseOutlineGeometry_default = createEllipseOutlineGeometry;
export {
  createEllipseOutlineGeometry_default as default
};
