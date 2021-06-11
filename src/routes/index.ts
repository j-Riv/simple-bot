import express, { Request, Response } from 'express';
import { respond } from '../controllers';

export default (app: express.Application): void => {
  app.post('/', respond);
  app.get('*', (req: Request, res: Response) => {
    res.send('Hello Friend ...')
  });
};
