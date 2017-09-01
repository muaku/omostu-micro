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
var DATA_TO_FLUENTD = {}

/* FLUENTD CONFIG */
fluentd.configure("microsensor", {
	host: "localhost",
	port: 24224,
	timeout: 3.0,
	reconnectInterval: 600000	// 10 min
})

/* OPEN PORT ON MAC OR RASPI */
const portNumber = (process.platform == "darwin") ? '/dev/tty.usbserial-A1044Y1Q' : '/dev/ttyUSB0'
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
	
	// data[1] is perfect buffer, around 30-50ms
	if(datas.length > 2) {
		extractData(datas[1])
		buffer = Buffer.from([])		// clear buffer
	}
})

/* EXTRACT data */
const extractData = function(data) {
	 var type = data.readUIntBE(0,1)	// GET type
	
	 if(type === 1) {
		var heart = data.slice(TYPE1.HEART.FROM_INDEX, TYPE1.HEART.TO_INDEX ).readInt16BE()
		var breath = data.slice(TYPE1.BREATH.FROM_INDEX, TYPE1.BREATH.TO_INDEX ).readInt16BE()

		/* DATA TO PASS TO Fluentd */
		DATA_TO_FLUENTD = {
			heart: heart,
			breath: breath
		}
	 }
}

/* RUN EVERY 5 SEC */
var Job = new CronJob('*/5 * * * * *', function() {
	console.log("RUN EVERY 5 SEC ", Date())
	console.log("DATA_TO_FLUENTD: ", DATA_TO_FLUENTD)
	fluentd.emit("data", DATA_TO_FLUENTD)
	console.log("*----------------------------------------------* ")
}).start()
