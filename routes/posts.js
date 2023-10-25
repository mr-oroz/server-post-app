import { Router } from "express";
import { checkAuth } from "../utils/checkAuth.js";
import {
  createPost,
  getAll,
  getById,
  getMyPosts,
  removePost,
  updatePost,
  getPostComments
} from "../controllers/posts.js";


const router = new Router();
// Create post
// http://localhost:3002/api/posts
// нуждаемся чек авторизация
router.post('/', checkAuth, createPost)

// get All post
// http://localhost:3002/api/posts
router.get('/', getAll)


// get By id
// http://localhost:3002/api/posts/:id
router.get('/:id', getById)

// get My posts
// http://localhost:3002/api/posts/user/me
router.get('/user/me', checkAuth, getMyPosts)

// remove post
// http://localhost:3002/api/posts/:id
router.delete('/:id', checkAuth, removePost)

// update post
// http://localhost:3002/api/posts/:id
router.put('/:id', checkAuth, updatePost)


// get post comments
// http://localhost:3002/api/posts/comments/:id
router.get('/comments/:id', getPostComments)


export default router