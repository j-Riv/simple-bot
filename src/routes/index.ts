import express from 'express';
import { respond } from '../controllers';

export default (app: express.Application): void => {
  app.post('/', respond);
};
