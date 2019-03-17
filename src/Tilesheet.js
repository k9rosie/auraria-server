import pako from 'pako';

/**
 * Represents a tilesheet. Includes image data in uncompressed base64 and the JSON data associated with it
 * @constructor
 * @param {string} img - The image data encoded in base64
 * @param {object} data - The tilesheet data
 */
export default class Tilesheet {
    constructor(name, img, data) {
        this.name = name;
        this.img = img; // image data in uncompressed base64 format
        this.data = data;
    }

    /**
     * Serializes this object into JSON then compresses it with pako (zlib)
     * and returns the base64 encoded string.
     * @returns {string} - Returns compressed JSON encoded in base64
     */
    package() {
        let serialized = JSON.stringify(this);
        let compressed = pako.deflate(serialized, {to: 'string'});
        return Buffer.from(compressed).toString('base64');
    }
}