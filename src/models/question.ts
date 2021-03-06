/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { QUESTION_TYPE } from "@/constants/quiz";
import { BaseModel } from "@ecualead/server";
import { prop, getModelForClass, DocumentType, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Quiz } from "@/models/quiz";

export interface IValidationResult {
  matches: number;
  found: number;
}

class QuestionOption {
  @prop({ required: true })
  value!: string;

  @prop({ required: true, default: false })
  valid?: boolean;
}

export class Question extends BaseModel {
  @prop({ required: true, ref: Quiz })
  quiz!: Ref<Quiz>;

  @prop({ required: true })
  description!: string;

  @prop({ type: QuestionOption, required: true })
  options!: QuestionOption[];

  @prop({ required: true, enum: QUESTION_TYPE, default: QUESTION_TYPE.SIMPLE })
  type?: QUESTION_TYPE;

  @prop({ default: 0 })
  fail?: number;

  @prop({ default: 0 })
  success?: number;

  /**
   * Get the mongoose data model
   */
  static get shared() {
    return getModelForClass(Question, {
      schemaOptions: {
        collection: "quiz.questions",
        timestamps: true,
        toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (_doc: any, ret: any) => {
            return {
              id: ret.id,
              quiz: ret.quiz,
              description: ret.description,
              options: ret.options.map((option: any) => {
                return { id: option._id, value: option.value, valid: option.valid };
              }),
              type: ret.type,
              sucess: ret.success,
              fail: ret.fail,
              createdAt: ret.createdAt
            };
          }
        }
      },
      options: { automaticName: false }
    });
  }

  /**
   * Validate how mamny match have a solution given by the user
   *
   * @param results
   * @returns
   */
  public validateResult?(results: string[]): IValidationResult {
    const realResults: string[] = this.options
      .filter((value) => value.valid)
      .map((value: any) => value._id.toString());
    let found = 0;
    results.forEach((value) => {
      if (realResults.indexOf(value) >= 0) {
        found++;
      }
    });

    return {
      matches: realResults.length,
      found: found
    };
  }
}

export type QuestionDocument = DocumentType<Question>;
export const QuestionModel: mongoose.Model<QuestionDocument> = Question.shared;
