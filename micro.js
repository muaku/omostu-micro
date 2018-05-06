// const SerialPort = require('serialport');
const fs = require("fs")
const bsplit = require('buffer-split')
const mqtt = require('mqtt')
var client = mqtt.connect('mqtt://192.168.0.24');
var CronJob = require('cron').CronJob;
require("./db/mongoose")
var sensor = require("./db/models").sensor

// /* DEFINE */
// const PRE = Buffer.from([0x80, 0x00, 0x80, 0x00,0x80, 0x00,0x80, 0x00]);
// const TYPE1 = {
//   VAL: 1,
//   LEN: 18,
//   DATA_LEN: 6,
//   /* INDEX AFTER REMOVING 'PRE' BUFFER */
//   HEART: {
//     FROM_INDEX: 2,
//     TO_INDEX: 4
//   },
//   BREATH: {
//     FROM_INDEX: 4,
//     TO_INDEX: 6
//   } 
// }
// const TYPE2 = {
//   VAL: 2,
//   LEN: 14,
//   DATA_LEN: 2,
//   /* INDEX AFTER REMOVING 'PRE' BUFFER */
//   DATA_START_INDEX: 2,
//   DATA_END_INDEX: 3
// }
// const TYPE3 = {
//   VAL: 3,
//   LEN: 14,
//   DATA_LEN: 2,
//   /* INDEX AFTER REMOVING 'PRE' BUFFER */
//   DATA_START_INDEX: 2,
//   DATA_END_INDEX: 3
// }
// const TYPE9 = {
//   VAL: 9,
//   LEN: 14,
//   DATA_LEN: 2,
//   /* INDEX AFTER REMOVING 'PRE' BUFFER */
//   DATA_START_INDEX: 2,
//   DATA_END_INDEX: 4
// }
// const TYPE10 = {
//   VAL: 10,
//   LEN: 14,
//   DATA_LEN: 2,
//   /* INDEX AFTER REMOVING 'PRE' BUFFER */
//   DATA_START_INDEX: 2,
//   DATA_END_INDEX: 4
// }

 /* DATA TO PASS TO Fluentd */
var SENSOR_DATA = {}

/* MQTT */
client.on('connect', function () {
  client.subscribe('ondo')
})
client.on('message', function (topic, message) {
  // message is Buffer
  console.log("ondo: ", message.toString())
  SENSOR_DATA["ondo"] = parseFloat(message.toString())
  /* TODO: delete these line when use microsensor */
  SENSOR_DATA["created_at"] = Date.now()
  // TODO: store data into db
  console.log("SENSOR_DATA: ", SENSOR_DATA)
  sensor.create(SENSOR_DATA, (err) => {
    if(err) console.log(err)
  })
})


// /* OPEN PORT ON MAC OR RASPI */
// const portNumber = (process.platform == "darwin") ? '/dev/tty.usbserial-A403NI9D' : '/dev/ttyUSB0'
// const port = new SerialPort(portNumber, {
//   baudRate: 115200
// }, function(err) {
//   if(err) {
//     return console.log("Cant open port with Error: ", err.message)
//   }
// })

// /* READ data */
// var buffer = Buffer.from([])
// var lenToDelete = 0
// port.on("data", function(chunk) {
//   buffer = Buffer.concat([buffer, chunk])
//   var datas = bsplit(buffer,PRE)
//   var datas_len = datas.length 
  
//   // datas[0] is empty 
//   if(datas_len > 2) {
//     lenToDelete = 0
//     for (i=1; i<= datas_len-2; i++) { // first&last elementを含まない
//       var type = datas[i].readUIntBE(0,1) // GET type
//       extractData(type, datas[i]) // should use child process
//       /* bufferの利用した分を消す */
//       if(i===datas_len-2) {
//         buffer = buffer.slice(lenToDelete)
//       }
//     }
//   }
// })

// /* EXTRACT data */
// const extractData = function(type, data) {
//    switch(type) {
//      case 1:
//       lenToDelete += TYPE1.LEN
//       break
//      case 2:
//       lenToDelete += TYPE2.LEN
//       var heart = data.readUIntBE(TYPE2.DATA_START_INDEX, 1)  // Read 1 byte
//       SENSOR_DATA["heart"] = heart
//       // fluentd.emit("heart", {"heart": heart})
//       console.log('data to fluentd HEART: ', heart)
//       break
//      case 3:
//       lenToDelete += TYPE3.LEN
//       var breath = data.readUIntBE(TYPE3.DATA_START_INDEX, 1)
//       SENSOR_DATA["breath"] = breath
//       // fluentd.emit("breath", {"breath": breath})
//       console.log('data to fluentd BREATH: ', breath)
//       break
//      case 9:
//         lenToDelete += TYPE9.LEN
//       break
//      case 10:
//       lenToDelete += TYPE10.LEN
//       var motion = data.readInt16BE(TYPE3.DATA_START_INDEX, 2)
//       SENSOR_DATA["motion"] = motion
//       console.log('motion:', motion)  
//       break
//      default:
//         console.log("TYPE is out of range")
//    }
// }

// /* RUN EVERY 1 SEC */
// var Job = new CronJob('*/1 * * * * *', function() {
//   SENSOR_DATA["created_at"] = Date.now()
//   // TODO: store data into db
//   console.log("SENSOR_DATA: ", SENSOR_DATA)
//   sensor.save(SENSOR_DATA, (err) => {
//     console.log(err)
//   })
// }).start()
