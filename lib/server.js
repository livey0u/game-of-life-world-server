'use strict';

const logger = require('logger');
const constants = require('lib/constants');
const util = require('lib/util');

exports.start = function start(world, config, callback) {

	const http = require('http');
	const SocketIO = require('socket.io');

	const server = http.createServer();

	const io = SocketIO(server);

	io.on('connection', handleConnection.bind(null, world));

	world.on(constants.EVOLUTION_EVENT, broadcast.bind(null, io, constants.EVOLUTION_EVENT));

	world.on(constants.CELLS_UPDATED_EVENT, broadcast.bind(null, io, constants.CELLS_UPDATED_EVENT));

	world.once(constants.WORLD_STARTED_EVENT, startWorldServer.bind(null, server, config, callback));

	world.start();

};

function broadcast(io, event, data) {
	io.sockets.send({event: event, data: data, success: true});
}

function handleConnection(world, client) {

  logger.info('Relay Client Connected');

  client.on(constants.NEW_CLIENT_EVENT, handleClient.bind(null, world));

  client.on(constants.UPDATE_CELLS_EVENT, updateCells.bind(null, world));

  client.on('disconnect', handleDisconnect);

  client.send({event: constants.SERVER_RESTARTED_EVENT, data: {layout: world.layout}});

}

function handleClient(world, data, callback) {
    
  logger.info('Web Client Connected', data);

  let newClientResponse = {event: constants.NEW_CLIENT_EVENT + '_RESPONSE', success: true, data: {layout: world.layout, color: util.ipToColor(data.address), username: data.address}};
	
  callback(null, newClientResponse);

}

function updateCells(world, data, callback) {

	try {
		world.setCells(data);
	}
	catch(ex) {
		logger.error('set cell exception', JSON.stringify(ex, ["message", "arguments", "type", "name"]));
		return callback({error: ex.toString(), event: constants.UPDATE_CELLS_EVENT + '_RESPONSE', success: false});
	}
	
	callback(null, {event: constants.UPDATE_CELLS_EVENT + '_RESPONSE', success: true, data: data});

}

function handleDisconnect() {
  logger.info('Relay Client Connected');
}

function startWorldServer(server, config, callback) {

	const worldServerConfig = {port: process.env.PORT || config.server.port, host: config.server.host};
	
	server.listen(worldServerConfig.port, worldServerConfig.host, function onListen(error) {
		if(error) {
			return callback(error);
		}
		logger.info(`Game Of Life Server running on port ws://${worldServerConfig.host}:${worldServerConfig.port}`);
		callback();
	});

}