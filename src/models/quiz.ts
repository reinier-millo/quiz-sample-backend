/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { BaseModel } from "@ecualead/server";
import { prop, getModelForClass, DocumentType, index } from "@typegoose/typegoose";
import mongoose from "mongoose";

@index({ name: 1 })
export class Quiz extends BaseModel {
  @prop({ required: true })
  name!: string;

  @prop()
  description?: string;

  /**
   * Get the mongoose data model
   */
  static get shared() {
    return getModelForClass(Quiz, {
      schemaOptions: {
        collection: "quiz",
        timestamps: true,
        toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (_doc: any, ret: any) => {
            return {
              id: ret.id,
              name: ret.name,
              description: ret.description,
              createdAt: ret.createdAt
            };
          }
        }
      },
      options: { automaticName: false }
    });
  }
}

export type QuizDocument = DocumentType<Quiz>;
export const QuizModel: mongoose.Model<QuizDocument> = Quiz.shared;
