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

app.listen(3000, function () {
  console.log('App listening on port 3000.');
});
