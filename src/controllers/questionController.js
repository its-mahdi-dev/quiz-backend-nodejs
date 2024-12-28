const { where, Op, fn } = require("sequelize");
const sequelize = require("sequelize");
const { Question, UserAnswer, User, Category, Answer } = require("../models");

exports.getPlayerQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let user_answers = await UserAnswer.findAndCountAll({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: Question,
          as: "question",
          attributes: ["category_id", "body", "correct_answer_id", "duration"],
          where: search
            ? {
                body: {
                  [Op.like]: `%${search}%`,
                },
              }
            : undefined,
          include: [
            {
              model: Category,
              as: "category",
              where: search
                ? {
                    name: {
                      [Op.like]: `%${search}%`,
                    },
                  }
                : undefined,
            },
            { model: Answer, as: "answers" },
          ],
        },
        { model: Answer, as: "answer" },
      ],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(user_answers.count / limitNum);

    return res.status(200).json({
      data: user_answers.rows,
      meta: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: user_answers.count,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayersQuestion = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const whereClause = {
      type: "player",
      ...(search && {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const players = await User.findAndCountAll({
      attributes: ["id", "first_name", "last_name", "score"],
      where: whereClause,
      limit: limitNum,
      offset: offset,
    });

    const new_players = [];
    for (const player of players.rows) {
      const playerData = player.toJSON();
      playerData.wrong_answers = 0;
      playerData.correct_answers = 0;

      const user_answers = await UserAnswer.findAll({
        where: { user_id: playerData.id },
        include: [{ model: Question, as: "question" }],
      });

      user_answers.forEach((ans) => {
        if (ans.answer_id === ans.question.correct_answer_id) {
          playerData.correct_answers++;
        } else {
          playerData.wrong_answers++;
        }
      });

      new_players.push(playerData);
    }

    const totalPages = Math.ceil(players.count / limitNum);

    return res.status(200).json({
      data: new_players,
      meta: {
        currentPage: parseInt(page, 10),
        totalPages: totalPages,
        totalItems: players.count,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
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
  let new_duration = duration ? new Date().getTime() - duration : duration;
  new_question.duration =
    new_question.duration - Math.ceil(new_duration / 1000);
  console.log(new_duration);

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
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const whereClause = {
      ...(search && { body: { [Op.like]: `%${search}%` } }),
    };

    const totalItems = await Question.count({ where: whereClause });

    const questions = await Question.findAll({
      where: whereClause,
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
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      data: questions,
      meta: {
        currentPage: parseInt(page, 10),
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
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

    let correctAnswerId = null;

    for (const [index, answer_data] of answers.entries()) {
      const answer = await Answer.create({
        body: answer_data,
        question_id: question.id,
        order: index,
      });

      if (index == correct_answer) {
        correctAnswerId = answer.id;
      }
    }

    if (correctAnswerId) {
      await question.update({
        correct_answer_id: correctAnswerId,
      });
    }

    return res.status(200).json(question);
  } else
    return res.status(400).json({ message: "داده های ورودی معتبر نمی باشد." });
};
