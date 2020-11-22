import express from 'express';

class HomeController {
  index (req: express.Request, res: express.Response) {
    res.send('Главная страница')
  }
}

export default HomeController;

