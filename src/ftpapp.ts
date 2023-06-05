import ftpd from 'ftpd';
import fs from 'fs';
import stream from 'stream';
import {Logger} from '@pieropatron/tinylogger';

import {FtpUser} from './types';
import DefaultConfig from './config';

const logger = new Logger(`demo_ftpd`);

const getConfig = async ()=>{
	const lcfg_path = __dirname + '/local-config.js';
	if (fs.existsSync(lcfg_path)){
		const lcfg = await import(lcfg_path);
		return {...DefaultConfig, ...lcfg.default};
	} else {
		return DefaultConfig;
	}
};

class PermissionDenied extends Error {
	constructor(){
		super(`Permission denied`);
	}
}

const getCallbackDenied = ()=>{
	return (...args: any[])=>{
		const last = args.pop();
		if (typeof(last) == 'function'){
			return last(new PermissionDenied());
		}
	};
};

class WritableDenied extends stream.Writable {
	_write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
		return callback(new PermissionDenied());
	}
}

const start = async ()=>{
	const cfg: typeof DefaultConfig = await getConfig();
	if (cfg.debugging){
		logger.level = 'debug';
	}

	const readOnlyOptions = {
		unlink: getCallbackDenied(),
		readdir: fs.readdir,
		mkdir: getCallbackDenied(),
		open: fs.open,
		close: fs.close,
		rmdir: getCallbackDenied(),
		rename: getCallbackDenied(),
		stat: fs.stat,
		createWriteStream: ()=>{ return new WritableDenied(); },
		createReadStream: fs.createReadStream
	};

	const server = new ftpd.FtpServer(cfg.host, {
		getInitialCwd: ()=>{ return '/'; },
		getRoot: (cnn)=>{ return cfg.path + cnn.username; },
		pasvPortRangeStart: cfg.pasvPortRangeStart,
		pasvPortRangeEnd: cfg.pasvPortRangeEnd,
		useWriteFile: false,
		useReadFile: false
	});

	server.on('error', (error)=>{ logger.error('FTP Server error:', error);	});

	server.on('client:connected', (connection: ftpd.FtpConnection)=>{
		let userset: FtpUser | undefined;
		logger.debug('client connected');
		connection.on('command:user', function(user, success, failure) {
			logger.debug('command:user', user);
			userset = cfg.users.find(s=>{
				return (s.name == user);
			});
			if (userset) {
				success();
			} else {
				failure();
			}
		});

		connection.on('command:pass', function(pass, success, failure) {
			logger.debug('pass:', pass);
			if (pass && userset && userset.password == pass) {
				success(userset.name, readOnlyOptions);
			} else {
				failure();
			}
		});
	});

	server.debugging = cfg.debugging;
	server.listen(cfg.port);
	logger.info('Listening on port', cfg.port);
};

const time_start = logger.time(`service init`, 'info');
start().then(()=>{
	time_start();
}, error=>{
	time_start();
	logger.error(error);
	process.exit(1);
});
