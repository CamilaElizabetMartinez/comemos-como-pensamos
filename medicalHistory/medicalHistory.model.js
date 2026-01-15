import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db/index.js';

const MedicalHistory = sequelize.define( 'MedicalHistory',{
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    appoinment_id: {
        type: DataTypes.UUID,
        foreignKey: true,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    treatment: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
})

MedicalHistory.associate = (models) => {
    MedicalHistory.belongsTo(models.Appointment, { onDelete: 'CASCADE' });
  };

export { MedicalHistory };