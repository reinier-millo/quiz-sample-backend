/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import "module-alias/register";
import "dotenv/config";
import { ClusterServer, Logger } from "@ecualead/server";

/* API data routes */
import AccountRouter from "@/routers/v1/account";
import QuizRouter from "@/routers/v1/quiz";
import QuestionRouter from "@/routers/v1/question";

Logger.setLogLevel(process.env.LOG);
const logger = new Logger("QuizService");

/* Initialize cluster server */
const clusterServer = ClusterServer.setup();

/* Run cluster with base routes */
clusterServer.run({
  "/v1/account": AccountRouter,
  "/v1/quiz": QuizRouter,
  "/v1/question": QuestionRouter
});
