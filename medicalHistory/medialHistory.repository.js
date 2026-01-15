class MedicalHistoryRepository{
    constructor(medicalHistoryModel){
        this.medicalHistoryModel = medicalHistoryModel;
    }
    
    async findById(id){
        return await this.medicalHistoryModel.findByPk(id);
    }

    async create(medicalHistoryData){
        return await this.medicalHistoryModel.create(medicalHistoryData);
    }

    async findByPatientId(patientId) {
        return await this.medicalHistoryModel.findAll({
            where: {
                '$Appoinment.patient_id$': patientId,
            },
            include: [
                {
                    model: Appoinment,
                    required: true,
                    attributes: [
                        'id',
                        'patient_name',
                        'specialty',
                        'date',
                        'status'
                    ],
                }
            ],
        });
    }

    async update(id, updatedData) {
        const [affectedRows] = await this.medicalHistoryModel.update(updatedData, {
            where: { id },
        });
        return affectedRows > 0;
    }
}

export { MedicalHistoryRepository };