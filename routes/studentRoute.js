
import express from 'express';
import { addStudent, getAllStudents, getStudentById, studentLogin, getCurrentStudent, updateStudent, updateStudentByTeacher, getStudentsInClass, getStudentByIdForStudent } from '../controllers/studentController.js';
import authStudent from '../middleware/authStudent.js';
import { authSeller } from '../middleware/authSeller.js';
import { authTeacher } from '../middleware/authTeacher.js';
const studentRouter = express.Router();

studentRouter.post('/add', authSeller, addStudent);
studentRouter.post('/login', studentLogin);
studentRouter.get('/me', authStudent, getCurrentStudent);
// seller/admin routes
studentRouter.get('/students', authSeller, getAllStudents);
studentRouter.get('/:id', authSeller, getStudentById);

// teacher endpoints (allows teacher to manage attendance/exam numbers)
studentRouter.get('/teacher/students', authTeacher, getAllStudents);
studentRouter.get('/teacher/:id', authTeacher, getStudentById);
studentRouter.put('/teacher/:id', authTeacher, updateStudentByTeacher);

// student routes: list classmates and view classmate details
studentRouter.get('/class', authStudent, getStudentsInClass);
studentRouter.get('/view/:id', authStudent, getStudentByIdForStudent);
studentRouter.put('/:id', authSeller, updateStudent);

export default studentRouter;