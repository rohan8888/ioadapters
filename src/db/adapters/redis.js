const R = require('ramda');
const redis = require('ioredis');
const config = require('config');
const { promisify } = require('util');
const zlib = require('zlib');
const { Buffer } = require('buffer');
const u = require('../../utils/util');

const createCluster = i => ({
	name: i['name'],
	connection: new redis.Cluster(
		[{ port: i['port'], host: i['host'] }],
		i['options']
	)
});

const createStandalone = i => ({
	name: i['name'],
	connection: new redis(i['port'], i['host'], i['options'])
});

const createConnection = R.ifElse(
	R.propEq('isCluster', 1),
	createCluster,
	createStandalone
);

const retryStrategy = R.assocPath(['options', 'retryStrategy'], t =>
	Math.min(t * config.redis.connection.retryBackoff, 2000)
);

const getRedisConnections = R.compose(
	R.map(createConnection),
	R.map(retryStrategy),
	R.values
);

let connections = getRedisConnections(config.redis.instances);

const findConnection = name =>
	connections.filter(c => c['name'] === name).shift();

const defaultConnection = findConnection('default');

const getConnection = R.compose(
	R.prop('connection'),
	R.defaultTo(defaultConnection),
	findConnection
);

const fromCache = async (c, params) => {
	let pc = promisify(c.get).bind(c);
	const t1 = Date.now();
	let result = await pc(params.key);
	if (params['zipped'])
		result = result
			? zlib.inflateSync(new Buffer(result, 'hex')).toString('utf-8')
			: null;
	const t2 = Date.now();
	console.log('get', params.key, t2 - t1, 'ms');
	return JSON.parse(result);
};

const toCache = (c, params) => {
	if (u.invalidParams(['key', 'value'], params)) return;
	let key = params['key'];
	let expiry = params['expiry'] || config.redis.defaultExpiry;
	let value = JSON.stringify(params['value']);
	if (params['zipped'])
		value = zlib.deflateSync(new Buffer(value, 'utf-8')).toString('hex');

	c.setex(key, expiry, value);
};

const delCache = (c, key) => c.del(key);

const get = R.useWith(fromCache, [getConnection, R.identity]);
const set = R.useWith(toCache, [getConnection, R.identity]);
const del = R.useWith(delCache, [getConnection, R.identity]);

module.exports = {
	get,
	set,
	del
};
