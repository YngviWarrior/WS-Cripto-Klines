# Websocket-NodeJS
Node version: 16.15.0

-------------------------------------------------------------------- Project Resume ----------------------------------------------------------------------

  This Websocket project send every 2 seconds criptoparities candles by an URL pattern . With synchronization of tables candles{resolution} into a database for an previous graph load.

URL Parttern: ws://192.168.1.102:3000/candle/{PARITY}/{RESOLUTION}

Parity Example: BTCUSDT, ETHUSDT
Resolution Example: 1m, 5m, 1h

------------------------------------------------------------------- Getting Start -------------------------------------------------------------------------

Install dependencies: npm i
Install Yarn or Nodemon

Inicialize project on terminal with yarn start command.

Binance Rest API
https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#general-api-information

Binance Socket API
https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md

Bitfinex API
https://docs.bitfinex.com/docs#api-v1-or-api-v2
