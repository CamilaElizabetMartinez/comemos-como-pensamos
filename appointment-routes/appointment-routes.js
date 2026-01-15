import { Router } from "express";
import { appointmentController } from "../../../modules/appointment/appointment.js"
import { doctorController } from "../../../modules/doctor/doctor.js";

const appointmentRoutes = new Router();

// GET
appointmentRoutes.get("/", (req, res) => {appointmentController.getAppointments(req, res)});
appointmentRoutes.get('/doctorsEsp', (req, res) => {doctorController.getDoctorBySpecialty(req, res)});

// POST
appointmentRoutes.post("/schedule", (req, res) => {appointmentController.schedule(req, res)});

// PATCH
appointmentRoutes.patch("/:appointment_id/doctor", (req, res) => {appointmentController.assignDoctor(req, res)});
appointmentRoutes.patch("/:appointment_id/status", (req, res) => {appointmentController.updateStatus(req, res)});


export default appointmentRoutes;