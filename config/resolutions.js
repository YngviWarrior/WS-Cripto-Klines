const allresolutions = [
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
    '1d',
    '7d',
    '1month',
];

const allParities = {
    "BTCUSDT" :{
        id: 2, 
        sync_symbol: "BTCUSD",
    },
    "DSHUSDT" :{
        id: 3, 
        sync_symbol: "DSHUSD",
    },
    "LTCUSDT" :{
        id: 4, 
        sync_symbol: "LTCUSD",
    },
    "DOGUSDT" :{
        id: 6, 
        sync_symbol: "DOGUSD",
    },
    "TRXUSDT" :{
        id: 7, 
        sync_symbol: "TRXUSD",
    },
    "ADAUSDT" :{
        id: 8, 
        sync_symbol: "ADAUSD",
    },
    "LUNAUSDT" :{
        id: 11, 
        sync_symbol: "LUNAUSD",
    },
    "ATOUSDT" :{
        id: 12, 
        sync_symbol: "ATOUSD",
    },
    "LINKUSDT" :{
        id: 13, 
        sync_symbol: "LINKUSD",
    },
    "DOTUSDT" :{
        id: 14, 
        sync_symbol: "DOTUSD",
    },
    "FTMUSDT" :{
        id: 15, 
        sync_symbol: "FTMUSD",
    },
    "SOLUSDT" :{
        id: 16, 
        sync_symbol: "SOLUSD",
    },
}
    
function checkParityResolution(parity, resolution) {
    if (allParities.hasOwnProperty(parity) === true) {
        if (allresolutions.includes(resolution) === true) {
            return true;
        }
    }

    return false;
}

export { allParities, allresolutions, checkParityResolution }