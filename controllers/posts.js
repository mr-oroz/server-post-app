import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// create post
export const createPost = async (req, res) => {
  try {
    // ожидаем и получаем от клиента title и text
    const { title, text } = req.body

    // получаем юзера через userId
    const user = await User.findById(req.userId)

    // проверяем если картина есть 
    if (req.files) {
      let fileName = Date.now().toString() + req.files.image.name
      const __dirname = dirname(fileURLToPath(import.meta.url))
      req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))

      // создаем новый пост с картинками
      const newPostWithImage = new Post({
        username: user.username,
        title,
        text,
        imgUrl: fileName,
        author: req.userId,
      })
      // сохраняем пост
      await newPostWithImage.save()
      // и добавляем пост на юзера на массив posts

      await User.findByIdAndUpdate(req.userId, {
        $push: { posts: newPostWithImage },
      })
      return res.json(newPostWithImage)
    }

    // добавляем без картины
    const newPostWithoutImage = new Post({
      username: user.username,
      title,
      text,
      imgUrl: '',
      author: req.userId,
    })
    await newPostWithoutImage.save()
    await User.findByIdAndUpdate(req.userId, {
      $push: { posts: newPostWithoutImage },
    })

    res.json(newPostWithoutImage)
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}

export const getAll = async (req, res) => {
  try {
    // всех постов с сортированных 
    const posts = await Post.find().sort('-createdAt');

    // популярных постов с лимитом 5 
    const popularPosts = await Post.find().limit(5).sort('-views');

    // если нет посты сообщим
    if (!posts) {
      return res.json({ message: 'Постов нет' })
    }

    // отправляем клиенту
    res.json({ posts, popularPosts })
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}

// get By Id
export const getById = async (req, res) => {
  try {
    // если пост есть считат будем сколько чел посмотрел и отправляем пост 
    const post = await Post.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    })
    res.json(post)
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}

// get my posts
export const getMyPosts = async (req, res) => {
  try {
    // проверяем юзера 
    const user = await User.findById(req.userId)

    // если юзера найден тогда добавляем посты 
    const list = await Promise.all(
      user.posts.map((post) => {
        return Post.findById(post._id)
      })
    )
    res.json(list);
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}

// remove post 

export const removePost = async (req, res) => {
  try {
    // удаляем пост по id 
    const post = await Post.findByIdAndDelete(req.params.id)
    // проверяем если не такого поста сообщим
    if (!post) return res.json({ message: 'Такого поста не сушествует.' })

    // если есть тогда проверяем пользователя юзера и удаляем и обновляем posts
    await User.findByIdAndUpdate(req.userId, {
      $pull: { posts: req.params.id },
    })

    // сообщим клиенту сообщение
    res.json({ message: 'Пост был удален.' });
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}
// update post
export const updatePost = async (req, res) => {
  try {
    const { title, text, id } = req.body;

    const post = await Post.findById(id)

    if (req.files) {
      let fileName = Date.now().toString() + req.files.image.name
      const __dirname = dirname(fileURLToPath(import.meta.url))
      req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))
      post.imgUrl = fileName || ''
    }

    post.title = title;
    post.text = text;

    await post.save();

    res.json(post);
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}

// get post comments
export const getPostComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const list = await Promise.all(
      post.comments.map(comment => Comment.findById(comment))
    )
    res.json(list)
  } catch (error) {
    res.json({ message: 'Что-то пошло не так.' })
  }
}