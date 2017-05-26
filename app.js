var Promise = require('bluebird');
var fs = require('fs');

var fileContents = readProgram();
fileContents.alias._FirstScan = 'SP0';
fileContents.alias._On = 'SP1';
fileContents.alias._1Second = 'SP2';

var PLC = require('./lib/PLC.js').PLC;
var VMEM = require('./lib/Memory.js').Memory;
var MODBUS = require('./lib/Modbus.js').Modbus;

var vmem = new VMEM({address:fileContents.alias});
vmem.loadJson(fs.readFileSync('./data/setup.json'));
var plc = new PLC(({vmem:vmem, program:fileContents.program}));
var modbus = new MODBUS({vmem:vmem, host:'127.0.0.1', port:502});
console.log('RUNNING');
vmem.store('X20', true);
plc.start();

function readProgram() {
    var rawprogram = fs.readFileSync('./data/listing.txt');
    rawprogram = rawprogram.toString().split('\n');
    var program = [];
    rawprogram.some(function(line) {
        line = line.replace(/[\"\n]/g, '');
        symbols = line.split(/\s+/);
        if (symbols[0] !== '') {
            program.push(symbols);
        }
        return symbols[0] === 'END';
    });
    program.shift();
    var alias = [];
    rawprogram.some(function(line) {
        return line.match(/BEGIN ELEMENT_DOC/);
    });

    rawprogram.some(function(line) {
        line = line.replace(/[\"\n]/g, '');
        symbols = line.split(/,/);
        if (symbols[0] !== '') {
            alias[symbols[1]] = symbols[0];
        }
        return symbols[0] === '#END';
    });
    return {program:program, alias:alias};
}

function save() {
    return new Promise(function (resolve, reject) {
        fs.writeFile('./data/memory.json', vmem.dumpJson(), 'utf8', function(err) {
            if (!err) {
                resolve(true);
            }
            else {
                console.log("error writing mem file");
                reject(false);
            }
        });
    });
}

function shutdown(e) {
    plc.pause();
    console.log('EXIT CODE: ' + e);
    save()
    .then(function(e) {
        process.exit(e + 128);
    });
}

process.on('SIGINT', function() {
    shutdown(2);
});

process.on('SIGTERM', function() {
    shutdown(15);
});
