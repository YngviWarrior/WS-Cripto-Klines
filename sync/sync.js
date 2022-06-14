import { allParities } from "../config/resolutions.js";
import syncCandle from './job_sync.js';

(async () => {
    await Promise.all(
        Object.entries(allParities).map(async (parity) => {
        syncCandle(parity)
    }));
})()

// allParities.forEach((symbol, idParity) => {
//     if(idParity == 2) {
//         await syncCandle(idParity, symbol)
//     }
// });
