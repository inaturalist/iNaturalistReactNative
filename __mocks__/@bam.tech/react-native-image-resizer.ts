import mockNodePath from "path";

export const MOCK_RESIZER_CACHE_PATH = "/mock/cache";

export default ( {
  createResizedImage: jest.fn(
    async (
      path,
      _maxWidth,
      _maxHeight,
      _compressFormat,
      _quality,
      _rotation,
      outputPath,
    ) => {
      const filename = mockNodePath.basename( path );
      return { uri: mockNodePath.join( outputPath || MOCK_RESIZER_CACHE_PATH, filename ) };
    },
  ),
} );
