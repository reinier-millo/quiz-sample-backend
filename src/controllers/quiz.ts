/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { CRUD, IQueryParameters, SERVER_STATUS } from "@ecualead/server";
import { QuizDocument, QuizModel } from "@/models/quiz";
import mongoose, { AggregationCursor } from "mongoose";
import { QUESTION_TYPE } from "@/constants/quiz";
import { QuestionCtrl } from "@/controllers/question";
import { AnyRecord } from "dns";

export interface IQuizQuestionOptionDetail {
  id: string;
  value: string;
}

export interface IQuizQuestionDetail {
  id: string;
  description: string;
  type: QUESTION_TYPE;
  options: IQuizQuestionOptionDetail[];
}

export interface IQuizDetail {
  id: string;
  name: string;
  description?: string;
  questions: IQuizQuestionDetail[];
}

class Quiz extends CRUD<QuizDocument> {
  private static _instance: Quiz;

  private constructor() {
    super("QuizCtrl", QuizModel);
  }

  /**
   * Get the singleton class instance
   */
  public static get shared(): Quiz {
    if (!Quiz._instance) {
      Quiz._instance = new Quiz();
    }
    return Quiz._instance;
  }

  /**
   * Fetch a quiz detail with questions
   *
   * @param id
   * @returns
   */
  public fetchDetails(id: string): Promise<IQuizDetail> {
    return new Promise<IQuizDetail>((resolve, reject) => {
      /* Prepare initial pipeline to join questions with the target quiz */
      const pipeline: any[] = [
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "quiz.questions",
            let: { objId: "$_id" },
            pipeline: [
              { $sort: { createdAt: 1 } },
              {
                $match: {
                  $expr: { $and: [{ $eq: ["$quiz", "$$objId"] }, { $eq: ["$status", 2] }] }
                }
              },
              {
                $project: {
                  _id: 0,
                  id: "$_id",
                  description: 1,
                  success: 1,
                  fail: 1,
                  "options._id": 1,
                  "options.value": 1,
                  type: 1
                }
              }
            ],
            as: "questions"
          }
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: 1,
            description: 1,
            questions: 1
          }
        }
      ];

      /* Apply the pipeline to the data model */
      QuizModel.aggregate(pipeline)
        .then((values: IQuizDetail[]) => {
          resolve(values[0]);
        })
        .catch(reject);
    });
  }

  /**
   * Fetch all quizes with statistics
   *
   * @returns
   */
  public fetchAllQuizes(query?: any): AggregationCursor {
    if (!query) {
      query = {};
    }

    if (!query["status"]) {
      query["status"] = SERVER_STATUS.ENABLED;
    }

    /* Prepare initial pipeline to join questions with the target quiz */
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "quiz.questions",
          let: { objId: "$_id" },
          pipeline: [
            { $sort: { createdAt: 1 } },
            {
              $match: {
                $expr: { $and: [{ $eq: ["$quiz", "$$objId"] }, { $eq: ["$status", 2] }] }
              }
            },
            {
              $project: {
                _id: 0,
                id: "$_id",
                quiz: 1,
                success: 1,
                fail: 1
              }
            }
          ],
          as: "questions"
        }
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          description: 1,
          count: { $size: "$questions" },
          success: { $sum: "$questions.success" },
          fail: { $sum: "$questions.fail" }
        }
      }
    ];

    /* Apply the pipeline to the data model */
    return QuizModel.aggregate(pipeline).sort({ success: -1 }).cursor({ batchSize: 1000 });
  }

  /**
   * Delete the quiz and the questions
   *
   * @param query
   * @returns
   */
  public delete(query: IQueryParameters): Promise<QuizDocument> {
    return new Promise<QuizDocument>((resolve, reject) => {
      super
        .delete(query)
        .then((quiz: QuizDocument) => {
          QuestionCtrl.deleteByQuiz(quiz._id)
            .catch((err: any) => {
              this._logger.error("There were an error eliminating the quiz questions", {
                quiz: quiz.id,
                error: err
              });
            })
            .finally(() => {
              resolve(quiz);
            });
        })
        .catch(reject);
    });
  }
}

export const QuizCtrl = Quiz.shared;
