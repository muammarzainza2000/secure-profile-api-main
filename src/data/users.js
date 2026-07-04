const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama wajib diisi.'],
      trim: true,
      minlength: [3, 'Nama harus terdiri dari 3-50 karakter.'],
      maxlength: [50, 'Nama harus terdiri dari 3-50 karakter.'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // otomatis buat createdAt dan updatedAt
  }
);

// Pastikan passwordHash tidak pernah ikut terkirim ke client
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;