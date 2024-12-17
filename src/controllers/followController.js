const { where } = require("sequelize");
const {Follow} = require("../models");

exports.getFollwers = async (req, res) => {
  let user_id = req.body.user_id ? req.body.user_id : req.user.id;
  let follwers = await Follow.findAll({
    where: { follower_id: user_id },
  });
  return res.status(200).json(follwers);
};

exports.getFollowings = async (req, res) => {
  let user_id = req.body.user_id ? req.body.user_id : req.user.id;
  let followings = await Follow.findAll({
    where: { following_id: user_id },
  });
  return res.status(200).json(followings);
};

exports.follow = async (req, res) => {
  let user_id = req.params.id;
  await Follow.create({
    following_id: req.user.id,
    follower_id: user_id,
  });
  return res.status(200).json({ message: "انجام شد" });
};

exports.unFollow = async (req, res) => {
  let user_id = req.params.id;
  await Follow.findOne({
    where: { following_id: req.user.id, follower_id: user_id },
  }).delete();

  return res.status(200).json({ message: "انجام شد" });
};
