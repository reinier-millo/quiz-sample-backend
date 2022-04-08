/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { CRUD, SERVER_ERRORS, SERVER_STATUS } from "@ecualead/server";
import { QuestionDocument, QuestionModel } from "@/models/question";
import { mongoose } from "@typegoose/typegoose";

class Question extends CRUD<QuestionDocument> {
  private static _instance: Question;

  private constructor() {
    super("QuestionCtrl", QuestionModel);
  }

  /**
   * Get the singleton class instance
   */
  public static get shared(): Question {
    if (!Question._instance) {
      Question._instance = new Question();
    }
    return Question._instance;
  }

  /**
   * Delete group of questions by quiz
   *
   * @param query
   * @returns
   */
  public deleteByQuiz(quiz: mongoose.Types.ObjectId): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      QuestionModel.updateMany({ quiz: quiz }, { $set: { status: SERVER_STATUS.SOFT_DELETE } })
        .then(() => {
          resolve();
        }).catch(reject);
    });
  }

  /**
   * Add an option response to question
   * 
   * @param question 
   * @param value 
   * @param valid 
   * @returns 
   */
  public addOption(question: mongoose.Types.ObjectId, value: string, valid = false): Promise<QuestionDocument> {
    return this.update({ _id: question }, null, {
      $push: {
        options: {
          value: value,
          valid: valid,
        }
      }
    });
  }

  /**
   * Delete an option response to question
   * 
   * @param question 
   * @param option
   * @returns 
   */
  public updateOption(question: mongoose.Types.ObjectId, option: string, value: string, valid = false): Promise<QuestionDocument> {
    return new Promise<QuestionDocument>((resolve, reject) => {
      QuestionModel.findOneAndUpdate({
        _id: question,
        "options._id": new mongoose.Types.ObjectId(option)
      }, {
        $set: {
          "options.$": { _id: new mongoose.Types.ObjectId(option), value: value, valid: valid }
        }
      }, { new: true }).then((question: QuestionDocument) => {
        if (!question) {
          return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
        }

        resolve(question);
      }).catch(reject);
    });
  }

  /**
   * Delete an option response to question
   * 
   * @param question 
   * @param option
   * @returns 
   */
  public deleteOption(question: mongoose.Types.ObjectId, option: string): Promise<QuestionDocument> {
    return this.update({ _id: question }, null, {
      $pull: {
        options: { _id: new mongoose.Types.ObjectId(option) }
      }
    });
  }
}

export const QuestionCtrl = Question.shared;


