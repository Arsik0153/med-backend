const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]; // Extract token from authorization header
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const secret = process.env.JWT_SECRET; // Load secret from environment variable
        const decoded = jwt.verify(token, secret); // Verify token using JWT secret

        req.user = decoded.userId; // Attach user ID to the request object for access in protected routes
        next(); // If token is valid, continue to protected route
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" }); // Provide a more specific error message
    }
};

app.get("/test", (req, res) => {
    try {
        res.status(200).json({ message: "API is working" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "This is a protected route" });
});

// Authentication routes
const { login, register, refreshToken } = require("./src/auth");
app.post("/login", login);
app.post("/register", register);
app.post("/refresh-token", refreshToken);

const {
    getUserById,
    deleteUserById,
    getUsers,
    updateUser,
    createUser,
    getProfile,
} = require("./src/user");
app.get("/users", getUsers);
app.get("/users/:id", getUserById);
app.delete("/users/:id", deleteUserById);
app.put("/users/:id", updateUser);
app.post("/users", createUser);
app.get("/profile", authMiddleware, getProfile);

const {
    createSurveyResult,
    getSurveyById,
    getSurveys,
} = require("./src/survey");
app.get("/surveys", authMiddleware, getSurveys);
app.get("/surveys/:id", authMiddleware, getSurveyById);
app.post("/surveys", authMiddleware, createSurveyResult);

//doctor
const { createDoctor, getDoctors, getDoctorProfile } = require("./src/doctor");
app.get("/doctors", getDoctors);
app.post("/doctors", createDoctor);
app.get("/doctors/profile", authMiddleware, getDoctorProfile);

//clinic
const {
    createClinic,
    getClinicById,
    deleteClinic,
    getAllClinics,
} = require("./src/clinic");
app.post("/clinics", createClinic);
app.get("/clinics", getAllClinics);
app.get("/clinics/:id", getClinicById);
app.delete("/clinics/:id", deleteClinic);

//appointment
const appointmentController = require("./src/appointment");
app.get("/appointments", appointmentController.getAllAppointments);
app.get("/appointments/:id", appointmentController.getAppointment);
app.post("/appointments", appointmentController.createAppointment);
app.put("/appointments/:id", appointmentController.updateAppointment);
app.delete("/appointments/:id", appointmentController.deleteAppointment);
app.get(
    "/appointments/date/:date",
    appointmentController.getAppointmentsByDate
);
app.get(
    "/doctors/appointments/closest",
    appointmentController.getDoctorNextAppointments
);

// start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
