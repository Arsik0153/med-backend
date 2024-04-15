const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const { delay } = require("./utils/delay");
const prisma = new PrismaClient();

const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET; // Set a strong secret environment variable
    const token = jwt.sign({ userId }, secret, { expiresIn: "1h" }); // Adjust expiration time as needed
    return token;
};

const login = async (req, res) => {
    const { email, password } = req.body;
    await delay(1000);

    try {
        // First, check if the user exists
        let user = await prisma.user.findUnique({
            where: { email },
        });

        // If the user is not found, check if the email and password match a doctor
        if (!user) {
            const doctor = await prisma.doctor.findUnique({
                where: { email },
            });

            if (!doctor) {
                return res
                    .status(401)
                    .json({ message: "Invalid email or password" });
            }

            const isMatch = await bcrypt.compare(password, doctor.password);

            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "Invalid email or password" });
            }
            user = {
                ...doctor,
                role: "doctor",
            };
        } else {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "Invalid email or password" });
            }

            user = { ...user, role: "user" };
        }

        const token = generateToken(user);
        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const register = async (req, res) => {
    const { email, password, name, birthDate, gender } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Increase salt rounds for better security

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, birthDate, gender },
        });

        const token = generateToken(user.id);
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// backend/src/auth.js
const refreshToken = async (req, res) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const secret = process.env.JWT_SECRET;
        jwt.verify(token, secret); // This will throw an error if the token is expired
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const decoded = jwt.decode(token); // Decode the old token to get the user id
            const newToken = generateToken(decoded.userId); // Generate a new token
            return res.json({ token: newToken });
        } else {
            return res.status(401).json({ message: "Invalid token" });
        }
    }
};

module.exports = { login, register, refreshToken };
