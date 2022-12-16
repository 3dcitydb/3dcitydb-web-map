define(['./PrimitivePipeline-a9b7aae0', './createTaskProcessorWorker', './Transforms-2f755df8', './Matrix3-4f4df527', './Check-666ab1a0', './defaultValue-0a909f67', './Math-2dbd6b93', './Matrix2-ce637455', './RuntimeError-06c93819', './combine-ca22a614', './ComponentDatatype-f7b11d02', './WebGLConstants-a8cc3e8c', './GeometryAttribute-df5f473e', './GeometryAttributes-f06a2792', './GeometryPipeline-f0e46c42', './AttributeCompression-4589338a', './EncodedCartesian3-f473ea18', './IndexDatatype-a55ceaa1', './IntersectionTests-9de29d51', './Plane-b81241c2', './WebMercatorProjection-9f25de49'], (function (PrimitivePipeline, createTaskProcessorWorker, Transforms, Matrix3, Check, defaultValue, Math, Matrix2, RuntimeError, combine, ComponentDatatype, WebGLConstants, GeometryAttribute, GeometryAttributes, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, WebMercatorProjection) { 'use strict';

  function combineGeometry(packedParameters, transferableObjects) {
    const parameters = PrimitivePipeline.PrimitivePipeline.unpackCombineGeometryParameters(
      packedParameters
    );
    const results = PrimitivePipeline.PrimitivePipeline.combineGeometry(parameters);
    return PrimitivePipeline.PrimitivePipeline.packCombineGeometryResults(
      results,
      transferableObjects
    );
  }
  var combineGeometry$1 = createTaskProcessorWorker(combineGeometry);

  return combineGeometry$1;

}));
