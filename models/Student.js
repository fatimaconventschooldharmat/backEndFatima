import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({

    // basic identity fields - sellers may not supply all of these initially
    studentName: { type: String, default: "" },
    email: { type: String, unique: true, sparse: true },
    classed: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    dob: { type: String, default: "" },
    scholarNumber: { type: String, required: true, unique: true },
    examNumber: { type: String, default: "" },
    password: { type: String, required: true },

    // performance per subject (old style)
    performance: [
        {
            subject: { type: String },
            // we only store totalMarks now; previous versions included
            // activityMarks/textMarks but those are deprecated and ignored
            totalMarks: { type: Number, default: 0 },
        }
    ],

    // attendance stats
    attendance: {
        present: { type: Number, default: 0 },
        absent: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        // monthly breakdown, each record refers to one month
        monthly: [
            {
                month: { type: String, enum: ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', ''], default: '' },
                total: { type: Number, default: 0 },
                present: { type: Number, default: 0 },
                absent: { type: Number, default: 0 },
            }
        ],
    },

    // extended marks structure managed by teacher
    marks: {
        monthly: [
            {
                month: {
                    type: String,
                    enum: ['June', 'July', 'August', 'September', 'October', 'November',
                        'December', 'January', 'February', 'March', 'April', ''],
                    default: ''
                },
                subject: { type: String },
                totalMarks: { type: Number, default: 0 },
            }
        ],
        quarterly: [
            {
                subject: { type: String },
                totalMarks: { type: Number, },
            }
        ],
        halfYearly: [
            {
                subject: { type: String },
                totalMarks: { type: Number, },
            }
        ],
        annual: [
            {
                subject: { type: String },
                totalMarks: { type: Number, default: 0 },
            }
        ],
    },
}, { minimize: false })

// ensure unique index on scholarNumber (explicit index ensures Mongo creates it)
studentSchema.index({ scholarNumber: 1 }, { unique: true });

const Student = mongoose.models.student || mongoose.model('student', studentSchema);

export default Student;