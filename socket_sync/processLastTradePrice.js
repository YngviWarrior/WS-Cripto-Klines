import { bcsub, bcdiv, bcadd } from 'locutus/php/bc/index.js';

const LogFuturePrice = false;

const PROCESS_FUTURE_PRICE_TYPE_PREPARE_TO_FINAL_PRICE = 1;
const PROCESS_FUTURE_PRICE_TYPE_PREPARE_BACK_ORIGINAL  = 2;
const PROCESS_FUTURE_PRICE_TYPE_AUTO_ADD_NEW_FUTURE_PREPARE_TO_FINAL_PRICE = 3;
const PROCESS_FUTURE_PRICE_TYPE_AUTO_ADD_NEW_FUTURE_PREPARE_TO_FINAL_PRICE_FIXED_AMOUNT = 3;
const PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE = 4;
const PROCESS_FUTURE_PRICE_TYPE_AUTO_ADD_NEW_FUTURE_PREPARE_TO_BACK_ORIGINAL = 5;
const PROCESS_FUTURE_PRICE_TYPE_RESET_CUSTOM_CANDLE = 6;

function getListCadleFromEntries(DBConn, id_coin_pair, symbol, resolution, order, offset = 0, length = 10, showAll = false){
    offset = (offset < 0 ? 0 : offset);
    length = (length <= 0 ? 10 : length);

    let result;

    if(showAll){
        DBConn.query(`
            SELECT * 
            FROM candle_${resolution} 
            WHERE id_moedas_pares = ${id_coin_pair}
            ORDER BY mts ${order}
            LIMIT ${offset}, ${length}
        `, (err, result, field) => {
            if(err) {
                throw err;
            }

            return result;
        });
    } else {
        if(resolution == "1m") {
            DBConn.query(`
                SELECT mts,
                    COALESCE(open_custom,open) as open,
                    COALESCE(close_custom,close) as close,
                    COALESCE(high_custom,high) as high,
                    COALESCE(low_custom,low) as low,
                    COALESCE(volume_custom,volume) as volume 
                FROM candle_${resolution} 
                WHERE id_moedas_pares = ${id_coin_pair}
                ORDER BY mts ${order}
                LIMIT ${offset}, ${length}
            `, (err, result, field) => {
                if(err) {
                    throw err;
                }

                return result;
            });
        } else {
            DBConn.query(`
                SELECT mts, open, close, high, low, volume
                FROM candle_${resolution} 
                WHERE id_moedas_pares = ${id_coin_pair}
                ORDER BY mts ${order}
                LIMIT ${offset}, ${length}
            `, (err, result, field) => {
                if(err) {
                    throw err;
                }

                return result;
            });
        }
    }
    
}

async function queryFindPriceBar(id_coin_pair, mts) {
    return new Promise(function (resolve, reject) {
        DBConn.query(`
            SELECT COALESCE(price_custom,price) as price,id_coin_pair,id_game_custom
            FROM graph_bar_1s
            WHERE id_coin_pair = ${id_coin_pair} AND mts = ${mts} AND price_custom IS NOT NULL
        `, (err, result, field) => {
            if(err) {
                throw err;
            }

            resolve(result[0])
        });
    });
}

export async function findPriceInBar(DBConn, id_coin_pair, mts, symbol_sync, last_price){
    let result = await queryFindPriceBar(id_coin_pair, mts);

    if(result) {
        DBConn.query(`
            UPDATE graph_bar_1s SET price = ${last_price} WHERE id_coin_pair = ${id_coin_pair} AND mts = ${mts}
        `, (err, result, field) => {
            if(err) {
                throw err;
            }

            return [true, last_price];
        });
    } else {
        DBConn.query(`
            INSERT graph_bar_1s(id_coin_pair, mts, price) VALUES (${id_crypt_pair}, ${mts}, ${price})
        `, (err, result, field) => {
            if(err) {
                throw err;
            }

            return [false, false];
        });
    }
}

export function getCorrectTime(periodTime, date = null) {
    if (!date) {
        date = new Date();
    }

    let dateEnd = date;

    if (periodTime <= 60) {
        date.setMilliseconds(0);
        
    } else if (periodTime <= 60 * 60) {
        date.setMilliseconds(0);
        date.setSeconds(0);
        
    } else if (periodTime <= 60 * 60 * 24) {
        date.setHours(0);
        date.setMilliseconds(0);
        date.setSeconds(0);
        
    } else if (periodTime <= 60 * 60 * 24 * 30) {
        date.setHours(0);
        date.setMilliseconds(0);
        date.setSeconds(0);

        let formated_date = new Date(date.getFullYear(), date.getMonth(), 0); // get last mounth's day
        date = formated_date;

    } else if (periodTime <= 60 * 60 * 24 * 365) {
        date.setHours(0);
        date.setMilliseconds(0);
        date.setSeconds(0);

        let formated_date = new Date(date.getFullYear(), 0, 0); // get last year
        date = formated_date;
    }

    while (date.getTime() < dateEnd.getTime()) {
        date.setSeconds(periodTime); // set seconds
    }

    return {
        "active": date.setSeconds(periodTime).getTime(),
        "last": date.setSeconds((periodTime * 2)).getTime(),
        "next": date.getTime()
    }
}

async function queryProcessFuturePrice(DBConn) {
    return new Promise(function (resolve, reject) {
        DBConn.query(`SELECT pfp.id as id_process_future_price, pfp.id_crypt_pair, pfp.id_type, pfp.value, pfp.value2, pfp.value3, m.symbol, m.symbol_sync, pfp.id_game
                        FROM process_future_price pfp 
                        JOIN moedas_pares m ON m.id = pfp.id_crypt_pair
                        WHERE 
                            pfp.done = 0
        `,(err, result, field) => {
            if (err) {
                throw err;
            }

            resolve(result[0])
        });
    });
}

export async function getProcessFuturePrice(DBConn) {
    let result = await queryProcessFuturePrice(DBConn);

    if(result.id_process_future_price != null) {
        let price_check = processLastTradePrice(symbol.slice(0, -1), result, DBConn);

        DBConn.query(`UPDATE process_future_price SET done = 1 where id = ${result.id_process_future_price}`, 
            (err, result, field) => {
                if(err) {
                    throw err;
                }
            }
        );

        let data = {
            "id_coin_pair": result.id_crypt_pair,
            "mts": candleChannel[symbol.slice(0, -1)].info.run_last_second,
            "price": candleChannel[symbol.slice(0, -1)].info.last_price,
            "id_game_custom": result.id_game,
            "price_custom": price_check[0]
        }

        if(!price_check[1]){
            data.price_custom = candleChannel[symbol.slice(0, -1)].info.last_price;
        }

        DBConn.query(`INSERT INTO graph_bar_1s VALUES(${result.id_crypt_pair}, ${candleChannel[symbol.slice(0, -1)].info.run_last_second},
            ${candleChannel[symbol.slice(0, -1)].info.last_price}, ${result.id_game}, ${price_check[0]})`, (err, result, field) => {
                if(err) {
                    throw err;
                }
            }
        );

        return [true, price_check[1], candleChannel[symbol.slice(0, -1)].info.last_price, result.id_game];
    } else {
        return [false, false, false, false];
    }
}


export async function processLastTradePrice(symbol_sync, result, DBConn) {
    if(candleChannel[symbol_sync].info.run_last_second <= Date.now() || candleChannel[symbol_sync].info.last_price > 0){
        let diff;
        let price;
        let query;

        switch (result.id_type) {
            case PROCESS_FUTURE_PRICE_TYPE_PREPARE_TO_FINAL_PRICE: //1
                if(candleChannel[symbol_sync].info.last_price > result.value) {
                    diff = candleChannel[symbol_sync].info.last_price - result.value;
                    price = bcsub(candleChannel[symbol_sync].info.last_price - (diff ? bcdiv(diff, result.value2): 0), 2);
                } else {
                    diff = result.value - candleChannel[symbol_sync].info.last_price
                    price = bcsub(candleChannel[symbol_sync].info.last_price - (diff ? bcdiv(diff, result.value2): 0), 2);
                }

                return [price, false];
            case PROCESS_FUTURE_PRICE_TYPE_PREPARE_BACK_ORIGINAL: //2
                if(result.value > candleChannel[symbol_sync].info.last_price) {
                    diff = result.value - candleChannel[symbol_sync].info.last_price;
                    price = bcsub(result.value - (diff ? bcdiv(diff, result.value2, 2): 0), 2);
                } else {
                    diff = candleChannel[symbol_sync].info.last_price - result.value;
                    price = bcadd(result.value - (diff ? bcdiv(diff, result.value2, 2): 0), 2);
                }

                return [price, false];
            case PROCESS_FUTURE_PRICE_TYPE_AUTO_ADD_NEW_FUTURE_PREPARE_TO_FINAL_PRICE: //3
                if(result.id_crypt_pair == null || result.id_game == null || candleChannel[symbol_sync].info.run_last_second == null) {
                    console.log("Empty Fields");
                }

                if (candleChannel[symbol_sync].info.last_price > result.value) {
                    diff = candleChannel[symbol_sync].info.last_price - result.value;
                    price = bcsub(result.value - (diff ? bcdiv(diff, result.value2, 2): 0), 2);
                } else {
                    diff = result.value - candleChannel[symbol_sync].info.last_price;
                    price = bcadd(result.value - (diff ? bcdiv(diff, result.value2, 2): 0), 2);
                }

                if (LogFuturePrice) {
                    // Log pra onde ? --'
                }

                query = `INSERT INTO process_future_price(id_crypt_pair, mts, id_type, value, value4, id_game) VALUES`;

                for (let index = 1; index < result.value3; index++) {
                    let mts_sql = (candleChannel[symbol_sync].info.run_last_second + (index * 1000));
                    
                    if(index == (result.value3 - 1)){
                        query += `(${result.id_crypt_pair}, ${mts_sql}, ${PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE}, ${price}, ${result.id_process_future_price}, ${result.id_game})`;
                    } else {
                        query += `(${result.id_crypt_pair}, ${mts_sql}, ${PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE}, ${price}, ${result.id_process_future_price}, ${result.id_game}),`;
                    }
                }

                DBConn.query(query, (err, result, field) => {
                    if(err) {
                        throw err;
                    }
                });

                return [price, false];
            case PROCESS_FUTURE_PRICE_TYPE_AUTO_ADD_NEW_FUTURE_PREPARE_TO_FINAL_PRICE_FIXED_AMOUNT: //3
                if(result.id_crypt_pair == null || result.id_game == null || candleChannel[symbol_sync].info.run_last_second == null) {
                    console.log("Empty Fields");
                }

                if (candleChannel[symbol_sync].info.last_price > result.value) {
                    price = bcsub(candleChannel[symbol_sync].info.run_last_second, result.value2);
                } else {
                    price = bcadd(candleChannel[symbol_sync].info.run_last_second, result.value2);
                }

                if (LogFuturePrice) {
                    // Log pra onde ? --'
                }

                query = `INSERT INTO process_future_price(id_crypt_pair, mts, id_type, value, value4, id_game) VALUES`;

                for (let index = 1; index < result.value3; index++) {
                    let mts_sql = (candleChannel[symbol_sync].info.run_last_second + (index * 1000));
                    
                    if(index == (result.value3 - 1)){
                        query += `(${result.id_crypt_pair}, ${mts_sql}, ${PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE}, ${price}, ${result.id_process_future_price}, ${result.id_game})`;
                    } else {
                        query += `(${result.id_crypt_pair}, ${mts_sql}, ${PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE}, ${price}, ${result.id_process_future_price}, ${result.id_game}),`;
                    }
                }

                DBConn.query(query, (err, result, field) => {
                    if(err) {
                        throw err;
                    }
                });

                return [price, false];
            case PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE: //4
                price = result.value;

                return [price, false];
            case PROCESS_FUTURE_PRICE_TYPE_AUTO_ADD_NEW_FUTURE_PREPARE_TO_BACK_ORIGINAL: //5
                if(result.id_crypt_pair == null || result.id_game == null || candleChannel[symbol_sync].info.run_last_second == null) {
                    console.log("Empty Fields");
                }

                if (result.value > candleChannel[symbol_sync].info.last_price) {
                    diff = result.value - candleChannel[symbol_sync].info.last_price;
                    price = bcsub(result.value - (diff ? bcdiv(diff, result.value2, 2): 0), 2);
                } else {
                    diff = candleChannel[symbol_sync].info.last_price - result.value;
                    price = bcadd(result.value - (diff ? bcdiv(diff, result.value2, 2): 0), 2);
                }

                if (LogFuturePrice) {
                    // Log pra onde ? --'
                }

                query = `INSERT INTO process_future_price(id_crypt_pair, mts, id_type, value, value4, id_game) VALUES`;

                for (let index = 1; index < result.value3; index++) {
                    let mts_sql = (candleChannel[symbol_sync].info.run_last_second + (index * 1000));
                    
                    if(index == (result.value3 - 1)){
                        query += `(${result.id_crypt_pair}, ${mts_sql}, ${PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE}, ${price}, ${result.id_process_future_price}, ${result.id_game})`;
                    } else {
                        query += `(${result.id_crypt_pair}, ${mts_sql}, ${PROCESS_FUTURE_PRICE_TYPE_FIXED_PRICE}, ${price}, ${result.id_process_future_price}, ${result.id_game}),`;
                    }
                }

                DBConn.query(query, (err, result, field) => {
                    if(err) {
                        throw err;
                    }
                });

                return [price, false];
            case PROCESS_FUTURE_PRICE_TYPE_RESET_CUSTOM_CANDLE: //6
                let candle_correct_mts = getCorrectTime(60);

                DBConn.query(`
                    UPDATE candle_1m
                    SET close_custom = null,
                        make_high_low = 1,
                        id_game_custom = null
                    
                    WHERE id_moedas_pares = ${result.id_crypt_pair}
                        AND mts = (${candle_correct_mts['active']})
                `, (err, result, field) => {
                    if(err) {
                        throw err;
                    }
                });

                return [candleChannel[symbol_sync].info.last_price, true];
        }
    }
}
