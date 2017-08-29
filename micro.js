var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200
}, function(err) {
	if(err) {
		return console.log("Cant open port with Error: ", err.message)
	}
})

/* READ data */
port.on("data", function(data) {
	console.log("Data: ", data)
})

