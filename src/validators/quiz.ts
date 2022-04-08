/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { Joi } from "@ecualead/server";

export const QuizValidation = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
});

export const QuestionOptionValidation = Joi.object().keys({
  value: Joi.string().required(),
  valid: Joi.boolean().optional().default(false)
});

export const QuestionValidation = Joi.object().keys({
  description: Joi.string().required(),
  type: Joi.number().integer().min(1).max(2).required(),
  options: Joi.array().items(QuestionOptionValidation).min(2).max(10).required()
});

export const QuestionUpdateValidation = Joi.object().keys({
  description: Joi.string().required(),
});

export const ValidateOptionObjectId = Joi.object().keys({
  id: Joi.objectId().required(),
  option: Joi.objectId().required()
});
