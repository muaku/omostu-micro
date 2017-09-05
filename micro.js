const SerialPort = require('serialport');
const fs = require("fs")
const fluentd = require('fluent-logger');
const bsplit = require('buffer-split')
var CronJob = require('cron').CronJob;

/* DEFINE */
const PRE = Buffer.from([0x80, 0x00, 0x80, 0x00,0x80, 0x00,0x80, 0x00]);
const TYPE1 = {
	VAL: 1,
	LEN: 18,
	DATA_LEN: 6,
	/* INDEX AFTER REMOVING 'PRE' BUFFER */
	HEART: {
		FROM_INDEX: 2,
		TO_INDEX: 4
	},
	BREATH: {
		FROM_INDEX: 4,
		TO_INDEX: 6
	}	
}
const TYPE2 = {
	VAL: 2,
	LEN: 14,
	DATA_LEN: 2,
	/* INDEX AFTER REMOVING 'PRE' BUFFER */
	DATA_START_INDEX: 2,
	DATA_END_INDEX: 3
}
const TYPE3 = {
	VAL: 2,
	LEN: 14,
	DATA_LEN: 2,
	/* INDEX AFTER REMOVING 'PRE' BUFFER */
	DATA_START_INDEX: 2,
	DATA_END_INDEX: 3
}
const TYPE9 = {
	VAL: 2,
	LEN: 14,
	DATA_LEN: 2,
	/* INDEX AFTER REMOVING 'PRE' BUFFER */
	DATA_START_INDEX: 2,
	DATA_END_INDEX: 4
}
const TYPE10 = {
	VAL: 2,
	LEN: 14,
	DATA_LEN: 2,
	/* INDEX AFTER REMOVING 'PRE' BUFFER */
	DATA_START_INDEX: 2,
	DATA_END_INDEX: 3
}

 /* DATA TO PASS TO Fluentd */
var DATA_TO_FLUENTD = {}

/* FLUENTD CONFIG */
fluentd.configure("microsensor", {
	host: "localhost",
	port: 24224,
	timeout: 3.0,
	reconnectInterval: 600000	// 10 min
})

/* OPEN PORT ON MAC OR RASPI */
const portNumber = (process.platform == "darwin") ? '/dev/tty.usbserial-A1044Y1Q' : '/dev/ttyUSB1'
const port = new SerialPort(portNumber, {
	baudRate: 115200
}, function(err) {
	if(err) {
		return console.log("Cant open port with Error: ", err.message)
	}
})

/* READ data */
var buffer = Buffer.from([])
port.on("data", function(chunk) {
	buffer = Buffer.concat([buffer, chunk])
	var datas = bsplit(buffer,PRE)
	
	// datas[0] is empty 
	if(datas.length > 2) {
		extractData(datas[1])	// should use child process
	}
})

/* EXTRACT data */
const extractData = function(data) {
	 var type = data.readUIntBE(0,1)	// GET type

	 switch(type) {
		 case 1:
			buffer = buffer.slice(TYPE1.LEN)
			break
		 case 2:
			buffer = buffer.slice(TYPE2.LEN)
			var heart = data.readUIntBE(TYPE2.DATA_START_INDEX, 1)	// Read 1 byte
			DATA_TO_FLUENTD["heart"] = heart
			break
		 case 3:
			buffer = buffer.slice(TYPE3.LEN)
			var breath = data.readUIntBE(TYPE3.DATA_START_INDEX, 1)
			DATA_TO_FLUENTD["breath"] = breath
			break
		 case 9:
			  buffer = buffer.slice(TYPE9.LEN)
			break
		 case 10:
			  buffer = buffer.slice(TYPE10.LEN)
			break
		 default:
		  	console.log("TYPE is out of range")
	 }
}

/* RUN EVERY 10 SEC */
var Job = new CronJob('*/10 * * * * *', function() {
	console.log("RUN EVERY 10 SEC ", Date())
	// IF there is data then send it to fluentd
	if(typeof(DATA_TO_FLUENTD["heart"]) != "undefined" & typeof(DATA_TO_FLUENTD["breath"]) != "undefined"){
		console.log("DATA_TO_FLUENTD: ", DATA_TO_FLUENTD)
		fluentd.emit("micro", DATA_TO_FLUENTD)
		console.log("*----------------------------------------------* ")
	}
}).start()
