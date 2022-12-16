define(['./defaultValue-0a909f67', './FrustumGeometry-3bf2e4eb', './Transforms-2f755df8', './Matrix3-4f4df527', './Check-666ab1a0', './Math-2dbd6b93', './Matrix2-ce637455', './RuntimeError-06c93819', './combine-ca22a614', './ComponentDatatype-f7b11d02', './WebGLConstants-a8cc3e8c', './GeometryAttribute-df5f473e', './GeometryAttributes-f06a2792', './Plane-b81241c2', './VertexFormat-6b480673'], (function (defaultValue, FrustumGeometry, Transforms, Matrix3, Check, Math, Matrix2, RuntimeError, combine, ComponentDatatype, WebGLConstants, GeometryAttribute, GeometryAttributes, Plane, VertexFormat) { 'use strict';

  function createFrustumGeometry(frustumGeometry, offset) {
    if (defaultValue.defined(offset)) {
      frustumGeometry = FrustumGeometry.FrustumGeometry.unpack(frustumGeometry, offset);
    }
    return FrustumGeometry.FrustumGeometry.createGeometry(frustumGeometry);
  }

  return createFrustumGeometry;

}));
