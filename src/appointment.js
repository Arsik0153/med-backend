const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                clinic: true,
                doctor: true,
                patient: true,
            },
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single appointment
exports.getAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id: Number(id) },
            include: {
                clinic: true,
                doctor: true,
                patient: true,
            },
        });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get appointment by date
exports.getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + 1
        );

        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startDate,
                    lt: endDate,
                },
                patientId: req.user,
            },
            include: {
                clinic: true,
                doctor: true,
                patient: true,
            },
        });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, clinicId, patientId, date, format } = req.body;
        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                clinicId,
                patientId,
                date,
                format,
            },
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctorId, clinicId, patientId, date, format } = req.body;
        const appointment = await prisma.appointment.update({
            where: { id: Number(id) },
            data: {
                doctorId,
                clinicId,
                patientId,
                date,
                format,
            },
        });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({
            where: { id: Number(id) },
        });
        res.status(204).json({ message: "Appointment deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDoctorNextAppointments = async (req, res) => {
    try {
        const now = new Date();

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: req.user,
                date: {
                    gte: now,
                },
            },
            include: {
                clinic: true,
                patient: true,
            },
            orderBy: {
                date: "asc",
            },
            take: 10,
        });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
