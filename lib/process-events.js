'use strict';

const asyncKit = require('async-kit');

exports.register = function register(world) {
	
	// process.on('exit', exitHandler.bind(null, {cleanup: true}));

	process.on('SIGINT', exitAsync);

	process.on('uncaughtException', exitAsync);

  process.on('asyncExit', function f(code , timeout , callback) {
    asyncExitHandler(world, code, timeout, callback);
  });

};

function exitAsync() {

  asyncKit.exit(0, 5000);

}

function asyncExitHandler(world, code, timeout, callback) {

  world.stop(function f(error) {
    
    if(error) {
      require('logger').error('World engine stop error', error);
    }

    callback();

  });

}