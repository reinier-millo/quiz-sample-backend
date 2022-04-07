/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { CRUD } from "@ecualead/server";
import { AccountDocument, AccountModel } from "@/models/account";

class Account extends CRUD<AccountDocument> {
  private static _instance: Account;

  private constructor() {
    super("AccountCtrl", AccountModel, { preventStatusQuery: true });
  }

  /**
   * Get the singleton class instance
   */
  public static get shared(): Account {
    if (!Account._instance) {
      Account._instance = new Account();
    }
    return Account._instance;
  }
}

export const AccountCtrl = Account.shared;
