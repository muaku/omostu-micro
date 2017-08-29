const SerialPort = require('serialport');
const fs = require("fs")
/* Mac Or Raspi */
const portNumber = (process.platform == "darwin") ? '/dev/tty.usbserial-A1044Y1Q' : '/dev/ttyUSB0'
const port = new SerialPort(portNumber, {
	baudRate: 115200
}, function(err) {
	if(err) {
		return console.log("Cant open port with Error: ", err.message)
	}
})

const PRE = Buffer.from([0x80, 0x00, 0x80, 0x00,0x80, 0x00,0x80, 0x00]);
console.log(PRE)

/* READ data */
var buffer = ''
var i = 1	// the first on of datas is empty
port.on("data", function(chunk) {
	buffer += chunk
	var datas = buffer.split(PRE)
	console.log(chunk)
	console.log(datas.length)
	
	if(datas.length > 1) {	// First chunk, datas.length=2
		console.log(datas)
		i++
		//extractData(chunk)
		//buffer = datas.pop()		// remove finished data
	}

})

/* EXTRACT data */
const extractData = function(data) {
	console.log(data)
	//writeToFile(data)
}

/* WRITE to file */
const writeToFile = function(data) {
	fs.writeFile("micro-log.txt", data, (err) => {
		if(err) throw err
		console.log("Writed to File")
	})
}