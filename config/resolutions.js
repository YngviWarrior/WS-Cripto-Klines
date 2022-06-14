const allresolutions = [
    '1m',
    '5m',
    '10m',
    '15m',
    '30m',
    '1h',
    '1d',
];

const allParities = {
    2 :{
        symbol: "BTCUSDT", 
        sync_symbol: "BTCUSD",
    },
    3 :{
        symbol: "DSHUSDT", 
        sync_symbol: "DSHUSD",
    },
    4 :{
        symbol: "LTCUSDT", 
        sync_symbol: "LTCUSD",
    },
    6 :{
        symbol: "DOGUSDT", 
        sync_symbol: "DOGUSD",
    },
    7 :{
        symbol: "TRXUSDT", 
        sync_symbol: "TRXUSD",
    },
    8 :{
        symbol: "ADAUSDT", 
        sync_symbol: "ADAUSD",
    },
    11 :{
        symbol: "LUNAUSDT", 
        sync_symbol: "LUNAUSD",
    },
    12 :{
        symbol: "ATOUSDT", 
        sync_symbol: "ATOUSD",
    },
    13 :{
        symbol: "LINKUSDT", 
        sync_symbol: "LINKUSD",
    },
    14 :{
        symbol: "DOTUSDT", 
        sync_symbol: "DOTUSD",
    },
    15 :{
        symbol: "FTMUSDT", 
        sync_symbol: "FTMUSD",
    },
    16 :{
        symbol: "SOLUSDT", 
        sync_symbol: "SOLUSD",
    },
}
    
function checkParityResolution(parity, resolution) {
    return allresolutions.includes(resolution) && allParities.includes(parity);
}

export { allParities, allresolutions, checkParityResolution }