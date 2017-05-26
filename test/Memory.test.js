process.env.NODE_ENV = 'test';
//var Promise = require('bluebird');

var chai = require('chai');
var expect  = require("chai").expect;
var sinon = require('sinon');

var VMEM = require('../lib/Memory.js').Memory;
var vmem;

describe("PLC Memory", function() {
	beforeEach(function() {
		vmem = new VMEM({address:{
			VTEST1:'V40600',
			PTEST1:'P1400',
			BTEST1:'B2000.2',
			CTEST1:'C100',
			XTEST1:'X101',
			YTEST1:'Y102',
			TTEST1:'T103',
			SPTEST1:'SP104'
		}});
	});

	it ("Stores an integer into V memory", function() {
		vmem.store('V40600', 1234);
		expect(vmem.memory.V40600).to.equal(1234);
	});
	it ("Stores an integer alias into V memory", function() {
		vmem.store('VTEST1', 1234);
		expect(vmem.memory.V40600).to.equal(1234);
	});
	it ("Retrieves an integer from V memory", function() {
		vmem.memory.V40600 = 1234;
		expect(vmem.retrieve('V40600')).to.equal(1234);
	});
	it ("Retrieves an integer alias from V memory", function() {
		vmem.memory.V40600 = 1234;
		expect(vmem.retrieve('VTEST1')).to.equal(1234);
	});

	it ("Stores an integer into P memory", function() {
		vmem.memory.V1400 = 0o2000;
		vmem.store('P1400', 1234);
		expect(vmem.memory.V2000).to.equal(1234);
	});
	it ("Stores an integer alias into P memory", function() {
		vmem.memory.V1400 = 0o2000;
		vmem.store('PTEST1', 1234);
		expect(vmem.memory.V2000).to.equal(1234);
	});
	it ("Retrieves an integer from P memory", function() {
		vmem.memory.V1400 = 0o2000;
		vmem.memory.V2000 = 1234;
		expect(vmem.retrieve('P1400')).to.equal(1234);
	});
	it ("Retrieves an integer alias from P memory", function() {
		vmem.memory.V1400 = 0o2000;
		vmem.memory.V2000 = 1234;
		expect(vmem.retrieve('PTEST1')).to.equal(1234);
	});

	it ("Stores a bit into a bitfield", function() {
		vmem.store('B40602.0', true);
		expect(vmem.memory.V40602).to.equal(1);
	});
	it ("Stores a bit alias into a bitfield", function() {
		vmem.store('BTEST1', true);
		expect(vmem.memory.V2000).to.equal(4);
	});
	it ("Retrieves the bits from a bitfield", function() {
		vmem.memory.V2000 = 4;
		expect(vmem.retrieve('B2000.0')).to.equal(false);
		expect(vmem.retrieve('B2000.1')).to.equal(false);
		expect(vmem.retrieve('BTEST1')).to.equal(true);
		expect(vmem.retrieve('B2000.3')).to.equal(false);
		expect(vmem.retrieve('B2000.4')).to.equal(false);
		expect(vmem.retrieve('B2000.5')).to.equal(false);
		expect(vmem.retrieve('B2000.6')).to.equal(false);
		expect(vmem.retrieve('B2000.7')).to.equal(false);
		expect(vmem.retrieve('B2000.8')).to.equal(false);
		expect(vmem.retrieve('B2000.9')).to.equal(false);
		expect(vmem.retrieve('B2000.10')).to.equal(false);
		expect(vmem.retrieve('B2000.11')).to.equal(false);
		expect(vmem.retrieve('B2000.12')).to.equal(false);
		expect(vmem.retrieve('B2000.13')).to.equal(false);
		expect(vmem.retrieve('B2000.14')).to.equal(false);
		expect(vmem.retrieve('B2000.15')).to.equal(false);
	});

	it ("Stores a bit into C memory", function() {
		vmem.store('C100', true);
		expect(vmem.memory.V40604).to.equal(1);
	});
	it ("Stores a bit alias into C memory", function() {
		vmem.store('CTEST1', true);
		expect(vmem.memory.V40604).to.equal(1);
	});
	it ("Retrieves a bit from C memory", function() {
		vmem.memory.V40604 = 1;
		expect(vmem.retrieve('C100')).to.equal(true);
	});
	it ("Retrieves a bit alias from C memory", function() {
		vmem.memory.V40604 = 1;
		expect(vmem.retrieve('CTEST1')).to.equal(true);
	});

	it ("Stores a bit into X memory", function() {
		vmem.store('X100', true);
		expect(vmem.memory.V40404).to.equal(1);
	});
	it ("Stores a bit alias into X memory", function() {
		vmem.store('XTEST1', true);
		expect(vmem.memory.V40404).to.equal(2);
	});
	it ("Retrieves a bit from X memory", function() {
		vmem.memory.V40404 = 1;
		expect(vmem.retrieve('X100')).to.equal(true);
	});
	it ("Retrieves a bit alias from X memory", function() {
		vmem.memory.V40404 = 2;
		expect(vmem.retrieve('XTEST1')).to.equal(true);
	});

	it ("Stores a bit into Y memory", function() {
		vmem.store('Y100', true);
		expect(vmem.memory.V40504).to.equal(1);
	});
	it ("Stores a bit alias into Y memory", function() {
		vmem.store('YTEST1', true);
		expect(vmem.memory.V40504).to.equal(4);
	});
	it ("Retrieves a bit from Y memory", function() {
		vmem.memory.V40504 = 1;
		expect(vmem.retrieve('Y100')).to.equal(true);
	});
	it ("Retrieves a bit alias from Y memory", function() {
		vmem.memory.V40504 = 4;
		expect(vmem.retrieve('YTEST1')).to.equal(true);
	});

	it ("Stores a bit into T memory", function() {
		vmem.store('T100', true);
		expect(vmem.memory.V41104).to.equal(1);
	});
	it ("Stores a bit alias into T memory", function() {
		vmem.store('TTEST1', true);
		expect(vmem.memory.V41104).to.equal(8);
	});
	it ("Retrieves a bit from T memory", function() {
		vmem.memory.V41104 = 1;
		expect(vmem.retrieve('T100')).to.equal(true);
	});
	it ("Retrieves a bit alias from T memory", function() {
		vmem.memory.V41104 = 8;
		expect(vmem.retrieve('TTEST1')).to.equal(true);
	});

	it ("Stores a bit into SP memory", function() {
		vmem.store('SP100', true);
		expect(vmem.memory.V41204).to.equal(1);
	});
	it ("Stores a bit alias into SP memory", function() {
		vmem.store('SPTEST1', true);
		expect(vmem.memory.V41204).to.equal(16);
	});
	it ("Retrieves a bit from SP memory", function() {
		vmem.memory.V41204 = 1;
		expect(vmem.retrieve('SP100')).to.equal(true);
	});
	it ("Retrieves a bit alias from SP memory", function() {
		vmem.memory.V41204 = 16;
		expect(vmem.retrieve('SPTEST1')).to.equal(true);
	});
});
