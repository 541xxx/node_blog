const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/one_for_all';
mongoose.Promise = global.Promise;

mongoose.connect(uri, {useMongoClient: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log('connected!');
});