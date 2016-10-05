/// <reference path="../typings/index.d.ts" />
import { EventEmitter } from 'events';
export interface Entry {
    name: string;
    url: string;
    interval?: number;
    callback: Function;
}
declare class Crawler extends EventEmitter {
    private entries;
    private DEFAULT_INTERVAL;
    private static _instance;
    constructor();
    static getInstance(): Crawler;
    static destroyInstance(): void;
    addEntry(entry: Entry): void;
    getEntries(): Entry[];
    start(): void;
    private makeRequest(url, callback);
}
export default Crawler;
