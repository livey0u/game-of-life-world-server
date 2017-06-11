# Game Of Life

A small module that mutates cells based on following rules & requirements.


## Rules

	1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
	2. Any live cell with two or three live neighbours lives on to the next generation.
	3. Any live cell with more than three live neighbours dies, as if by overcrowding.
	4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

## Application requirements

	1. When a dead cell revives by rule #4 “Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.”, it will be given a color that is the average of its neighbours (that revive it).
	2. Each client is assigned a random color on initialization. From the browser, clicking on any grid will create a live cell on that grid with the client’s color. `color is generated based on ip address of the client`


## Setup

	1. git clone https://github.com/livey0u/game-of-life-world-server.git
	2. cd game-of-life-world-server
	3. npm install

## Start

Development:

	1. NODE_ENV=development PORT=5000 NODE_PATH=. node index.js


Production:

	1. npm start

## Heroku Deployment

After setting up heroku cli, following command would deploy.

	1. git push heroku master

## Architecture

Project consists of 2 servers. 

1. Game Server
2. Relay Server

Actual game logic is in game server. Relay server just relays events between clients & game server.
Reasoning behind this architecture is, 
1. Game server's CPU & RAM usage would be almost constant
2. Handling client websocket connections involves more CPU & RAM over number of clients connected & time. 

If both game logic & client handling kept in same server instance, we would have to launch more server instances to handle more number of clients. So to keep game data synchronous among all the instances, we would choose some centralized data store like redis, which I tried & async nature in keeping data in redis added complexity in the game logic code & more importantly made unit testing more difficult than keeping data in application memory.

So, game logic code is seperated & kept in seperate server. Clients connects to relay servers. Each relay server keeps one websocket connection with game server. This connection from relay server will add up usage of CPU & RAM in game server. But when compared to number of clients connections to relay server and the number of realy servers connections to game server, game server would handle very less number of connections. 

## Events flow

1. Client origianted events sent to relay servers & relayed to game server.
2. Game server originated events sent to relay servers & broadcasted to all connected clients.

## Functionalities

1. Color generation is based on ip address & user can change it.
2. Only changed cells are sent to clients. Remaining part can be created by clients, even at the start of client app.
3. Backup of layout data is done on process exit & loaded on process startup. So, the game state is preserved across server restarts.
4. If board size changed during restarts, preserved game state is applied only if new size is same or higher than previous size.

## Todo








