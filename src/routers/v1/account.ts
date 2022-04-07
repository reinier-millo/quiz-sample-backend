/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { ResponseHandler, Validator } from "@ecualead/server";
import { NextFunction, Request, Response, Router } from "express";
import { LoginValidation, ProfileValidation, RegisterValidation } from "@/validators/account";
import { AccountCtrl } from "@/controllers/account";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { AccountDocument } from "@/models/account";
import { AuthCtrl } from "@/controllers/auth";
import { AuthDocument } from "@/models/auth";

/* Create router object */
const router = Router();

/**
 * @api {post} /v1/account/register Register new user account
 * @apiVersion 1.0.0
 * @apiName RegisterAccount
 * @apiGroup User account
 */
router.post(
  "/register",
  Validator.joi(RegisterValidation),
  (req: Request, res: Response, next: NextFunction) => {
    AccountCtrl.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        res.locals["response"] = { email: req.body.email };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {post} /v1/account/login Authenticate an user account
 * @apiVersion 1.0.0
 * @apiName AuthenticateAccount
 * @apiGroup User account
 */
router.post(
  "/login",
  Validator.joi(LoginValidation),
  (req: Request, res: Response, next: NextFunction) => {
    AuthCtrl.loginAccount(req.body.email, req.body.password)
      .then((authToken: AuthDocument) => {
        const account: AccountDocument = authToken.account as AccountDocument;
        res.locals["response"] = {
          uid: account.id,
          name: account.name,
          about: account.about,
          email: account.email,
          token: authToken.token
        };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {delete} /v1/account/logout Logout an authenticated user account
 * @apiVersion 1.0.0
 * @apiName LogoutAccount
 * @apiGroup User account
 */
router.delete(
  "/logout",
  AuthMiddleware.validateAuth(),
  Validator.joi(RegisterValidation),
  (_req: Request, res: Response, next: NextFunction) => {
    AuthCtrl.delete({ token: res.locals["token"] })
      .then(() => {
        res.locals["response"] = {};
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {get} /v1/account Retrieve current user profile information
 * @apiVersion 1.0.0
 * @apiName CurrentAccount
 * @apiGroup User account
 */
router.get(
  "/",
  AuthMiddleware.validateAuth(),
  Validator.joi(RegisterValidation),
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals["response"] = res.locals["account"];
    next();
  },
  ResponseHandler.error,
  ResponseHandler.success
);

/**
 * @api {put} /v1/account Update current user profile information
 * @apiVersion 1.0.0
 * @apiName UpdateAccount
 * @apiGroup User account
 */
router.put(
  "/",
  AuthMiddleware.validateAuth(),
  Validator.joi(ProfileValidation),
  (req: Request, res: Response, next: NextFunction) => {
    AccountCtrl.update(
      { _id: res.locals["account"]._id },
      {
        name: req.body.name,
        about: req.body.about
      }
    )
      .then((account: AccountDocument) => {
        res.locals["response"] = { uid: account.id };
        next();
      })
      .catch(next);
  },
  ResponseHandler.error,
  ResponseHandler.success
);

export default router;
