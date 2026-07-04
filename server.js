require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET belum didefinisikan pada file .env.');
}

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI belum didefinisikan pada file .env.');
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
  });
});