# Websocket-Cripto-Klines

- Pre-requisites
  
  Node version: 19 <br>
  Docker <br>
  Any testable tool with WS protocol like Postman or Insomnia. 

- Project Resume

  This Websocket project send every 2 seconds criptoparities candles by an URL pattern . With synchronization of tables candles{resolution} into a database for an previous graph load.

  URL Parttern: ws://your-ipv4-or-localhost:3000/candle/{PARITY}/{RESOLUTION}

  Parity Example: BTCUSDT, ETHUSDT, USDTBRL
  Resolution Example: 1m, 5m, 15m, 30m, 1h, 1d

- Getting Start

  Step 1: $ docker-compose up -d

  Step 2: $ docker network inspect ws-cripto-klines_wsklines_network
    
  Step 3: Copy the Getway URL, this ip will be need to login into our mysql database. Ex: "Gateway": "192.168.80.1"

  Step 4: Open the project folder on terminal and execute the follow command: $ cat src/db/.sql | mysql -h 192.168.80.1 -u root -P 3307 -p

  Step 5: $ docker-compose down && docker-compose up -d

  <b>The Project is Ready ! Open your Postman</b>

- Used APIs Documentations

  Binance Rest API
  https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#general-api-information

   Binance Socket API
  https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md

  <!-- Bitfinex API
  https://docs.bitfinex.com/docs#api-v1-or-api-v2 -->
