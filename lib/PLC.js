class PLC {
    constructor(options) {
        this.istack = [0, 0];
        this.bstack = [false, false];
        this.powerrail = true;
        this.trace = false;
        this.vmem = options.vmem;
        this.program = options.program;
        this.vmem.store('SP0', true);
        this.vmem.store('SP1', true);
        this.scanCount = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        this.run()
    }

    pause() {
        this.running = false;
    }

    run() {
        var self = this;
        this.scan(1);
        if (this.running) {
            setImmediate(function() {
                self.run();
            });
        }
    }

    scan(n) {
        for (let i=0; i<n; i++) {
            var self = this;
            if ((this.scanCount % 11) < 5) {
                this.vmem.store('SP2', true);
            }
            this.program.forEach(function(instruction) {
                self.step(instruction);
            });
            this.scanCount++;
            this.vmem.store('SP0', false);
            this.vmem.store('SP2', false);
        }
    }

    step(instruction) {
        var token, arg1, arg2;
        token = instruction[0];
        arg1 = instruction[1];
        arg2 = instruction[2];
        if (this.powerrail || token == "MLS" || token == "MLR") {
            this[token](arg1, arg2);
            this.vmem.store('SP70', (this.istack[0] < 0))
            if (this.trace) {
                var val1,val2;
                if (arg1 === undefined) {
                    arg1 = "None";
                    val1 = undefined;
                }
                else {
                    val1 = this.vmem.retrieve(arg1);
                }
                if (arg2 === undefined) {
                    arg2 = "None";
                    val2 = undefined;
                }
                else {
                    val2 = this.vmem.retrieve(arg2);
                }
                console.log(`${token} ${arg1}:${val1} ${arg2}:${val2} := ${this.bstack[0]}, ${this.istack[0]}`);
            }
        }
    }

    start_trace() {
        this.trace = true;
    }

    stop_trace() {
        this.trace = false;
    }

    STR(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        this.bstack[1] = this.bstack[0];
        if (val2 === undefined) {
            this.bstack[0] = val1;
        }
        else {
            val1 = val1 < 0 ? 65536+val1 : val1;
            val2 = val2 < 0 ? 65536+val2 : val2;
            this.bstack[0] = (val1 >= val2);
        }
    }

    STRN(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        this.bstack[1] = this.bstack[0]
        if (val2 === undefined) {
            this.bstack[0] = !val1;
        }
        else {
            val1 = val1 < 0 ? 65536+val1 : val1;
            val2 = val2 < 0 ? 65536+val2 : val2;
            this.bstack[0] = (val1 < val2);
        }
    }

    STRE(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        this.bstack[1] = this.bstack[0];
        this.bstack[0] = (val1 === val2);
    }

    AND(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        if (val2 !== undefined) {
            this.bstack[0] = (this.bstack[0] && (val1 >= val2));
        }
        else {
            this.bstack[0] = (this.bstack[0] && val1);
        }
    }

    ANDN(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        if (val2 !== undefined) {
            this.bstack[0] = (this.bstack[0] && (val1 < val2));
        }
        else {
            this.bstack[0] = (this.bstack[0] && !val1);
        }
    }

    OR(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        if (val2 !== undefined) {
            this.bstack[0] = (this.bstack[0] || (val1 >= val2));
        }
        else {
            this.bstack[0] = (this.bstack[0] || val1);
        }
    }

    ORN(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        if (val2 !== undefined) {
            this.bstack[0] = (this.bstack[0] || (val1 < val2));
        }
        else {
            this.bstack[0] = (this.bstack[0] || (!val1));
        }
    }

    ANDE(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        this.bstack[0] = (this.bstack[0] && (val1 === val2));
    }

    ORSTR(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        this.bstack[0] = (this.bstack[0] || this.bstack[1]);
    }

    ORE(arg1, arg2) {
        var val1 = this.vmem.retrieve(arg1);
        var val2 = this.vmem.retrieve(arg2);
        this.bstack[0] = (this.bstack[0] || (val1 === val2));
    }

    XORS(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            this.istack[0] = (this.istack[0] ^ this.istack[1]) % 65536;
        }
    }

    OUT(arg1, arg2) {
        if (this.vmem.address[arg1].match(/(^SP)|^[BXYCT]/)) {
            this.vmem.store(arg1, this.bstack[0]);
        }
        else {
            if (this.bstack[0]) {
                this.vmem.store(arg1, this.istack[0]);
            }
        }
    }

    OUTX(arg1, arg2) {
        if (this.bstack[0]) {
            var match = this.vmem.getAddress(arg1).match(/(V)(\d+)/);
            var val2 = this.istack[0];
            var newAddr = match[1]+(parseInt(match[2],8) + val2).toString(8);
            this.vmem.store(arg1, this.istack[1]);
        }
    }

    SET(arg1, arg2) {
        if (this.bstack[0]) {
            this.vmem.store(arg1, true);
        }
    }

    RST(arg1, arg2) {
        if (this.bstack[0]) {
            this.vmem.store(arg1, false);
        }
    }

    LD(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            this.istack[1] = this.istack[0];
            this.istack[0] = val1;
        }
    }

    LDF(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            val1 = 11;
            var val2 = parseInt(this.vmem.retrieve(arg2),16);
            var val3 = 0;
            for (let i=0; i<val2; i++) {
                if (val1 & (1<<i)) {
                    val3 += 1<<i;
                }
            }
            this.istack[1] = this.istack[0];
            this.istack[0] = val3;
        }
    }

    INCB(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            val1++;
            this.vmem.store(arg1, val1)
        }
    }

    DECB(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            val1--;
            this.vmem.store(arg1, val1);
        }
    }

    ADDB(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            this.istack[0] += val1;
        }
    }

    SUBB(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            this.istack[0] -= val1;
        }
    }

    MULB(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            this.istack[0] *= val1;
        }
    }

    DIVB(arg1, arg2) {
        if (this.bstack[0]) {
            var val1 = this.vmem.retrieve(arg1);
            var val2 = this.vmem.retrieve(arg2);
            if (val1 != 0) {
                this.istack[0] = parseInt(this.istack[0]/val1);
            }
            else {
                this.istack[0] = 65535;
            }
        }
    }

    BCD(arg1, arg2) {
        this.istack[0] = parseInt(this.istack[0],16);
    }

    TMR(arg1, arg2) {
        var timerAddress = 'V' + this.vmem.getAddress(arg1).substr(1);
        if (this.bstack[0]) {
            var currentValue = this.vmem.retrieve(timerAddress) + 1;
            var setpoint = parseInt(this.vmem.retrieve(arg2).toString(16));
            this.vmem.store(timerAddress, currentValue);
            if (currentValue >= setpoint) {
                this.vmem.store(arg1, true);
                this.vmem.store(timerAddress, setpoint);
            }
            else {
                this.vmem.store(arg1, false);
                this.vmem.store(timerAddress, currentValue);
            }
        }
        else {
            this.vmem.store(arg1, false);
            this.vmem.store(timerAddress, 0);
        }
    }

    MLS(arg1, arg2) {
        if (this.bstack[0]) {
            this.powerrail = true;
        }
        else {
            this.powerrail = false;
        }
    }

    MLR(arg1, arg2) {
        this.powerrail = true;
    }

    END(arg1, arg2) {
        //
    }
}

module.exports = {
    'PLC':PLC,
};
