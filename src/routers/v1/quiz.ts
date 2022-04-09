/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import {
  ResponseHandler,
  SERVER_STATUS,
  Streams,
  ValidateObjectId,
  Validator
} from "@ecualead/server";
import { NextFunction, Request, Response, Router } from "express";
import mongoose from "mongoose";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { ParticipationValidation, QuizValidation } from "@/validators/quiz";
import { IQuizDetail, QuizCtrl } from "@/controllers/quiz";
import { QuizDocument } from "@/models/quiz";
import { QuestionDocument } from "@/models/question";
import { QuestionCtrl } from "@/controllers/question";
import { AccountCtrl } from "@/controllers/account";

/* Create router object */
const router = Router();

/**
 * @api {post} /v1/quiz Create new quiz
 * @apiVersion 1.0.0
 * @apiName CreateQuiz
 * @apiGroup Quiz
 */
router.post(
  "/",
  AuthMiddleware.validateAuth(),
  Validator.joi(QuizValidation),
  (req: Request, res: Response, next: NextFunction) => {
    QuizCtrl.create({
      name: req.body.name,
      description: req.body.description,
      owner: res.locals["account"]._id,
      status: SERVER_STATUS.ENABLED
    })
      .then((quiz: QuizDocument) => {
        res.locals["response"] = { id: quiz.id };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {put} /v1/quiz/:id Update a quiz information
 * @apiVersion 1.0.0
 * @apiName UpdateQuiz
 * @apiGroup Quiz
 */
router.put(
  "/:id",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  Validator.joi(QuizValidation),
  (req: Request, res: Response, next: NextFunction) => {
    QuizCtrl.update(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        owner: res.locals["account"]._id,
        status: SERVER_STATUS.ENABLED
      },
      {
        name: req.body.name,
        description: req.body.description
      }
    )
      .then((quiz: QuizDocument) => {
        res.locals["response"] = { id: quiz.id };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {delete} /v1/quiz/:id Delete a quiz
 * @apiVersion 1.0.0
 * @apiName DeleteQuiz
 * @apiGroup Quiz
 */
router.delete(
  "/:id",
  AuthMiddleware.validateAuth(),
  Validator.joi(ValidateObjectId, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    QuizCtrl.delete({
      _id: new mongoose.Types.ObjectId(req.params.id),
      owner: res.locals["account"]._id,
      status: SERVER_STATUS.ENABLED
    })
      .then((quiz: QuizDocument) => {
        res.locals["response"] = { id: quiz.id };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {get} /v1/quiz/my Retrieve all quizes of the current user
 * @apiVersion 1.0.0
 * @apiName FetchCurrentQuiz
 * @apiGroup Quiz
 */
router.get(
  "/my",
  AuthMiddleware.validateAuth(),
  (_req: Request, res: Response, _next: NextFunction) => {
    QuizCtrl.fetchAllQuizes({ owner: res.locals["account"]._id })
      .pipe(Streams.stringify())
      .pipe(res.type("json"));
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {get} /v1/quiz Retrieve all quizes
 * @apiVersion 1.0.0
 * @apiName FetchAllQuiz
 * @apiGroup Quiz
 */
router.get(
  "/",
  (_req: Request, res: Response, _next: NextFunction) => {
    QuizCtrl.fetchAllQuizes().pipe(Streams.stringify()).pipe(res.type("json"));
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {get} /v1/quiz/:id Retrieve a quiz detail
 * @apiVersion 1.0.0
 * @apiName FetchOneQuiz
 * @apiGroup Quiz
 */
router.get(
  "/:id",
  Validator.joi(ValidateObjectId, "params"),
  (req: Request, res: Response, next: NextFunction) => {
    QuizCtrl.fetchDetails(req.params.id)
      .then((quiz: IQuizDetail) => {
        res.locals["response"] = quiz;
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {post} /v1/quiz/:id/participate Participate in one quiz responding a question
 * @apiVersion 1.0.0
 * @apiName ParticipateQuiz
 * @apiGroup Quiz
 */
router.post(
  "/:id/participate",
  Validator.joi(ValidateObjectId, "params"),
  Validator.joi(ParticipationValidation),
  AuthMiddleware.validateAuth(),
  (err: any, req: Request, res: Response, next: NextFunction) => {
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    QuestionCtrl.fetch(
      {
        _id: new mongoose.Types.ObjectId(req.body.question),
        quiz: new mongoose.Types.ObjectId(req.params.id)
      },
      null,
      ["quiz"]
    )
      .then((question: QuestionDocument) => {
        const results = question.validateResult(req.body.responses);
        const success = results.found;
        const fail = results.matches - results.found + req.body.responses.length - results.found;

        QuestionCtrl.update({ _id: question._id }, null, { $inc: { success: success, fail: fail } })
          .catch(() => {
            /* Prevent error raise */
          })
          .finally(() => {
            res.locals["response"] = {
              id: question.id,
              success: success,
              fail: fail,
              options: question.options.map((obj: any) => {
                return {
                  id: obj._id.toString(),
                  value: obj.value,
                  valid: obj.valid
                };
              })
            };

            next();
          });
      })
      .catch(next);
  },
  (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals["account"]._id) {
      return next();
    }

    /* Update user statistics */
    AccountCtrl.update({ _id: res.locals["account"]._id }, null, {
      $inc: { success: res.locals["response"].success, fail: res.locals["response"].fail }
    })
      .catch(() => {
        /* Prevent error raise */
      })
      .finally(() => {
        next();
      });
  },
  ResponseHandler.error,
  ResponseHandler.success
);

export default router;
