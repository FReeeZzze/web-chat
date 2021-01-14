import express from "express";
import { check } from 'express-validator';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import socket from "socket.io";

import uploader from "../core/multer";
const multiType = uploader.array('fileData', 2);
import { UserCtrl, HomeCtrl, AuthCtrl, DialogCtrl, MessageCtrl, UploadCtrl } from "../controllers";
import auth from '../middleware/auth.middleware';

// состояние приложения
const dev = process.env.NODE_ENV !== 'production';

// конструктор роутов
const createRoutes = (app: express.Express, io: socket.Server) => {
  // список контроллеров для роутов
  const HomeController = new HomeCtrl();
  const AuthController = new AuthCtrl();
  const UserController = new UserCtrl(io);
  const DialogController = new DialogCtrl(io);
  const MessageController = new MessageCtrl(io);
  const UploadFileController = new UploadCtrl();

  // промежуточное ПО
  app.use(bodyParser.json());
  app.use('/public', express.static('public'));
  app.use(logger(dev ? 'dev' : 'production'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    next();
  });

  /* === запросы для точки '/' контроллера HomeController === */

  // METHODS 'GET'
  app.get("/", HomeController.index);

  /* === запросы для точки '/api/auth' контроллера AuthController === */

  // METHODS 'POST'
  app.post("/api/auth/register", [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длинна пароля 6 символов').isLength({ min: 6})
  ],  AuthController.register);

  app.post("/api/auth/login", [
    check('email', 'Введите корректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists(),
  ], AuthController.login);

  /* === запросы для точки '/api/user' контроллера UserController === */

  // METHODS 'GET'
  app.get("/api/user/me", auth, UserController.getMe);
  app.get("/api/user", auth, UserController.findUsers);
  app.put("/api/user/add", auth, UserController.addContact);
  app.get("/api/user/contacts", auth, UserController.getContacts);
  app.get("/api/user/all", auth, UserController.getUsers);

  /* === запросы для точки '/api/dialog' контроллера DialogController === */

  // METHODS 'POST'
  app.post("/api/dialog", auth, DialogController.createDialog);

  // METHODS 'GET'
  app.get("/api/dialog", auth, DialogController.getDialogs);

  /* === запросы для точки '/api/message' контроллера MessageController === */

  // METHODS 'GET'

  // METHODS 'POST'
  app.post("/api/messages", auth, MessageController.getMessages);
  app.post("/api/message", auth, MessageController.createMessage);


  /* === запросы для точки '/api/files' контроллера MessageController === */

  // METHODS 'POST'
  app.post("/api/files", [auth, multiType], UploadFileController.create);

  // METHODS 'DELETE'
  app.delete("/files", UploadFileController.delete);
};

export default createRoutes;
