import User from '../models/User.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

//register
export const register = async (req, res) => {
  try {
    // ожидаем от клиента username password
    const { username, password } = req.body

    // проверяем данных если существует такой username сообщим клиенту
    const isUsed = await User.findOne({ username })

    // проверяем регистрация
    if (isUsed) {
      return res.status(400).json({
        message: 'Данный username уже занят.',
      })
    }
    
    // генерировать пароль и кешировать 
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)


    // создаем новый user и сохраняем отправяем ответ на клиент res.json
    const newUser = new User({
      username,
      password: hash,
    })


    // создаем токен пользователя с помощю пакет jsonwebtoken
    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' });
    
    // сохраняем новый регистрация
    await newUser.save()
    
    // желательно отправляем при регистраци данных и токен чтобы после регистрация сразу авторизовался 
    res.status(200).json({
      newUser,
      message: 'Регистрация прошла успешно.',
      token
    })
  } catch (error) {
    //console.error("Error:", error);
    res.status(500).json({
      message: 'Ошибка при создании пользователя.',
      error: error.message
    })
  }
}

//login
export const login = async (req, res) => {
  try {
    // получем от клиента 
    const { username, password } = req.body;

    // получаем user от сервера база данных
    const user = await User.findOne({ username });


    // проверяем 
    if (!user) res.status(400).json({ message: 'Такого юзера не существует.' });

    // получаем пароль проверяем пароль если правильно
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) res.json({ message: 'Неверный пароль.' });

    // создаем токен пользователя с помощю пакет jsonwebtoken
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' });

    // желательно отправляем при регистраци данных и токен чтобы после войти авторизовался 
    res.status(200).json({
      token, user, message: 'Вы успешно авторизовались.'
    });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка при авторизация.' })
  }
}

// me
export const getMe = async (req, res) => {
  try {
      
      const user = await User.findById(req.userId)
      if (!user) {
          return res.status(500).json({
              message: 'Такого юзера не существует.',
          })
      }

      const token = jwt.sign(
          {
              id: user._id,
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d' },
      )

      res.status(200).json({
          user,
          token,
      })
  } catch (error) {
    res.status(500).json({ message: 'Нет доступа.' })
  }
}