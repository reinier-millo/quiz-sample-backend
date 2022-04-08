/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { NextFunction, Request, Response } from "express";
import { ERRORS } from "@/constants/error";
import { AuthCtrl } from "@/controllers/auth";
import { AuthDocument } from "@/models/auth";

export class AuthMiddleware {
  public static validateAuth() {
    return (req: Request, res: Response, next: NextFunction) => {
      /* Get the bearer access token from header */
      const headers = (req.headers.authorization || "").split(" ");
      const token =
        headers.length === 2 && headers[0].toUpperCase() === "BEARER" ? headers[1] : null;
      if (!token) {
        return next({ boError: ERRORS.AUTHENTICATION_REQUIRED });
      }

      /* Validate the access token and get the related account */
      AuthCtrl.fetch({ token: token }, null, ["account"])
        .then((authToken: AuthDocument) => {
          res.locals["token"] = token;
          res.locals["account"] = authToken.account;
          next();
        })
        .catch(() => {
          next({ boError: ERRORS.NOT_AUTHENTICATED });
        });
    };
  }
}
