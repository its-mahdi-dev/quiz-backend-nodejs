const { where, Op,fn } = require("sequelize");
const sequelize = require("sequelize");
const { Question, UserAnswer, User, Category } = require("../models");

exports.getPlayerQuestions = async (req, res) => {
  let user_answers = await UserAnswer.findAll({
    where: {
      user_id: req.user.id,
    },
    include: [{ model: Question, as: "question" }],
  });

  let questions = [];
  await user_answers.forEach((answer) => {
    let question = answer.question;
    questions.push(question);
  });
  return res.status(200).json(questions);
};

exports.getPlayersQuestion = async (req, res) => {
  let players = await User.findAll({
    attributes: ["id", "first_name", "last_name", "score"],
    where: { type: "player" },
  });
  let new_players = players.map((player) => player.toJSON());
  for (let i = 0; i < new_players.length; i++) {
    new_players[i].wrong_answers = 0;
    new_players[i].correct_answers = 0;

    let user_answers = await UserAnswer.findAll({
      where: {
        user_id: new_players[i].id,
      },
      include: [{ model: Question, as: "question" }],
    });

    user_answers.forEach((ans) => {
      if (ans.answer_id === ans.question.correct_answer_id)
        new_players[i].correct_answers++;
      else new_players[i].wrong_answers++;
    });
  }

  return res
    .status(200)
    .json({ new_players, nee: new_players[2]?.correct_answers });
};

exports.getSingleQuqestion = async (req, res) => {
  let question_id = req.params.question_id;
  let question = await Question.findOne({
    where: { id: question_id },
    include: [{ model: Category, as: "category" }],
    attributes: [
      "id",
      "body",
      "start_time",
      "end_time",
      "duration",
      "category_id",
    ],
  });
  return res.status(200).json(question);
};

exports.getRandomQuestion = async (req, res) => {
  let user_id = req.user.id;
  const now = new Date();

  const answeredQuestionIds = await UserAnswer.findAll({
    where: { user_id },
    attributes: ["question_id"],
    raw: true,
  }).then((records) => records.map((record) => record.questionId));

  const question = await Question.findOne({
    where: {
      id: { [Op.notIn]: answeredQuestionIds },
      start_time: { [Op.lt]: now },
      end_time: { [Op.gt]: now },
    },
    order: fn('RAND'),
  });

  return res.status(200).json(question);
};
