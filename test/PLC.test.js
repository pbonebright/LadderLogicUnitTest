process.env.NODE_ENV = 'test';
//var Promise = require('bluebird');

var chai = require('chai');
var expect  = require("chai").expect;
var sinon = require('sinon');

var VMEM = require('../lib/Memory.js').Memory;
var PLC = require('../lib/PLC.js').PLC;

var vmem, plc;
describe("PLC Processor", function() {
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
		plc = new PLC({vmem:vmem});
	});
	it ("TMR", function() {
		plc.bstack[0] = true;
		plc.step(['TMR', 'TTEST1', 'K2']);
		expect(vmem.retrieve('V103')).to.equal(1);
		expect(vmem.retrieve('TTEST1')).to.equal(false);
		plc.step(['TMR', 'TTEST1', 'K2']);
		expect(vmem.retrieve('V103')).to.equal(2);
		expect(vmem.retrieve('TTEST1')).to.equal(true);
		plc.bstack[0] = false;
		plc.step(['TMR', 'TTEST1', 'K2']);
		expect(vmem.retrieve('V103')).to.equal(0);
		expect(vmem.retrieve('TTEST1')).to.equal(false);
	});

	it ("BCD", function() {
		plc.istack[0] = 1234;
		plc.step(['BCD']);
		expect(plc.istack[0]).to.equal(0x1234);
	});

	it ("STR", function() {
		vmem.store('CTEST1',true);
		plc.step(['STR', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		vmem.store('CTEST1',false);
		plc.step(['STR', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		vmem.store('VTEST1', 0x100);
		plc.step(['STR', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(true);
		plc.step(['STR', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(false);
	});

	it ("STRN", function() {
		vmem.store('CTEST1',true);
		plc.step(['STRN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		vmem.store('CTEST1',false);
		plc.step(['STRN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		vmem.store('VTEST1', 0x100);
		plc.step(['STRN', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(false);
		plc.step(['STRN', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(true);
	});

	it ("STRE", function() {
		vmem.store('VTEST1', 0x100);
		plc.step(['STRE', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(false);
		plc.step(['STRE', 'VTEST1', 'K100']);
		expect(plc.bstack[0]).to.equal(true);
	});

	it ("AND", function() {
		plc.bstack[0] = true;
		vmem.store('CTEST1',true);
		plc.step(['AND', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('CTEST1',true);
		plc.step(['AND', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		vmem.store('CTEST1',false);
		plc.step(['AND', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = false;
		vmem.store('CTEST1',false);
		plc.step(['AND', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		vmem.store('VTEST1', 0x100);
		plc.step(['AND', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = true;
		plc.step(['AND', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = false;
		vmem.store('VTEST1', 0x100);
		plc.step(['AND', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = false;
		plc.step(['AND', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(false);
	});

	it ("ANDN", function() {
		plc.bstack[0] = true;
		vmem.store('CTEST1',true);
		plc.step(['ANDN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = false;
		vmem.store('CTEST1',true);
		plc.step(['ANDN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		vmem.store('CTEST1',false);
		plc.step(['ANDN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('CTEST1',false);
		plc.step(['ANDN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		vmem.store('VTEST1', 0x100);
		plc.step(['ANDN', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		plc.step(['ANDN', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		plc.step(['ANDN', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = false;
		plc.step(['ANDN', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(false);
	});

	it ("OR", function() {
		plc.bstack[0] = true;
		vmem.store('CTEST1',true);
		plc.step(['OR', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('CTEST1',true);
		plc.step(['OR', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = true;
		vmem.store('CTEST1',false);
		plc.step(['OR', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('CTEST1',false);
		plc.step(['OR', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		vmem.store('VTEST1', 0x100);
		plc.step(['OR', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = true;
		plc.step(['OR', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('VTEST1', 0x100);
		plc.step(['OR', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		plc.step(['OR', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(false);
	});

	it ("ORN", function() {
		plc.bstack[0] = true;
		vmem.store('CTEST1',true);
		plc.step(['ORN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('CTEST1',true);
		plc.step(['ORN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = true;
		vmem.store('CTEST1',false);
		plc.step(['ORN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('CTEST1',false);
		plc.step(['ORN', 'CTEST1']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = true;
		vmem.store('VTEST1', 0x100);
		plc.step(['ORN', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = true;
		plc.step(['ORN', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(true);
		plc.bstack[0] = false;
		vmem.store('VTEST1', 0x100);
		plc.step(['ORN', 'VTEST1', 'K99']);
		expect(plc.bstack[0]).to.equal(false);
		plc.bstack[0] = false;
		plc.step(['ORN', 'VTEST1', 'K101']);
		expect(plc.bstack[0]).to.equal(true);
	});


 //    ANDE(arg1, arg2) {
 //        var val1 = this.vmem.retrieve(arg1);
 //        var val2 = this.vmem.retrieve(arg2);
 //        this.bstack[0] = (this.bstack[0] && (val1 === val2));
	// }

 //    ORSTR(arg1, arg2) {
 //        var val1 = this.vmem.retrieve(arg1);
 //        var val2 = this.vmem.retrieve(arg2);
 //        this.bstack[0] = (this.bstack[0] || this.bstack[1]);
 //    }

 //    ORE(arg1, arg2) {
 //        var val1 = this.vmem.retrieve(arg1);
 //        var val2 = this.vmem.retrieve(arg2);
 //        this.bstack[0] = (this.bstack[0] || (val1 === val2));
 //    }

 //    XORS(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            this.istack[0] = (this.istack[0] ^ this.istack[1]) % 65536;
 //        }
 //    }

 //    OUT(arg1, arg2) {
 //        if (this.vmem.address[arg1].match(/(^SP)|^[BXYCT]/)) {
 //            this.vmem.store(arg1, this.bstack[0]);
 //        }
 //        else {
 //            if (this.bstack[0]) {
 //                this.vmem.store(arg1, this.istack[0]);
 //            }
 //        }
 //    }

 //    OUTX(arg1, arg2) {
 //        if (this.bstack[0]) {
 //            var match = this.vmem.getAddress(arg1).match(/(V)(\d+)/);
 //            var val2 = this.istack[0];
 //            var newAddr = match[1]+(parseInt(match[2],8) + val2).toString(8);
 //            this.vmem.store(arg1, this.istack[1]);
 //        }
 //    }

 //    SET(arg1, arg2) {
 //        if (this.bstack[0]) {
 //            this.vmem.store(arg1, true);
 //        }
 //    }

 //    RST(arg1, arg2) {
 //        if (this.bstack[0]) {
 //            this.vmem.store(arg1, false);
 //        }
 //    }

 //    LD(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
 //            this.istack[1] = this.istack[0];
 //            this.istack[0] = val1;
 //        }
 //    }

 //    LDF(arg1, arg2) {
 //        if (this.bstack[0]) {
 //            var val1 = this.vmem.retrieve(arg1);
 //            val1 = 11;
 //            var val2 = parseInt(this.vmem.retrieve(arg2),16);
 //            var val3 = 0;
 //            for (let i=0; i<val2; i++) {
 //                if (val1 & (1<<i)) {
 //                    val3 += 1<<i;
 //                }
 //            }
 //            this.istack[1] = this.istack[0];
 //            this.istack[0] = val3;
 //        }
 //    }

 //    INCB(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            val1++;
 //            this.vmem.store(arg1, val1)
 //        }
 //    }

 //    DECB(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            val1--;
 //            this.vmem.store(arg1, val1);
 //        }
 //    }

 //    ADDB(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            this.istack[0] += val1;
 //        }
 //    }

 //    SUBB(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            this.istack[0] -= val1;
 //        }
 //    }

 //    MULB(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            this.istack[0] *= val1;
 //        }
 //    }

 //    DIVB(arg1, arg2) {
 //        if (this.bstack[0]) {
	//         var val1 = this.vmem.retrieve(arg1);
	//         var val2 = this.vmem.retrieve(arg2);
 //            if (val1 != 0) {
 //                this.istack[0] = parseInt(this.istack[0]/val1);
 //            }
 //            else {
 //                this.istack[0] = 65535;
 //            }
 //        }
 //    }

});
