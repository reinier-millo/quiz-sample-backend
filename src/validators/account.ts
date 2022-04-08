/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { Joi } from "@ecualead/server";

export const RegisterValidation = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const LoginValidation = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const ProfileValidation = Joi.object().keys({
  name: Joi.string().required(),
  about: Joi.string().allow("").optional()
});
