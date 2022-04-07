/**
 * Copyright (C) 2022
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the Quiz Backend.
 * This code is licensed under the MIT License.
 */
import { HTTP_STATUS } from "@ecualead/server";

/**
 * Predefined service errors
 */
export const ERRORS = {
  INVALID_CREDENTIALS: {
    value: 1001,
    str: "invalid crdentials",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  AUTHENTICATION_REQUIRED: {
    value: 1002,
    str: "authentication required",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  },
  NOT_AUTHENTICATED: {
    value: 1003,
    str: "not authenticated",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  }
};
