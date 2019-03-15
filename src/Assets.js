import fs from 'fs';
import path from 'path';
import Utils from './utils';
import Tilesheet from "./Tilesheet";

/**
 * Centralized object where map and tilesheet assets are stored.
 * @constructor
 * @param {string} - The full complete path to the assets directory
 */
export default class Assets {
    constructor(assetsDir) {
        this.dirs = {
            maps: path.join(assetsDir, '/maps'),
            tilesheets: {
                img: path.join(assetsDir, '/tilesheets/img'),
                json: path.join(assetsDir, '/tilesheets/json')
            }
        };
        this.maps = {};
        this.tilesheets = {};
    }

    /**
     * Loads map and tilesheet files in one function
     */
    load() {
        this.loadMaps();
        this.loadTilesheets();
    }

    /**
     * Loads all map files in one function
     */
    loadMaps() {
        fs.readdirSync(this.dirs.maps).forEach(fileName => {
            let p = path.join(this.dirs.maps, fileName);
            this.maps[fileName] = Assets.map(p);
        });
    }

    /**
     * Read a map
     * @static
     * @param {string} mapPath - The full path to the map file
     * @returns {object} - Parsed JS object from the map JSON
     */
    static map(mapPath) {
        let buf = fs.readFileSync(mapPath);
        return JSON.parse(
            buf.toString('utf-8')
        );
    }

    /**
     * Loads all tilesheet files in one function.
     */
    loadTilesheets() {
        fs.readdirSync(this.dirs.tilesheets.img).forEach(fileName => {
            let base = Utils.truncateFileExtension(fileName);
            let pathImg = path.join(this.dirs.tilesheets.img, fileName);
            let pathJSON = path.join(this.dirs.tilesheets.json, base+'.json');
            this.tilesheets[base] = new Tilesheet(
                Assets.tilesheet(pathImg),
                Assets.tilesheetData(pathJSON)
            );
        });
    }

    /**
     * Reads tilesheet image data and returns base64 encoded image
     * @static
     * @param {string} tilesheetPath - The full path to the tilesheet image
     * @returns {string} - The base64 encoded image
     */
    static tilesheet(tilesheetPath) {
        let buf = fs.readFileSync(tilesheetPath);
        return buf.toString('base64');
    }

    /**
     * Parses tilesheet JSON data and returns a JS object
     * @static
     * @param {string} tilesheetDataPath - The full path to the tilesheet JSON file
     * @returns {object} - The parsed JSON file
     */
    static tilesheetData(tilesheetDataPath) {
        let buf = fs.readFileSync(tilesheetDataPath);
        return JSON.parse(
            buf.toString('utf-8')
        );
    }
}