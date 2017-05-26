process.env.NODE_ENV = 'test';

var Promise = require('bluebird');
var net = require('net');
var struct = require('python-struct');

var chai = require('chai');
var expect  = require("chai").expect;
var sinon = require('sinon');

var VMEM = require('../lib/Memory.js').Memory;
var MODBUS = require('../lib/Modbus.js').Modbus;

var vmem, modbus, socket;

function setup() {
	return new Promise.fromCallback(function(cb) {
		vmem = new VMEM({address:{}});
		modbus = new MODBUS({vmem:vmem, host:'127.0.0.1', port:502});
		socket = new net.Socket();
		socket.connect(502, '127.0.0.1', cb);
	});
}

function teardown() {
	return new Promise.fromCallback(function(cb) {
		vmem = undefined;
		socket.on('close', cb);
		socket.end();
	})
	.then(modbus.destroy.bind(modbus));
}

describe("Modbus server", function() {
	it ("Receives data and stores it into V memory", function() {
		return setup()
		.then(function() {
			return new Promise(function(resolve, reject) {
				socket.on('data', resolve);
				values = [123,456,789];
				firstReg = 0o40600;
				numReg = 3;
		        socket.write(struct.pack('>HHHBBHHB' + 'H'.repeat(numReg), 0,0,7+2*numReg,0,16,firstReg,numReg,2,...values));
		    });
		})
        .then(function(data) {
			expect(vmem.retrieve('V40600')).to.equal(123);
			expect(vmem.retrieve('V40601')).to.equal(456);
			expect(vmem.retrieve('V40602')).to.equal(789);
        })
		.finally(teardown);
	});
	it ("Retrieves data from V memory and transmits it", function() {
		return setup()
		.then(function() {
			return new Promise(function(resolve, reject) {
				var startReg = 0o40600;
				var numReg = 3;
				vmem.store('V40600', 123);
				vmem.store('V40601', 456);
				vmem.store('V40602', 789);
				socket.on('data', function(data) {
					resolve(struct.unpack('>' + 'H'.repeat(numReg), data.slice(9)));
				});
	        	socket.write(struct.pack('>HHHBBHH', 0,0,6,0,3,startReg,numReg));
			})
	    })
		.then(function(data) {
			expect(data[0]).to.equal(123);
			expect(data[1]).to.equal(456);
			expect(data[2]).to.equal(789);
		})
		.finally(teardown);
	});
});
