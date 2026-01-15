class MedicalHistoryService {
    constructor(medicalHistoryRepository) {
        this.medicalHistoryRepository = medicalHistoryRepository;
    }  

    async createMedicalHistory(medicalHistoryData) {
        const newMedicalHistory = await this.medicalHistoryRepository.create ({
            ...medicalHistoryData
            
        });
        return await this.medicalHistoryRepository.create(medicalHistoryData);
    }

    async getMedicalHistoryByPatient(patientId) {
        const medicalHistories = await this.medicalHistoryRepository.findByPatientId(patientId);
        return medicalHistories;
    }

    async updateMedicalHistory(id, updatedData) {
        const isUpdated = await this.medicalHistoryRepository.update(id, updatedData);
    
        if (!isUpdated) {
            throw new Error('No se encontró el historial médico o no se pudo actualizar.');
        }
    
        return { message: 'Historial médico actualizado con éxito.' };
    }
}

export { MedicalHistoryService};