import RNFS from "react-native-fs";

export const computerVisionPath = `${RNFS.DocumentDirectoryPath}/computerVisionSuggestions`;

// note: when changing naming from gallery to photoLibrary in issue MOB-431,
// this galleryPhotos path was intentionally left as-is, to avoid any issues
// with cleaning caches
export const photoLibraryPhotosPath = `${RNFS.DocumentDirectoryPath}/galleryPhotos`;

export const photoUploadPath = `${RNFS.DocumentDirectoryPath}/photoUploads`;

export const rotatedOriginalPhotosPath = `${RNFS.DocumentDirectoryPath}/rotatedOriginalPhotos`;

export const sentinelFilePath = `${RNFS.DocumentDirectoryPath}/sentinelFiles`;

export const soundUploadPath = `${RNFS.DocumentDirectoryPath}/soundUploads`;
