const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.post("/login", async (req, res) => {

    try {

        const { studentId, password } = req.body;

        if (!studentId || !password) {
            return res.status(400).json({
                message: "Student ID and password are required."
            });
        }

        const result = await pool.query(
            "SELECT * FROM students WHERE student_id = $1",
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid Student ID or Password."
            });
        }

        const student = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid Student ID or Password."
            });
        }

        res.json({
            success: true,
            student: {
                name: student.name,
                studentId: student.student_id,
                rollNumber: student.roll_number,
                course: student.course,
                semester: student.semester,
                attendance: student.attendance,
                marks: student.marks
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
