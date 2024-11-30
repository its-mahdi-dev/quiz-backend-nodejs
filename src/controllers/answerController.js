const { Question, UserAnswer } = require("../models");
exports.submitPlayerAnswer = async (req, res) => {
    let question_id = req.params.question_id;
    let question = await Question.findOne({
      where: { id: question_id },
    });
    if (question == null)
      return res.status(404).json({ message: "سوال پیدا نشد" });
    let now = new Date();
    if (now < question.start_time)
      return res.status(400).json({ message: "هنوز سوال شروع نشده!" });
    if (now > question.end_time)
      return res
        .status(400)
        .json({ message: "زمان پاسخگویی به این سوال تموم شده!" });
    let user_answer = await UserAnswer.findOne({
      where: { user_id: req.user.id, question_id },
    });
    if (user_answer != null)
      return res
        .status(400)
        .json({ message: "شما قبلا به این سوال پاسخ داده اید" });
    let answer_id = req.body.answer_id;
    await UserAnswer.create({
      user_id: req.user.id,
      question_id,
      answer_id,
    });
    return res.status(201).json({ message: "پاسخ با موفقیت ثبت شد" });
  };
  