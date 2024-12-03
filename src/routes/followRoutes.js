const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");

router.get("/followers", followController.getFollwers);
router.get("/following", followController.getFollowings);
router.post("follow/:id", followController.follow);
router.post("unfollow/:id", followController.unFollow);
module.exports = router;
