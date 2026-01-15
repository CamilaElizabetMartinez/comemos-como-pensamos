import { Appointment } from "./appointment.model.js";
import { Model, Op, where } from "sequelize";

/**
 * Repository component of the Appointment Entity, calling the appropiate Sequelize functions
 */
class AppointmentRepository {
    /**
     * Start up the Appointment Repository component
     * @param { Appointment } appointmentModel The Appointment model
     */
    constructor(appointmentModel) {
        this.appointmentModel = appointmentModel;
    }

    /**
     * 
     * @param {string} id The ID of the appointment to update
     * @param {"scheduled"|"completed"|"cancelled"} newStatus 
     * @returns 
     */
    async updateStatus(id, newStatus) {
        const appointment = await this.appointmentModel.findByPk(id);
        appointment.status = newStatus;
        return await appointment.save();
    }

    /**
     * Add a doctor_id to a desired appointment
     * @param {string} id The ID of the appointment to update
     * @param {string} doctor_id The ID of the Doctor
     * @returns {Model} The updated Appointment
     */
    async updateDoctorId(id, doctor_id) {
        const appointment = await this.appointmentModel.findByPk(id);
        appointment.doctor_id = doctor_id;
        return await appointment.save();
    }

    /**
     * Fetch all appointments
     * @returns { Appointment[] } All appointments
     */
    async findAll() {
        return await this.appointmentModel.findAll();
    }

    /**
     * Fetch all appointments without a doctor assigned
     * @returns { Appointment[] } All appointments without a doctor assigned
     */
    async findUnassigned() {
        return await this.appointmentModel.findAll({
            where: {
                doctor_id: {
                    [Op.eq]: null
                }
            }
        });
    }

    /**
     * Fetch all appointments with an assigned doctor
     * @returns { Appointment[] } All appointments with a doctor assigned to them
     */
    async findAssigned() {
        return await this.appointmentModel.findAll({
            where: {
                doctor_id: {
                    [Op.not]: null
                }
            }
        });
    }

    /**
     * Fetch all finished or completed appointments
     * @returns { Appointment[] } All finished/completed appointments
     */
    async findFinished() {
        return await this.appointmentModel.findAll({
            where: {
                status: {
                    [Op.eq]: "completed"
                }
            }
        });
    }

    /**
     * Create an appointment record
     * @param { Appointment } appointmentData The fields of the new data 
     * @returns { Model } The model object of the saved Appointment record
     */
    async create(appointmentData) {
        return await this.appointmentModel.create(appointmentData);
    }
}

export { AppointmentRepository }