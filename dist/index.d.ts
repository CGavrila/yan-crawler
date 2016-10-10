/// <reference path="../typings/index.d.ts" />
import { EventEmitter } from 'events';
export interface Entry<T> {
    name: string;
    url: string;
    interval?: number;
    callback: (body: any, $: CheerioStatic) => T;
}
export declare class Crawler<T> extends EventEmitter {
    private DEFAULT_INTERVAL;
    private static _instance;
    private started;
    private entries;
    private intervals;
    constructor();
    static getInstance(): any;
    static destroyInstance(): void;
    start(): void;
    isStarted(): boolean;
    stop(): void;
    addEntry(entry: Entry<T>): void;
    addEntries(entries: Entry<T>[]): void;
    clearEntries(): void;
    removeEntry(entryName: string): boolean;
    private createNewInterval(entry);
    private clearIntervals();
    private makeRequest(url, callback);
    getEntries(): {
        [name: string]: Entry<T>;
    };
    getIntervals(): {
        [name: string]: any;
    };
}
