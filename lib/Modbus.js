var Promise = require('bluebird');
var net = require('net');
var struct = require('python-struct');

class Modbus {
    constructor(options) {
        var self = this;
        this.vmem = options.vmem;
        this.server = net.createServer();
        this.server.on('connection', function(socket) {
//          console.log('CONNECTED');
            self.socket = socket;
            socket.on('data', self.serviceRequest.bind(self));
            socket.on('close', function() {
//          console.log('BYE');
            });
        });
        this.server.listen(options.port, options.host);
    }

    destroy() {
        var self = this;
        return new Promise.fromCallback(function(cb) {
            self.server.close(cb);
        });
    }

    serviceRequest(request) {
        var command = struct.unpack('>HHHBBHH', request.slice(0,12));
        var daddr, oaddr, vaddr, n, data;
        if (command[4] === 16) { // get commands from GUI
            n = 1 + command[6] * 2;
            data = struct.unpack('>B' + 'H'.repeat(command[6]), request.slice(12));
            data.shift();
            daddr = command[5]
            for (var i=0;i<command[6];i++) {
                oaddr = (daddr + i).toString(8);
                vaddr = "V" + oaddr;
                this.vmem.memory[vaddr] = data[i];
            }
            this.socket.write('OK----------');
        }
        else if (command[4] === 3) { // send data to GUI
            daddr = command[5];
            var valuelist = [];
            for (var i=0;i<command[6];i++) {
                oaddr = (daddr + i).toString(8);
                vaddr = "V" + oaddr;
                valuelist.push(this.vmem.memory[vaddr] % 0xFFFF);
            }
            this.socket.write(struct.pack(
                '>BBBBBBBBB' + 'H'.repeat(command[6]), 
                Array(9).fill(0).concat(valuelist))
            );
        }
        else {
            this.socket.write('Unrecognized');
        }
    }
}

module.exports = {
    'Modbus':Modbus
};
