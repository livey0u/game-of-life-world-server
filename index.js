'use strict';

const config = require('config');

const logger = require('logger');
const World = require('lib/world');
const world = new World(config);

require('lib/process-events').register(world);

require('lib/server').start(world, config, function startCallback(error) {
  if(error) {
    return logger.error('World Server Startup Error', error);
  }
});

