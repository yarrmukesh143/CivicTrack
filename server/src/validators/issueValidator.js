const { body } = require("express-validator");

const createIssueValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("location").notEmpty().withMessage("Location is required"),
];

module.exports = {
  createIssueValidation,
};
