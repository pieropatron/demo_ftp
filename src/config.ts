import {FtpUser} from './types';

export default {
	host: "127.0.0.1",
	port: 3005,
	path: "/",
	users: [] as FtpUser[],
	debugging: 0,
	pasvPortRangeStart: 1025,
	pasvPortRangeEnd: 1050
};
