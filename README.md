# demo_ftp
demo nodejs ftp service

Sometimes it is required to provide some files from server for clients through FTP and, which is important, this requirement is temporary and urgency. To avoid configuration and further deinstallation  of FTP server for these goals, it is much simplier to temporary start current nodejs app on the server and stop it on mission complete.

# Installation:
``` bash
git clone https://github.com/pieropatron/demo_ftp
npm install
```

For work service uses configuration files. After install, please, create file "local-config.js" at dist folder and fill it with following options:

``` ts
exports.default = {
	host: string, // service host
	port: number, // service main port
	path: string, // path to ftp root directiory
	users: [
		// list of users, for example:
		{name: "guest", password: "guest"}
		// NB: for every user it is mandatory to have own folder at ftp root directiory (/home/ubuntu/ftp/guest/)
	],
	debugging: 0 | 1, // set service debug level
	pasvPortRangeStart: 3010, // min port for creating PASV connections
	pasvPortRangeEnd: 3060 // max port for creating PASV connections
};
```

After that, service could be started by:
``` bash
npm start
```

NB: service is quite simple and doesn't support write operations and any complex permission logic
