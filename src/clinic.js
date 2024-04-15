const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createClinic = async (req, res) => {
    try {
        const { name, address, phone } = req.body;

        const clinic = await prisma.clinic.create({
            data: {
                name,
                address,
                phone,
            },
        });

        res.status(201).json(clinic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllClinics = async (req, res) => {
    try {
        const clinics = await prisma.clinic.findMany();
        res.status(200).json(clinics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getClinicById = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await prisma.clinic.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }

        res.status(200).json(clinic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteClinic = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.clinic.delete({
            where: {
                id: parseInt(id),
            },
        });

        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClinic,
    getAllClinics,
    getClinicById,
    deleteClinic,
};
