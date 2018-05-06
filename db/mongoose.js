"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise
mongoose
    .connect(`${config.mongodb.uri}/${config.mongodb.dbname}`)
    .then(() => console.log(`Connected to ${config.mongodb.dbname}`))
    .catch((e) => console.log(e));

module.exports = mongoose