const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Follow extends Model {
    static associate(models) {
      Follow.belongsTo(models.User, { foreignKey: "following_id", as: "user" });
      Follow.belongsTo(models.User, { foreignKey: "follower_id", as: "user" });
    }
  }

  Follow.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Follow",
      tableName: "follows",
      timestamps: true,
    }
  );

  return Follow;
};
