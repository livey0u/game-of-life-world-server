'use strict';

const config = require('config');
const http = require('http');
const SocketIO = require('socket.io');

const logger = require('logger');
const World = require('lib/world');
const constants = require('lib/constants');
const util = require('lib/util');

const server = http.createServer();
const world = new World(config);
const io = SocketIO(server);
const worldServerConfig = {port: process.env.PORT || config.server.port, host: config.server.host};

io.on('connection', function onConnection(client) {

  logger.info('Relay Client Connected');

  client.on(constants.NEW_CLIENT, function onClient(data, callback) {
    
    logger.info('Web Client Connected', data);

    let newClientResponse = {event: constants.NEW_CLIENT + '_RESPONSE', success: true, data: {layout: world.layout, color: util.ipToColor(data.address), username: data.address}};
  	
    callback(null, newClientResponse);

  });

  client.on(constants.UPDATE_CELLS, function onCellUpdate(data, callback) {

  	try {
  		world.setCells(data);
  	}
  	catch(ex) {
  		logger.error('set cell exception', JSON.stringify(ex, ["message", "arguments", "type", "name"]));
  		return callback({error: ex.toString(), event: constants.UPDATE_CELLS + '_RESPONSE', success: false});
  	}
  	
  	callback(null, {event: constants.UPDATE_CELLS + '_RESPONSE', success: true, data: data});

  });

  client.on('disconnect', function onDisconnect() {
    logger.info('Relay Client Connected');
  });

  client.send({event: constants.SERVER_RESTARTED, data: {layout: world.layout}});

});

world.on(constants.EVOLUTION_EVENT, broadcast.bind(null, constants.EVOLUTION_EVENT));

world.on(constants.CELLS_UPDATED_EVENT, broadcast.bind(null, constants.CELLS_UPDATED_EVENT));

function broadcast(event, data) {
	io.sockets.send({event: event, data: data, success: true});
}

server.listen(worldServerConfig.port, worldServerConfig.host, function onListen(error) {
	if(error) {
		return logger.error(error);
	}
  world.begin();
	logger.info(`Game Of Life Server running on port ws://${worldServerConfig.host}:${worldServerConfig.port}`);
});