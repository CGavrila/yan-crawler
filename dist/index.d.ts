/// <reference path="../typings/index.d.ts" />
import { EventEmitter } from 'events';
export interface Entry {
    name: string;
    url: string;
    interval?: number;
    callback: Function;
}
export declare class Crawler extends EventEmitter {
    private DEFAULT_INTERVAL;
    private static _instance;
    private started;
    private entries;
    private intervals;
    constructor();
    static getInstance(): Crawler;
    static destroyInstance(): void;
    start(): void;
    isStarted(): boolean;
    stop(): void;
    addEntry(entry: Entry): void;
    addEntries(entries: Entry[]): void;
    clearEntries(): void;
    removeEntry(entryName: string): boolean;
    private createNewInterval(entry);
    private clearIntervals();
    private makeRequest(url, callback);
    getEntries(): {
        [name: string]: Entry;
    };
    getIntervals(): {
        [name: string]: any;
    };
}
