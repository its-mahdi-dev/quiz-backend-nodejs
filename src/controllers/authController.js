const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");

const secretKey = "web-2024-nodejs";

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ message: "Invalid phone" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid phone or password", user: user });
    }

    const token = jwt.sign({ id: user.id, phone: user.phone, type:user.type }, secretKey, {
      expiresIn: "5h",
    });

    return res.json({ token , type: user.type });
  } catch (error) {
    console.error("Error logging in:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.signup = async (req, res) => {
  const { first_name, last_name, phone, email, password, type } = req.body;

  try {
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number is already registered" });
    }

    const user = await User.create({
      first_name,
      last_name,
      phone,
      email,
      password,
      type,
    });

    const token = jwt.sign({ id: user.id, phone: user.phone , type:user.type }, secretKey, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
