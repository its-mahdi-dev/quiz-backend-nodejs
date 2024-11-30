const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Answer extends Model {
    static associate(models) {
      Answer.belongsTo(models.Question, { foreignKey: 'question_id', as: 'question' });
    }
  }

  Answer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Answer',
      tableName: 'answers',
      timestamps: true,
    }
  );

  return Answer;
};
