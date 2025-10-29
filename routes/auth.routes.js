const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Comments = require("../model/Comments");

// Đăng ký
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// add comments
router.post("/addcomment", async (req, res) => {
  const { movieId, userId, username, content } = req.body;

  try {
    if (!movieId  || !userId || !username || !content) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const newComment = new Comments({ movieId, userId, username, content });
    await newComment.save();

    res.status(201).json({ message: "Bình luận đã được thêm", comment: newComment });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// get comments by movies
router.get("/getcomments", async (req, res) => {
  const { movieId  } = req.query;

  try {
    if (!movieId) {
      return res.status(400).json({ message: "Thiếu movieId" });
    }

    const comments = await Comments.find({ movieId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
