class Memory {
    constructor(options) {
        this.address = options.address;
        this.memory = {};
    }

    getAddress(alias) {
        if (alias === undefined || alias === '') {
            return undefined;
        }
        if (alias in this.address) {
            return this.address[alias];
        }
        if (alias.match(/^(SP|[PKVBXYCT])[0-9A-Fa-f]{1,5}/)) {
            return alias;
        }
        console.log('warning: cannot find address for ' + alias);
        return undefined;
    }

    retrieve(alias) {
        if (alias === undefined || alias === '') {
            return undefined;
        }
        var address = this.getAddress(alias);
        if (address === undefined) {
            console.log('warning: cannot find address for ' + alias);
            return undefined;
        }
        var n,match;
        if (address.match(/^K[0-9A-Fa-f]{1,4}/)) {
            return parseInt('0x' + alias.substr(1));
        }
        if (address[0] === "P") {
            address = "V" + this.retrieve("V" + address.substr(1)).toString(8);
        }
        if (address[0] === "V") {
            if (! (address in this.memory)) {
                this.memory[address] = 0;
            }
            return this.memory[address];
        }
        else if (address[0] === "B") {
            var match = address.match(/B(\d+)\.(\d+)/);
            if (match) {
                address = "V" + match[1];
                var value = this.retrieve(address);
                return (value & (1<<match[2])) ? true:false;
            }
            else {
                this.memory[address] = 0;
                return false;
            }
        }
        else if (match = address.match(/(^SP|^[XYCT])([0-9]{1,5})/)) {
            n = {X:0o40400, Y:0o40500, C:0o40600, T:0o41100, SP:0o41200}[match[1]] + parseInt(parseInt(match[2],8)/16)
            address = 'B' + n.toString(8) + '.' + (parseInt(match[2],8) % 16).toString();
            return this.retrieve(address);
        }
        return null;
    }

    store(alias, val1) {
        var address = this.getAddress(alias);
        if (address === undefined) {
            return undefined;
        }
        var match,n;
        if (address[0] === "P") {
            address = "V" + this.retrieve("V" + address.substr(1)).toString(8);
        }
        if (address[0] === "V") {
            this.memory[address] = val1;
        }
        else if (address[0] === "B") {
            var match = address.match(/B(\d+)\.(\d+)/);
            if (match) {
                address = "V" + match[1];
                var currentValue = this.retrieve(address);
                if (val1) {
                    this.store(address, currentValue | (1<<match[2]));
                }
                else {
                    this.store(address, currentValue & ~(1<<match[2]));
                }
            }
        }
        else if (match = address.match(/(^SP|^[XYCT])([0-9]{1,5})/)) {
            n = {X:0o40400, Y:0o40500, C:0o40600, T:0o41100, SP:0o41200}[match[1]] + parseInt(parseInt(match[2],8)/16)
            address = 'B' + n.toString(8) + '.' + (parseInt(match[2],8) % 16).toString();
            this.store(address, val1);
        }
    }

    initialize() {
        Object.keys(this.address).forEach(function(alias) {
            let address = self.address[alias];
            if (address.match(/(^SP)|^[BXYCT]/)) {
                self.store(alias, false);
            }
            else {
                self.store(alias, 0);
            }
        });
    }

    loadJson(json) {
        this.memory = JSON.parse(json);
    }

    dumpJson() {
        return JSON.stringify(this.memory)
    }
}

module.exports = {
    'Memory':Memory,
};
