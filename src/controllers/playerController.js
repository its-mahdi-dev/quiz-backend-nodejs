const { where } = require("sequelize");
const { User, Question, UserAnswer, Category } = require("../models");

exports.getPlayerInfo = async (req, res) => {
  let user_id = req.params.id;
  let user = User.findOne({
    where: { id: user_id },
    attributes: ["id", "first_name", "last_name", "email", "score"],
  });

  let answers = UserAnswer.findAll({
    where: { user_id },
    include: [
      {
        model: Question,
        as: "question",
        attributes: [
          "user_id",
          "category_id",
          "body",
          "correct_answer_id",
          "duration",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name"],
          },
          {
            model: Category,
            as: "category",
          },
        ],
      },
    ],
  });
  return res.status(200).json(answers);
  let new_answers = answers.map((answer) => answer.toJSON());

};
