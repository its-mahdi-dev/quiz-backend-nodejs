const { Category } = require("../models");
const { Op } = require("sequelize");

exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const searchCondition = search
      ? {
          name: { [Op.like]: `%${search}%` },
        }
      : {};

    const totalItems = await Category.count({
      where: searchCondition,
    });

    const categories = await Category.findAll({
      where: searchCondition,
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      data: categories,
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


exports.addCategory = async (req, res) => {
  let name = req.body.name;
  Category.create({
    name, 
  });
  return res.status(201).json({"message": "دسته بندی با موفقیت اضافه شد"})
};
