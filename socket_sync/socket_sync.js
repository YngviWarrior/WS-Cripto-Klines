import WebSocket from 'ws';
import CreateConnection from '../db/mysql.js';
import { allParities, allresolutions, tradeChannel, candleChannel } from '../config/resolutions.js';
import { getProcessFuturePrice, getCorrectTime, findPriceInBar } from './processLastTradePrice.js';

const DBConn = await CreateConnection();
const exchange = 'Binance';
let subscription;
let subscription_param = [];
let data;

function fixSymbol(symbol) {
    switch (symbol) {
        case 'ATOMUSDT':
            symbol = 'ATOUSDT';
            break;
    
        case 'DASHUSDT':
            symbol = 'DSHUSDT';
            break;
        
        case 'DOGEUSDT':
            symbol = 'DOGUSDT';
            break;
        default:
            symbol = symbol;
            break;
    }

    return symbol;
}

export default async function startSync(cache) {
    let list = Object.keys(allParities).map(function (key) { return allParities[key]; });
    let symbol;

    allresolutions.forEach(resolution => {
        if(resolution == '1m'){
            list.forEach(parity => {
                switch (parity.symbol) {
                    case 'ATOUSDT':
                        symbol = 'ATOMUSDT';
                        break;
                
                    case 'DSHUSDT':
                        symbol = 'DASHUSDT';
                        break;
                    
                    case 'DOGUSDT':
                        symbol = 'DOGEUSDT';
                        break;
                    default:
                        symbol = parity.symbol
                        break;
                }
    
                subscription_param.push(`${symbol.toLowerCase()}@kline_${resolution}`);
                // subscription_param.push(`${symbol.toLowerCase()}@trade`);
            });
        }
    });

    getCandle(cache);
    
    setInterval(() => {
        getCandle(cache);
    }, 60000 * 60 * 24);
}

async function dbSync(symbol, resolution, response, amount) {
    symbol = fixSymbol(symbol);

    let parity = Object.values(allParities).filter(p => p.symbol == symbol)[0];
    
    DBConn.query(`INSERT INTO 
                candle_${resolution} (id_moedas_pares, mts, open, close, high, low, volume) 
                VALUES (${parity.id}, "${response.data.k.t}", "${response.data.k.o}", "${amount}", "${response.data.k.h}", "${response.data.k.l}", "${response.data.k.v}")
                ON DUPLICATE KEY UPDATE 
                open = "${response.data.k.o}",
                close = "${amount}",
                high = "${response.data.k.h}",
                low = "${response.data.k.l}",
                volume = "${response.data.k.v}"`,
    (err, result, field) => {
        if (err) {
            throw err;
        }
    });
}

async function getCandle(cache) {
    switch (exchange) {
        case 'Bitfinex':
            const wssBitfinex = new WebSocket('wss://api-pub.bitfinex.com/ws/2')
    
            subscription = JSON.stringify({ 
              event: 'subscribe', 
              channel: 'candles', 
              key: `trade:${resolution}:t${symbol.slice(0,-1)}` //'trade:TIMEFRAME:SYMBOL'
            })
    
            wssBitfinex.on('open', () => wssBitfinex.send(subscription))
    
            wssBitfinex.on('message', (candle) => {
                // let response = JSON.stringify(JSON.parse(candle))
                // console.log(response)
            });
    
            break;
            
        case 'Binance':
            const wssBinance = new WebSocket('wss://stream.binance.com/stream')
            
            subscription = JSON.stringify({ 
                id: 1,
                method: "SUBSCRIBE",
                params: subscription_param
            });
            
            wssBinance.on('open', () => wssBinance.send(subscription))
            
            wssBinance.on('ping', () => {
                wssBinance.pong();
            })
        
            wssBinance.on('message', (candle) => {
                let response = JSON.parse(candle);

                if(response?.stream != undefined){
                    let streamType = response?.stream.split('@');
                    let symbol = streamType[0];
                    // if(symbol == 'btcusdt'){
                    //     console.log(streamType[0])
                    //     console.log('Chego:' + new Date())
                    // }
                    switch (streamType[1]) {
                        case 'trade':
                            symbol = symbol.toUpperCase();
                            symbol = fixSymbol(symbol);

                            candleChannel[symbol.slice(0, -1)].info.last_price = response.data.p;
                            candleChannel[symbol.slice(0, -1)].info.run_last_second = new Date().getTime();

                            break;
                    
                        default:
                            let random_percent = 0;
                            let minor_plus = 0;
                            let amount = 0;

                            random_percent = Math.random() / 2000;
                            random_percent.toString().slice(-1) % 2 == 0 ? minor_plus = true : minor_plus = false;
                
                            minor_plus === true ? amount = response.data.k.c * (1 + random_percent) : amount = response.data.k.c * (1 - random_percent);
                            
                            data = [
                                response.data.k.t, //"mts"
                                response.data.k.o, //"open" 
                                amount.toString(), //"close"
                                response.data.k.h, //"high"
                                response.data.k.l, //"low"
                                response.data.k.v  //"volume"
                            ];
                            
                            let resolution = response.stream.split('@kline_')[1];
                            symbol = symbol.toUpperCase();

                            cache.set(`${symbol}/${resolution}`, JSON.stringify(data));

                            // symbol = fixSymbol(symbol);


                            // if(resolution == '1m'){
                            //     dbSync(symbol, resolution, response, amount.toString());
                            // }

                            // let fixed_bar_price = false;
                            // let fixed_bar_future_price = false;
                            // let have_price_future = await getProcessFuturePrice(DBConn);

                            // if(!have_price_future[0]){
                            //     let price_in_bar = findPriceInBar(
                            //         candleChannel[symbol.slice(0, -1)].info.id, 
                            //         candleChannel[symbol.slice(0, -1)].info.run_last_second, 
                            //         candleChannel[symbol.slice(0, -1)].info.sync_symbol,
                            //         candleChannel[symbol.slice(0, -1)].info.last_price
                            //     );

                            //     if(price_in_bar[0]){
                            //         fixed_bar_price = true;
                            //         candleChannel[symbol.slice(0, -1)].info.last_price = price_in_bar[1];
                            //     }
                            // } else {
                            //     fixed_bar_future_price = true;
                            //     candleChannel[symbol.slice(0, -1)].info.last_price = have_price_future[2];
                            // }

                            // let correntTimeCandle = getCorrectTime(60);
                            // let activeCandle1Mmts = correntTimeCandle.active;
                            // let futureCandle1Mmts = correntTimeCandle.next;

                            // let candle_info_list = getListCadleFromEntries(DBConn, candleChannel[symbol.slice(0, -1)].info.id, symbol, "1m", "DESC", 0, 1);

                            // let candle_info_active = (candle_info_list[0].mts == activeCandle1Mmts ? candle_info_list[0]: candle_info_list[1]);

                            // let candle_update = {
                            //     "id_moedas_pares": candleChannel[symbol.slice(0, -1)].info.id,
                            //     "mts": candle_info_active.mts,
                            //     "open": candle_info_active.open,
                            //     "close": candle_info_active.close,
                            //     "high": candle_info_active.high,
                            //     "low": candle_info_active.low,
                            //     "volume": candle_info_active.volume,
                            // };

                            // if(have_price_future[0] && have_price_future[1]){
                            //     candle_update.high_custom    = candle_info_active.high_custom ?? candle_info_active.high;
                            //     candle_update.low_custom     = candle_info_active.low_custom ?? candle_info_active.low;
                            //     candle_update.close_custom   = lastPrice;
                            //     candle_update.id_game_custom = idGameCustom;
                            // }

                            // candle_update.concat(candle_info_active);

                            // let add_end_candle;
                            // if(fixed_bar_price) {
                            //     add_end_candle = 'fixed_price';
                            // }

                            // if(fixed_bar_future_price) {
                            //     add_end_candle = 'future_price';
                            // }

                            // cache.set(`${symbol}/${resolution}`, JSON.stringify(data));
                        break;
                    }
                }
            });
    
            break;
    }
}
