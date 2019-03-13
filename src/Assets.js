import fs from 'fs';
import path from 'path';
import {truncateFileExtension} from './utils';
import Tilesheet from "./Tilesheet";

export default class Assets {
    constructor(assetsDir) {
        this.dirs = {
            maps: path.join(assetsDir, '/maps'),
            tilesheets: {
                img: path.join(assetsDir, '/tilesheets/img'),
                json: fs.readdirSync(assetsDir + '/tilesheets/json')
            }
        };
        this.maps = {};
        this.tilesheets = {};
    }

    loadMaps() {
        fs.readdirSync(this.dirs.maps).forEach(fileName => {
            let path = path.join(this.dirs.maps, fileName);
            this.maps[fileName] = Assets.map(path);
        });
    }

    static map(mapPath) {
        let buf = fs.readFileSync(mapPath);
        return JSON.parse(
            buf.toString('utf-8')
        );
    }

    loadTilesheets() {
        fs.readdirSync(this.dirs.tilesheets.img).forEach(fileName => {
            let base = truncateFileExtension(fileName);
            let pathImg = path.join(this.dirs.tilesheets.img, fileName);
            let pathJSON = path.join(this.dirs.tilesheets.json, base+'.json');
            this.tilesheets[base] = new Tilesheet(
                Assets.tilesheet(pathImg),
                Assets.tilesheetData(pathJSON)
            );
        });
    }

    static tilesheet(tilesheetPath) {
        let buf = fs.readFileSync(tilesheetPath);
        return buf.toString('base64');
    }

    static tilesheetData(tilesheetDataPath) {
        let buf = fs.readFileSync(tilesheetDataPath);
        return JSON.parse(
            buf.toString('utf-8')
        );
    }
}