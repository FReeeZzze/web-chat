import express from "express";
import { check } from 'express-validator';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import socket from "socket.io";

import { UserCtrl, HomeCtrl, AuthCtrl, DialogCtrl, MessageCtrl } from "../controllers";
import auth from '../middleware/auth.middleware';

// состояние приложения
const dev = process.env.NODE_ENV !== 'production';

// конструктор роутов
const createRoutes = (app: express.Express, io: socket.Server) => {
  // список контроллеров для роутов
  const AuthController = new AuthCtrl();
  const HomeController = new HomeCtrl();
  const UserController = new UserCtrl(io);
  const DialogController = new DialogCtrl(io);
  const MessageController = new MessageCtrl(io);

  // промежуточное ПО
  app.use(express.json());
  app.use(logger(dev ? 'dev' : 'production'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

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
  app.get("/api/user/all", auth, UserController.getUsers);

  /* === запросы для точки '/api/dialog' контроллера DialogController === */

  // METHODS 'POST'
  app.post("/api/dialog", auth, DialogController.createDialog);

  // METHODS 'GET'
  app.get("/api/dialog", auth, DialogController.getDialogs);

  // METHODS 'GET'
  app.get("/api/message", auth, MessageController.getMessages);

  // METHODS 'POST'
  app.post("/api/message", auth, MessageController.createMessage);
};

export default createRoutes;
