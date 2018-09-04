const R = require('ramda');

const requestParams = R.compose(
	R.values,
	R.pickAll
);

const invalidParams = R.compose(
	R.any(R.isNil),
	requestParams
);

module.exports = {
	invalidParams
};
