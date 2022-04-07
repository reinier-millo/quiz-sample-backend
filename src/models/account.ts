/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { ERRORS } from "@/constants/error";
import { BaseModel } from "@ecualead/server";
import { prop, getModelForClass, DocumentType, index, pre } from "@typegoose/typegoose";
import { hash, compare } from "bcrypt";
import mongoose from "mongoose";

@pre<Account>("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  /* Update the user crypt password */
  hash(this.password, 10, (err: mongoose.Error, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
})
@pre<Account>("findOneAndUpdate", function (next) {
  if (!(this.getUpdate() as any)["$set"]["password"]) {
    next();
  }

  /* Update the user crypt password */
  hash((this.getUpdate() as any)["$set"]["password"], 10, (err: mongoose.Error, hash) => {
    if (err) {
      return next(err);
    }
    (this.getUpdate() as any)["$set"]["password"] = hash;
    next();
  });
})
@index({ email: 1 }, { unique: true })
export class Account extends BaseModel {
  @prop({ required: true })
  name!: string;

  @prop()
  about?: string;

  @prop({ required: true })
  email!: string;

  @prop({ required: true })
  password!: string;

  /**
   * Get the mongoose data model
   */
  static get shared() {
    return getModelForClass(Account, {
      schemaOptions: {
        collection: "accounts",
        timestamps: true,
        toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (_doc: any, ret: any) => {
            return {
              uid: ret.id,
              name: ret.name,
              about: ret.about,
              email: ret.email
            };
          }
        }
      },
      options: { automaticName: false }
    });
  }

  public validPassword?(password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!password || !("password" in this)) {
        reject({ boError: ERRORS.INVALID_CREDENTIALS });
      }
      compare(password, this.password, (err: mongoose.Error, isMatch: boolean) => {
        if (isMatch) {
          return resolve();
        }

        reject(err ? err : { boError: ERRORS.INVALID_CREDENTIALS });
      });
    });
  }
}

export type AccountDocument = DocumentType<Account>;
export const AccountModel: mongoose.Model<AccountDocument> = Account.shared;
