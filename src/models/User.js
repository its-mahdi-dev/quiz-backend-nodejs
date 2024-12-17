const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Question, { foreignKey: "user_id", as: "questions" });
      User.hasMany(models.Follow, { foreignKey: "following_id", as: "following" });
      User.hasMany(models.Follow, { foreignKey: "follower_id", as: "follower" });
      User.hasMany(models.UserAnswer, {
        foreignKey: "user_id",
        as: "userAnswers",
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("designer", "player"),
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );
  const bcrypt = require("bcrypt");

  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });
  

  return User;
};
