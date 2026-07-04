const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../data/users');
const generateToken = require('../utils/generateToken');

function validationErrorResponse(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return null;
  return res.status(422).json({
    success: false,
    message: 'Data yang dikirim belum valid.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

async function register(req, res, next) {
  try {
    const invalidResponse = validationErrorResponse(req, res);
    if (invalidResponse) return invalidResponse;

    const name = req.body.name.trim();
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Gunakan email lain atau login.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: newUser.toPublicJSON(),
      token: generateToken(newUser),
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const invalidResponse = validationErrorResponse(req, res);
    if (invalidResponse) return invalidResponse;

    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: user.toPublicJSON(),
      token: generateToken(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const invalidResponse = validationErrorResponse(req, res);
    if (invalidResponse) return invalidResponse;

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai.',
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah. Silakan login kembali dengan password baru.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, changePassword };