import Student from "../models/Student.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const addStudent = async (req, res) => {
    try {
        const { studentName, fatherName, motherName, dob, scholarNumber, classed, password, examNumber } = req.body;
        if (!studentName || !fatherName || !motherName || !dob || !scholarNumber || !classed) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const rawPassword = password || scholarNumber;
        const hashed = await bcrypt.hash(rawPassword, 10);

        const student = await Student.create({
            studentName,
            classed,
            fatherName,
            motherName,
            dob,
            scholarNumber,
            examNumber: examNumber || "",
            password: hashed,
            // sellers are not allowed to add performance/attendance/marks;
            // default values in schema will handle these fields
        });
        return res.json({ success: true, message: "Student added successfully", student });
    } catch (error) {
        console.log(error);
        // handle duplicate key errors (e.g., scholarNumber or email already exists)
        if (error && (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000))) {
            const dupField = error.keyValue ? Object.keys(error.keyValue)[0] : null;
            const msg = dupField ? `${dupField} already exists` : 'Duplicate key error';
            return res.json({ success: false, message: msg });
        }
        return res.json({ success: false, message: error.message });
    }
}



// student login
export const studentLogin = async (req, res) => {
    try {
        const { scholarNumber, password } = req.body;
        if (!scholarNumber || !password) {
            return res.json({ success: false, message: "Scholar number and password required" });
        }
        const student = await Student.findOne({ scholarNumber });
        if (!student) {
            return res.json({ success: false, message: "Student not found" });
        }
        const match = await bcrypt.compare(password, student.password);
        if (!match) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, token, student });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// get current student
export const getCurrentStudent = async (req, res) => {
    try {
        const studentId = req.studentId;
        if (!studentId) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        const student = await Student.findById(studentId).select('-password');
        if (!student) {
            return res.json({ success: false, message: "Student not found" });
        }
        return res.json({ success: true, student });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// get students in the same class as current student
export const getStudentsInClass = async (req, res) => {
    try {
        const studentId = req.studentId;
        if (!studentId) return res.json({ success: false, message: "Unauthorized" });

        const me = await Student.findById(studentId);
        if (!me) return res.json({ success: false, message: "Student not found" });

        const students = await Student.find({ classed: me.classed }).select('-password').sort({ createdAt: -1 });
        return res.json({ success: true, students });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// get a student by id but only if they're in the same class as requester (or requester is the same student)
export const getStudentByIdForStudent = async (req, res) => {
    try {
        const requesterId = req.studentId;
        const { id } = req.params;

        if (!requesterId) return res.json({ success: false, message: "Unauthorized" });

        const requester = await Student.findById(requesterId);
        if (!requester) return res.json({ success: false, message: "Student not found" });

        const target = await Student.findById(id).select('-password');
        if (!target) return res.json({ success: false, message: "Student not found" });

        if (String(requester._id) === String(target._id) || requester.classed === target.classed) {
            return res.json({ success: true, student: target });
        }

        return res.json({ success: false, message: "Access denied: not in your class" });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

//  get all student /api/student/students

export const getAllStudents = async (req, res) => {

    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json({ success: true, students });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// update student by id (admin)
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        // sellers should never be able to change performance or marks directly
        delete updates.performance;
        delete updates.marks;
        // if password is being updated, hash it
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        const student = await Student.findByIdAndUpdate(id, updates, { new: true });
        if (!student) {
            return res.json({ success: false, message: "Student not found" });
        }
        return res.json({ success: true, student });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// teacher can only update attendance and marks (examNumber is no longer changeable here)
export const updateStudentByTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { attendance, marks } = req.body;
        const updates = {};
        if (attendance !== undefined) {
            // allow either the legacy object or monthly array
            if (Array.isArray(attendance.monthly)) {
                // replace monthly attendance completely
                updates.attendance = {
                    monthly: attendance.monthly.map(a => ({
                        month: a.month || '',
                        present: Number(a.present) || 0,
                        absent: Number(a.absent) || 0,
                        total: Number(a.total) || ((Number(a.present) || 0) + (Number(a.absent) || 0))
                    }))
                };
            } else {
                const present = Number(attendance.present) || 0;
                const absent = Number(attendance.absent) || 0;
                updates.attendance = { present, absent, total: present + absent };
            }
        }
        if (marks !== undefined) {
            updates.marks = marks;
        }
        const student = await Student.findByIdAndUpdate(id, updates, { new: true });
        if (!student) {
            return res.json({ success: false, message: "Student not found" });
        }
        return res.json({ success: true, student });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// get student by id /api/student/:id
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) {
            return res.json({ success: false, message: "Student not found" });
        }
        return res.json({ success: true, student });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}
