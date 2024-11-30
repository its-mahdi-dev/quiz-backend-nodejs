const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserAnswer extends Model {
    static associate(models) {
      UserAnswer.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserAnswer.belongsTo(models.Question, { foreignKey: 'question_id', as: 'question' });
      UserAnswer.belongsTo(models.Answer, { foreignKey: 'answer_id', as: 'answer' });
    }
  }


  UserAnswer.init(
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
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      answer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UserAnswer',
      tableName: 'user_answers',
      timestamps: true,
    }
  );

  return UserAnswer;
};
