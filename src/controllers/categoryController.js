const { Category } = require("../models");
exports.getCategories = async (req, res) => {
  let categories = await Category.findAll();
  return res.status(200).json(categories);
};

exports.addCategory = async (req, res) => {
  let name = req.body.name;
  Category.create({
    name, 
  });
  return res.status(201).json({"message": "دسته بندی با موفقیت اضافه شد"})
};
