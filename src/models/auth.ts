/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { BaseModel } from "@ecualead/server";
import { prop, getModelForClass, DocumentType, index, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Account } from "@/models/account";

@index({ token: 1 })
@index({ account: 1 })
export class Auth extends BaseModel {
  @prop({ required: true })
  token!: string;

  @prop({ ref: Account, required: true })
  account!: Ref<Account>;

  /**
   * Get the mongoose data model
   */
  static get shared() {
    return getModelForClass(Auth, {
      schemaOptions: {
        collection: "auth-tokens",
        timestamps: true,
        toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (_doc: any, ret: any) => {
            return {
              id: ret.id,
              token: ret.token,
              account: ret.account
            };
          }
        }
      },
      options: { automaticName: false }
    });
  }
}

export type AuthDocument = DocumentType<Auth>;
export const AuthModel: mongoose.Model<AuthDocument> = Auth.shared;
