const mongoose = require("mongoose")
const Schema = mongoose.Schema

/* Apartment Schema */
const sensor_schema = new Schema({
    ondo:Number,
    heart: Number,
    breath: Number,
    motion: Number,
    created_at: String
})

const sensor = mongoose.model("sensor", sensor_schema, "sensor")

/* Export Models */
module.exports = {
    sensor: sensor
}
