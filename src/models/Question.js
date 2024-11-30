const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Question.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      Question.hasMany(models.Answer, { foreignKey: 'question_id', as: 'answers' });
      Question.hasMany(models.UserAnswer, { foreignKey: 'question_id', as: 'userAnswers' });
    }
  }

  Question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      correct_answer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions',
      timestamps: true,
    }
  );

  return Question;
};
