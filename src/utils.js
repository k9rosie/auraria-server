export const truncateFileExtension = (fileName) => {
    return fileName.replace(/\.[^/.]+$/, "");
};