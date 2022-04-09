/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { ERRORS } from "@/constants/error";
import { QUESTION_TYPE } from "@/constants/quiz";
import { QuestionCtrl } from "@/controllers/question";
import { QuizCtrl } from "@/controllers/quiz";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { QuestionDocument } from "@/models/question";
import { QuizDocument } from "@/models/quiz";
import {
  QuestionOptionValidation,
  QuestionUpdateValidation,
  QuestionValidation,
  ValidateOptionObjectId
} from "@/validators/quiz";
import {
  ResponseHandler,
  SERVER_STATUS,
  Streams,
  ValidateObjectId,
  Validator
} from "@ecualead/server";
import { NextFunction, Request, Response, Router } from "express";
import mongoose from "mongoose";

/* Create router object */
const router = Router({ mergeParams: true });

/**
 * @api {post} /v1/question/:id Create new question inside a quiz
 * @apiVersion 1.0.0
 * @apiName CreateQuizQuestion
 * @apiGroup Quiz Questions
 */
router.post(
  "/:id",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  Validator.joi(QuestionValidation),
  (req: Request, res: Response, next: NextFunction) => {
    QuizCtrl.fetch({ _id: req.params.id, owner: res.locals["account"]._id })
      .then((quiz: QuizDocument) => {
        QuestionCtrl.create({
          quiz: quiz._id,
          description: req.body.description,
          type: req.body.type,
          options: req.body.options,
          owner: res.locals["account"]._id,
          status: SERVER_STATUS.ENABLED
        })
          .then((question: QuestionDocument) => {
            res.locals["response"] = { id: question.id };
            next();
          })
          .catch(next);
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {put} /v1/question/:id Update a quiz question information
 * @apiVersion 1.0.0
 * @apiName UpdateQuizQuestion
 * @apiGroup Quiz Questions
 */
router.put(
  "/:id",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  Validator.joi(QuestionUpdateValidation),
  (req: Request, res: Response, next: NextFunction) => {
    QuestionCtrl.update(
      { _id: req.params.id, owner: res.locals["account"]._id },
      { description: req.body.description }
    )
      .then((question: QuestionDocument) => {
        res.locals["response"] = { id: question.id };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {delete} /v1/question/:id Delete a quiz question
 * @apiVersion 1.0.0
 * @apiName DeleteQuizQuestion
 * @apiGroup Quiz Questions
 */
router.delete(
  "/:id",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    QuestionCtrl.delete({
      _id: new mongoose.Types.ObjectId(req.params.id),
      owner: res.locals["account"]._id,
      status: SERVER_STATUS.ENABLED
    })
      .then((question: QuestionDocument) => {
        res.locals["response"] = { id: question.id };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {get} /v1/question/:id Retrieve all questions from a quiz
 * @apiVersion 1.0.0
 * @apiName FetchAllQuizQuestion
 * @apiGroup Quiz Questions
 */
router.get(
  "/:id",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  (req: Request, res: Response, _next: NextFunction) => {
    QuestionCtrl.fetchAll({ quiz: req.params.id, owner: res.locals["account"]._id })
      .pipe(Streams.stringify())
      .pipe(res.type("json"));
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {post} /v1/question/:id/option Create option inside question
 * @apiVersion 1.0.0
 * @apiName CreateQuizQuestionOption
 * @apiGroup Quiz Questions
 */
router.post(
  "/:id/option",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  Validator.joi(QuestionOptionValidation),
  (req: Request, res: Response, next: NextFunction) => {
    QuestionCtrl.fetch({ _id: req.params.id, owner: res.locals["account"]._id })
      .then((question: QuestionDocument) => {
        if (question.options.length >= 10) {
          return next({ boError: ERRORS.MAX_OPTIONS });
        }

        /* Check if the question is simple selection and there is a valid option */
        if (question.type === QUESTION_TYPE.SIMPLE) {
          const validOption = question.options.filter((value: any) => value.valid);
          if (req.body.valid && validOption?.length > 0) {
            return next({ boError: ERRORS.MULTIPLE_VALID_NOT_SUPPORTED });
          }
        }

        /* Add option to the question */
        QuestionCtrl.addOption(question._id, req.body.value, req.body.valid)
          .then(() => {
            res.locals["response"] = { id: question.id };
            next();
          })
          .catch(next);
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {put} /v1/question/:id/option/:option Update an option inside question
 * @apiVersion 1.0.0
 * @apiName UpdateQuizQuestionOption
 * @apiGroup Quiz Questions
 */
router.put(
  "/:id/option/:option",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateOptionObjectId, "params"),
  Validator.joi(QuestionOptionValidation),
  (req: Request, res: Response, next: NextFunction) => {
    QuestionCtrl.fetch({ _id: req.params.id, owner: res.locals["account"]._id })
      .then((question: QuestionDocument) => {
        /* Check if the question is simple selection and there is a valid option */
        if (question.type === QUESTION_TYPE.SIMPLE) {
          const validOption: any[] = question.options.filter((value: any) => value.valid);
          if (
            req.body.valid &&
            validOption?.length > 0 &&
            validOption[0]._id.toString() !== req.params.option
          ) {
            return next({ boError: ERRORS.MULTIPLE_VALID_NOT_SUPPORTED });
          }
        }

        /* Update the question option */
        QuestionCtrl.updateOption(question._id, req.params.option, req.body.value, req.body.valid)
          .then((question: QuestionDocument) => {
            res.locals["response"] = { id: question.id };
            next();
          })
          .catch(next);
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {delete} /v1/question/:id/option/:option Delete an option inside question
 * @apiVersion 1.0.0
 * @apiName DeleteQuizQuestionOption
 * @apiGroup Quiz Questions
 */
router.delete(
  "/:id/option/:option",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateOptionObjectId, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    QuestionCtrl.fetch({ _id: req.params.id, owner: res.locals["account"]._id })
      .then((question: QuestionDocument) => {
        if (question.options.length <= 2) {
          return next({ boError: ERRORS.MIN_OPTIONS });
        }

        /* Add option to the question */
        QuestionCtrl.deleteOption(question._id, req.params.option)
          .then(() => {
            res.locals["response"] = { id: question.id };
            next();
          })
          .catch(next);
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

export default router;
