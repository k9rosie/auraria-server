const Utils = {
    truncateFileExtension: (fileName) => {
        return fileName.replace(/\.[^/.]+$/, "");
    }
};

export default Utils;