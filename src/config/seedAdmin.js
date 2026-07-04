require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../data/users');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB terhubung...');

    const existingAdmin = await User.findOne({ email: 'admin@unas.ac.id' });
    if (existingAdmin) {
      console.log('Admin sudah ada, skip seeding.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('Admin123', 10);
    await User.create({
      name: 'Admin UNSIA',
      email: 'admin@unas.ac.id',
      passwordHash,
      role: 'admin',
    });

    console.log('Akun admin berhasil dibuat!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding gagal:', error.message);
    process.exit(1);
  }
}

seedAdmin();