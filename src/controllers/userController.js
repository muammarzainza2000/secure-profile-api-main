const User = require('../data/users');

async function getMe(req, res) {
  return res.status(200).json({ success: true, data: req.user });
}

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({}, '-passwordHash');
    const data = users.map((user) => user.toPublicJSON());
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function getUserCount(req, res, next) {
  try {
    const count = await User.countDocuments();
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    return next(error);
  }
}

async function adminGetAllDetails(req, res, next) {
  try {
    const users = await User.find({}, '-passwordHash');
    const data = users.map((user) => user.toPublicJSON());
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getMe, getAllUsers, getUserCount, adminGetAllDetails };