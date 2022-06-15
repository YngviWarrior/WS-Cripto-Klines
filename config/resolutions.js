import CreateConnection from '../db/mysql.js';

const Conn = await CreateConnection();

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

/*
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
*/

function getAllParities(){
    return new Promise(function (resolve, reject) {
        Conn.query('SELECT id, nome, symbol, id_coin1, id_coin2, utilizar_giro, symbol_sync,sync_only_exchange_rate FROM moedas_pares WHERE 1 = 1', (err, result, field, allParities) => {
            if (err) {
                return reject(err);
            }
            /* getting info from db */
            const coinsFromDb = Object.keys(result).map(resultId /* primary key for each result from db */ => {
                const coin = result[resultId];
                return {...coin};
            })
            let coinsResult={}
            /* building object like { idCoin -> str : { id: 2, ... } } */
            coinsFromDb.map((coinRaw) => coinsResult[coinRaw.id]=coinRaw);
            resolve(coinsResult)
        })
    });
}

var allParities = await getAllParities(); // possible future optimization problem by each login

function checkParityResolution(parity, resolution) {
    return allresolutions.includes(resolution) && allParities.includes(parity);
}

export { allParities, allresolutions, checkParityResolution }