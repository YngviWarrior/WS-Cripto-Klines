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
    if (allParities.hasOwnProperty(parity) === true) {
        if (allresolutions.includes(resolution) === true) {
            return true;
        }
    }

    return false;
}

export { allParities, allresolutions, checkParityResolution }