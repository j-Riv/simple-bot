import express from 'express';
import routes from './routes';

const app = express();

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.json());

routes(app);

app.listen(8100, function () {
  console.log('App listening on port 8100.');
});
