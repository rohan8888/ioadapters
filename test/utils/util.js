const u = require('../../src/utils/util');
const assert = require('chai').assert;
const expect = require('chai').expect;

describe('Utility functions test', function() {
	it('should return true for missing parameters and false for valid parameters', function(done) {
		let mandatoryParams = ['p1', 'p2'];
		let input1 = { p1: 'test' },
			input2 = { p1: 1, p2: 2 };

		let result1 = u.invalidParams(mandatoryParams, input1);
		let result2 = u.invalidParams(mandatoryParams, input2);

		expect(result1).to.be.ok;
		expect(result2).to.not.be.ok;
		done();
	});
});
