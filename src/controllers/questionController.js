const { where, Op, fn } = require("sequelize");
const sequelize = require("sequelize");
const { Question, UserAnswer, User, Category, Answer } = require("../models");

exports.getPlayerQuestions = async (req, res) => {
  let user_answers = await UserAnswer.findAll({
    where: {
      user_id: req.user.id,
    },
    include: [
      {
        model: Question,
        as: "question",
        attributes: ["category_id", "body", "correct_answer_id", "duration"],
        include: [
          { model: Category, as: "category" },
          { model: Answer, as: "answers" },
        ],
      },
      { model: Answer, as: "answer" },
    ],
  });

  return res.status(200).json(user_answers);
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

  return res.status(200).json(new_players);
};

exports.getSingleQuestion = async (req, res) => {
  let question_id = req.params.question_id;
  let answer = await UserAnswer.findOne({
    where: { question_id: question_id, user_id: req.user.id },
  });
  if (answer)
    return res
      .status(400)
      .json({ message: "شمما ثبلا به این سوال پاسخ داده اید" });

  let cache_key = "questions:" + req.user.id + ":" + question_id;
  const redisClient = require("../config/redis");
  const duration = await redisClient.get(cache_key);
  if (!duration) {
    try {
      await redisClient.set(cache_key, new Date().getTime());
    } catch (err) {
      console.error("Error setting key in Redis:", err);
    }
  }
  let question = await Question.findOne({
    where: { id: question_id },
    include: [
      { model: Category, as: "category" },
      { model: Answer, as: "answers" },
    ],
    attributes: [
      "id",
      "body",
      "start_time",
      "end_time",
      "duration",
      "category_id",
    ],
    order: [[{ model: Answer, as: "answers" }, "order", "ASC"]],
  });

  let new_question = question.toJSON();
  let new_duration = duration ? (new Date().getTime()) - duration : duration;
  new_question.duration = new_question.duration - Math.ceil(new_duration / 1000);
  console.log(new_duration)

  return res.status(200).json(new_question);
};

exports.getRandomQuestion = async (req, res) => {
  let user_id = req.user.id;
  const now = new Date();

  const answeredQuestionIds = await UserAnswer.findAll({
    where: { user_id },
    attributes: ["question_id"],
    raw: true,
  }).then((records) => records.map((record) => record.question_id));
  console.log(answeredQuestionIds, user_id);
  const question = await Question.findOne({
    where: {
      id: { [Op.notIn]: answeredQuestionIds },
      start_time: { [Op.lt]: now },
      end_time: { [Op.gt]: now },
    },
    order: fn("RAND"),
  });

  return res.status(200).json(question ? question.id : null);
};

exports.getDesignerQuestion = async (req, res) => {
  let questions = await Question.findAll({
    include: [
      { model: Category, as: "category" },
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name"],
      },
      {
        model: Answer,
        as: "answers",
      },
    ],
    order: [[{ model: Answer, as: "answers" }, "order", "ASC"]],
  });
  return res.status(200).json(questions);
};

exports.addQuestion = async (req, res) => {
  const {
    body,
    correct_answer,
    duration,
    start_time,
    end_time,
    category_id,
    answers,
  } = req.body;
  if (
    body &&
    correct_answer &&
    duration &&
    start_time &&
    end_time &&
    category_id &&
    answers
  ) {
    if (answers.length != 4)
      return res
        .status(400)
        .json({ message: "داده های ورودی معتبر نمی باشد." });
    let question = await Question.create({
      body,
      correct_answer_id: 1,
      duration,
      start_time,
      end_time,
      category_id,
      user_id: req.user.id,
    });

    let correctAnswerId = null; // Variable to store the correct answer ID

    // Wait for all answers to be created before updating the question
    for (const [index, answer_data] of answers.entries()) {
      const answer = await Answer.create({
        body: answer_data,
        question_id: question.id,
        order: index,
      });

      // Track the correct answer ID
      if (index == correct_answer) {
        correctAnswerId = answer.id;
      }
    }

    // Now update the question with the correct answer ID
    if (correctAnswerId) {
      await question.update({
        correct_answer_id: correctAnswerId,
      });
    }

    return res.status(200).json(question);
  } else
    return res.status(400).json({ message: "داده های ورودی معتبر نمی باشد." });
};
