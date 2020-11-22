import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import { UserModel } from "../models";
import { validationResult } from 'express-validator';
import handleError from "../utils/handle.error";

// берем секретный ключ из конфига
const secret = config.get('jwtSecret');

class AuthController {
  // метод регистрации пользователя
  async register(req: express.Request, res: express.Response) {
    try{
      // принимаем от middleware для точки api/auth/register все ошибки
      const errors = validationResult(req);
      // если они не пусты выдаем сообщение от middleware с массивом ошибок
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }
      // принимаем email, name, password для регистрации пользователя из тела запроса
      const { email, name, password } = req.body;

      // смотрим есть ли такой кандидат в базе
      const candidate = await UserModel.findOne({ "email" : {
          $regex : new RegExp(email, "i") } } );

      // если есть выдаем ответ
      if(candidate) {
        return res.status(400).json({ message: 'Такой пользователь уже существует' });
      }

      // создаем хэш пароль с помощью хэш функции на основе нашего введенного пароля
      const hashedPassword = await bcrypt.hash(password, 12);

      // создаем пользователя в качестве пароля передаем хэш пароль
      const user = new UserModel({ email, name, password: hashedPassword });
      // сохраняем в базе
      await user.save((err, user) => {
        if(err) return handleError(500, err.message, res);
        // создаем токен на основе userId, так же в параметрах передаем секретный ключ и время действия токена (его сессии) в 1 час
        const token = jwt.sign({ userId: user.id }, secret, {expiresIn: '1h' });
        // выдаем ответ
        res.status(201).json({
          message: 'Пользователь создан!', status: 'success', token, userId: user.id
        })
      });

    }catch (e) {
      return handleError(500, e.message, res);
    }
  }

  // метод входа в систему
  async login(req: express.Request, res: express.Response) {
    try{
      // принимаем от middleware для точки api/auth/login все ошибки
      const errors = validationResult(req);
      // если они не пусты выдаем сообщение от middleware с массивом ошибок
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при авторизации'
        })
      }

      // принимаем email и password для входа из тела запроса
      const { email, password } = req.body;
      // находим одного пользователя по email
      const user = await UserModel.findOne( { "email" : {
          $regex : new RegExp(email, "i") } } );
      // если пользователь не существует
      if(!user) {
        return res.status(400).json({ message: 'Пользователь не найден!'});
      }
      // сравниваем пароль с базы и введенный пароль
      const isMatch = await bcrypt.compare(password, user.password);

      // если они не совпадают
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль, попробуйте снова'});
      }

      // создаем токен на основе userId, так же в параметрах передаем секретный ключ и время действия токена (его сессии) в 1 час
      const token = jwt.sign({ userId: user.id }, secret, {expiresIn: '1h' });

      // выдаем ответ с телом в виде токена и useId пользователя
      res.status(200).json({ token, userId: user.id, message: 'Вы авторизованы!', status: 'success' });

    }catch (e) {
      return handleError(500, e.message, res);
    }
  }
}

export default AuthController;
