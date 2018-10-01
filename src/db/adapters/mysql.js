const R = require('ramda');
const config = require('config');
const { promisify } = require('util');
const mysql = require('promise-mysql');

const masterPool = mysql.createPool(config.mysql.master);
const slavePool = mysql.createPool(config.mysql.slave);

const format = R.apply(mysql.format);

const isMaster = R.compose(
	R.equals('master'),
	R.nthArg(0)
);
const isSlave = R.compose(
	R.equals('slave'),
	R.nthArg(0)
);

const chooseInstance = R.cond([
	[isMaster, R.always(masterPool)],
	[isSlave, R.always(slavePool)],
	[R.T, R.always(slavePool)]
]);

const getQueryWithValues = R.compose(
	format,
	R.slice(1, Infinity),
	R.unapply(R.identity)
);

const useConnection = async function(pool, statement) {
	let c = await pool.getConnection();
	let result, errCatch;
	const t1 = Date.now();
	try {
		result = await c.query(statement);
	} catch (err) {
		errCatch = err;
		console.log('[ERROR]', err, statement);
	} finally {
		c.release();
	}
	const t2 = Date.now();
	console.log('[MySQL]', statement, t2 - t1, 'ms');
	if (errCatch) throw errCatch;

	return result;
};

const run = R.curryN(
	3,
	R.converge(useConnection, [chooseInstance, getQueryWithValues])
);

const slave = run('slave');
const master = run('master');

module.exports = {
	slave,
	master
};
