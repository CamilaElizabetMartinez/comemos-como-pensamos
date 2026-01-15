import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db/index.js";

/**
 * The medical appointment model, reflecting the columns on the database
 */
const Appointment = sequelize.define('appointment', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    patient_id:{
        type: DataTypes.UUID,
        foreignKey: true,
    },
    patient_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patient_phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patient_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    specialty: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    hours: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'scheduled',
        validate: {
            is: /^(?:scheduled|completed|cancelled)/
        }
    },
    doctor_id: {
        type: DataTypes.UUID,
        foreignKey: true,
        allowNull: true,
    },
})

/**
 * Associate the required model (DOCTOR)
 * @param {object} models An object with all models
 * @param {Doctor} models.Doctor The doctor model
 */
Appointment.associate = (models) => {
    Appointment.belongsTo(models.Doctor, { 
        foreignKey: 'doctor_id',
        type: DataTypes.UUID,
        onDelete: 'CASCADE'
    });
    models.Doctor.hasMany(Appointment, {
        foreignKey: 'doctor_id',
        type: DataTypes.UUID,
        onDelete: 'CASCADE'
    });
    Appointment.belongsTo(models.Patient,{
        foreignKey: 'patient_id',
        type:DataTypes.UUID,
        onDelete: 'CASCADE'
    });
    models.Patient.hasMany(Appointment, {
        foreignKey: 'patient_id',
        type: DataTypes.UUID,
        onDelete: 'CASCADE'
    });
};


export { Appointment }