define(['./Matrix3-4f4df527', './defaultValue-0a909f67', './EllipseGeometry-fedf72d5', './Check-666ab1a0', './Math-2dbd6b93', './Transforms-2f755df8', './Matrix2-ce637455', './RuntimeError-06c93819', './combine-ca22a614', './ComponentDatatype-f7b11d02', './WebGLConstants-a8cc3e8c', './EllipseGeometryLibrary-4ea68687', './GeometryAttribute-df5f473e', './GeometryAttributes-f06a2792', './GeometryInstance-aa75b4cf', './GeometryOffsetAttribute-04332ce7', './GeometryPipeline-f0e46c42', './AttributeCompression-4589338a', './EncodedCartesian3-f473ea18', './IndexDatatype-a55ceaa1', './IntersectionTests-9de29d51', './Plane-b81241c2', './VertexFormat-6b480673'], (function (Matrix3, defaultValue, EllipseGeometry, Check, Math, Transforms, Matrix2, RuntimeError, combine, ComponentDatatype, WebGLConstants, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryOffsetAttribute, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, VertexFormat) { 'use strict';

  function createEllipseGeometry(ellipseGeometry, offset) {
    if (defaultValue.defined(offset)) {
      ellipseGeometry = EllipseGeometry.EllipseGeometry.unpack(ellipseGeometry, offset);
    }
    ellipseGeometry._center = Matrix3.Cartesian3.clone(ellipseGeometry._center);
    ellipseGeometry._ellipsoid = Matrix3.Ellipsoid.clone(ellipseGeometry._ellipsoid);
    return EllipseGeometry.EllipseGeometry.createGeometry(ellipseGeometry);
  }

  return createEllipseGeometry;

}));
