import { allresolutions, allParities } from "../config/resolutions.js";
import syncCandle from './job_sync.js';

(async () => {
    await Promise.all(
        allresolutions.map(async (resolution) => {
            switch (resolution) {
                case '1m':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000);
                    })
                    
                    break;
                    
                case '5m':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 5);
                    })
                    break;

                case '15m':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 15);
                    })
                    break;

                case '30m':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 30);
                    })
                    break;

                case '1h':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 60);
                    })
                    break;

                case '1d':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 60 * 24);
                    })
                    break;

                case '7d':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 60 * 24 * 7);
                    })
                    break;

                case '1month':
                    Object.entries(allParities).map(async (parity) => {
                        syncCandle(parity, resolution)
                        setInterval(() => {
                            syncCandle(parity, resolution)
                        }, 60000 * 60 * 24 * 7 * 3);
                    })
                    break;
            }
        })
    )
})()
