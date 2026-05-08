import { DocumentDirectoryPath } from "@dr.pogodin/react-native-fs";

export const computerVisionPath = `${DocumentDirectoryPath}/computerVisionSuggestions`;

// note: when changing naming from gallery to photoLibrary in issue MOB-431,
// this galleryPhotos path was intentionally left as-is, to avoid any issues
// with cleaning caches
export const photoLibraryPhotosPath = `${DocumentDirectoryPath}/galleryPhotos`;

export const photoUploadPath = `${DocumentDirectoryPath}/photoUploads`;

export const rotatedOriginalPhotosPath = `${DocumentDirectoryPath}/rotatedOriginalPhotos`;

export const sentinelFilePath = `${DocumentDirectoryPath}/sentinelFiles`;

export const soundUploadPath = `${DocumentDirectoryPath}/soundUploads`;

export const rollbackPhotosPath = `${DocumentDirectoryPath}/rollbackPhotos`;
