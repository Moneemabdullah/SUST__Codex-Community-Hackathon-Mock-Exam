import type { RequestHandler } from 'express';
import { HEADER } from '../constants/http.constants.js';
import { defaultRequestIdStore } from '../utils/request-id.util.js';

export const requestIdMiddleware = (): RequestHandler => (req, res, next) => {
  const inbound = req.headers[HEADER.REQUEST_ID.toLowerCase()];
  const id = defaultRequestIdStore.resolve(inbound);
  req.id = id;
  res.setHeader(HEADER.REQUEST_ID, id);
  next();
};