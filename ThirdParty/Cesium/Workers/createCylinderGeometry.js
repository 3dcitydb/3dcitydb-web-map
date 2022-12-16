define(['./CylinderGeometry-f9503c6d', './defaultValue-0a909f67', './Transforms-2f755df8', './Matrix3-4f4df527', './Check-666ab1a0', './Math-2dbd6b93', './Matrix2-ce637455', './RuntimeError-06c93819', './combine-ca22a614', './ComponentDatatype-f7b11d02', './WebGLConstants-a8cc3e8c', './CylinderGeometryLibrary-372c07d8', './GeometryAttribute-df5f473e', './GeometryAttributes-f06a2792', './GeometryOffsetAttribute-04332ce7', './IndexDatatype-a55ceaa1', './VertexFormat-6b480673'], (function (CylinderGeometry, defaultValue, Transforms, Matrix3, Check, Math, Matrix2, RuntimeError, combine, ComponentDatatype, WebGLConstants, CylinderGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryOffsetAttribute, IndexDatatype, VertexFormat) { 'use strict';

  function createCylinderGeometry(cylinderGeometry, offset) {
    if (defaultValue.defined(offset)) {
      cylinderGeometry = CylinderGeometry.CylinderGeometry.unpack(cylinderGeometry, offset);
    }
    return CylinderGeometry.CylinderGeometry.createGeometry(cylinderGeometry);
  }

  return createCylinderGeometry;

}));
