const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'secret_key_123'; // Lưu .env thực tế

// Đăng ký
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) return res.status(400).json({ msg: 'Email đã tồn tại' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ msg: 'Đăng ký thành công' });
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Email không tồn tại' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Mật khẩu không đúng' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

  res.json({ token, user: { id: user._id, email: user.email } });
});

module.exports = router;
