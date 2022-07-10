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

var candleChannel = [];
var tradeChannel = [];

function getAllParities(){
    return new Promise(function (resolve, reject) {
        Conn.query(`SELECT id, nome, symbol, id_coin1, id_coin2, utilizar_giro, symbol_sync, sync_only_exchange_rate FROM moedas_pares WHERE 1 = 1 AND symbol NOT LIKE '%BRL'`, (err, result, field, allParities) => {
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
            coinsFromDb.map((coinRaw) => {
                tradeChannel[coinRaw.symbol_sync] = {};
                candleChannel[coinRaw.symbol_sync] = {};
                coinsResult[coinRaw.id]=coinRaw;
            });
            resolve(coinsResult)
        })
    });
}

var allParities = await getAllParities(); // possible future optimization problem by each login

function checkParityResolution(parity, resolution) {
    return Object.values(allParities).filter(p => p.symbol == parity)[0].symbol == parity && allresolutions.includes(resolution);
}

function createChannels() {
    Object.entries(allParities).map(c => {
        if(c[1].symbol_sync != null){
            let coin = c[1];
            if(coin.symbol_sync == 'LUNA:USD'){
                coin.symbol_sync = 'LUNAUSD';
            }
    
            if(coin.symbol_sync == 'LINK:USD'){
                coin.symbol_sync = 'LINKUSD';
            }
            
            tradeChannel[coin.symbol_sync] = {
                info: coin,
                class: {
                    "type"       : "trades",
                    "id" : coin.id,
                    "symbol"     : coin.symbol,
                    "symbol_sync" : coin.symbol_sync
                }
            }

            candleChannel[coin.symbol_sync] = {
                info: {...coin, 
                    "last_price": 0,
                    "run_last_second": 0
                },
                wsTime: allresolutions.map(time => { return time })
            }
        }
    })
}

createChannels();

export { allParities, allresolutions, tradeChannel, candleChannel, checkParityResolution }