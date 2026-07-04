const mongoose = require('mongoose');

async function connectTestDB() {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/secure-profile-api-test');
}

async function disconnectTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

module.exports = { connectTestDB, disconnectTestDB };