define(['./defaultValue-0a909f67', './EllipsoidOutlineGeometry-d6d2ceec', './Transforms-2f755df8', './Matrix3-4f4df527', './Check-666ab1a0', './Math-2dbd6b93', './Matrix2-ce637455', './RuntimeError-06c93819', './combine-ca22a614', './ComponentDatatype-f7b11d02', './WebGLConstants-a8cc3e8c', './GeometryAttribute-df5f473e', './GeometryAttributes-f06a2792', './GeometryOffsetAttribute-04332ce7', './IndexDatatype-a55ceaa1'], (function (defaultValue, EllipsoidOutlineGeometry, Transforms, Matrix3, Check, Math, Matrix2, RuntimeError, combine, ComponentDatatype, WebGLConstants, GeometryAttribute, GeometryAttributes, GeometryOffsetAttribute, IndexDatatype) { 'use strict';

  function createEllipsoidOutlineGeometry(ellipsoidGeometry, offset) {
    if (defaultValue.defined(ellipsoidGeometry.buffer)) {
      ellipsoidGeometry = EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.unpack(
        ellipsoidGeometry,
        offset
      );
    }
    return EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.createGeometry(ellipsoidGeometry);
  }

  return createEllipsoidOutlineGeometry;

}));
