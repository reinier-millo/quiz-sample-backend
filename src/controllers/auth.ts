/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { CRUD, IQueryParameters, SERVER_ERRORS, Tokens } from "@ecualead/server";
import { AuthDocument, AuthModel } from "@/models/auth";
import { AccountCtrl } from "./account";
import { AccountDocument } from "@/models/account";
import { ERRORS } from "@/constants/error";

class Auth extends CRUD<AuthDocument> {
  private static _instance: Auth;

  private constructor() {
    super("AuthCtrl", AuthModel, { preventStatusQuery: true });
  }

  /**
   * Get the singleton class instance
   */
  public static get shared(): Auth {
    if (!Auth._instance) {
      Auth._instance = new Auth();
    }
    return Auth._instance;
  }

  /**
   * Authenticate an user account
   * Generate access token for the user
   *
   * @param email
   * @param password
   * @returns
   */
  public loginAccount(email: string, password: string): Promise<AuthDocument> {
    return new Promise<AuthDocument>((resolve, reject) => {
      /* Fetch user account by email */
      AccountCtrl.fetch({ email: email })
        .then((account: AccountDocument) => {
          /* Validate user account password */
          account
            .validPassword(password)
            .then(() => {
              /* Create the user access token */
              this.create({
                token: Tokens.long,
                account: account._id
              })
                .then((authToken: AuthDocument) => {
                  authToken.account = account;
                  resolve(authToken);
                })
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(() => {
          reject({ boError: ERRORS.INVALID_CREDENTIALS });
        });
    });
  }

  /**
   * Hard delete the access token
   *
   * @param query
   * @returns
   */
  public delete(query: IQueryParameters): Promise<AuthDocument> {
    return new Promise<AuthDocument>((resolve, reject) => {
      AuthModel.findOneAndDelete(query as any)
        .then((authToken: AuthDocument) => {
          if (!authToken) {
            return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }

          resolve(authToken);
        })
        .catch(reject);
    });
  }
}

export const AuthCtrl = Auth.shared;
