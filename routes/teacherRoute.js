import express from 'express';
import { teacherLogin, isTeacherAuth, teacherLogout } from '../controllers/teacherController.js';
import { authTeacher } from '../middleware/authTeacher.js';

const teacherRouter = express.Router();

teacherRouter.post('/login', teacherLogin);
teacherRouter.get('/is-auth', authTeacher, isTeacherAuth);
teacherRouter.get('/logout', authTeacher, teacherLogout);

export default teacherRouter;