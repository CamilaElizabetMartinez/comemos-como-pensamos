class MedicalHistoryController{
    constructor(medicalHistoryService){
        this.medicalHistoryService = medicalHistoryService;
    }

    async createMedicalHistory (req, res) {
        try {
            const { appoinment_id } = req.params;
            const medicalHistoryData = {
                ...req.body,
                appoinment_id,
            };
            const newMedicalHistory = await this.medicalHistoryService.createMedicalHistory(medicalHistoryData);
            res.status(201).json(newMedicalHistory);
        }catch (error) {
            res.status(400).json({message: error.message});
        }
    }

    async getMedicalHistoryByPatient(req, res) {
        try {
            const { patient_id } = req.params;
            const medicalHistories = await this.medicalHistoryService.getMedicalHistoryByPatient(patient_id);

            if (!medicalHistories || medicalHistories.length === 0) {
                return res.status(404).json({ message: 'No se encontraron historias médicas para este paciente.' });
            }

            res.status(200).json(medicalHistories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al encontrar las historias médicas.', error: error.message });
        }
    }

    async updateMedicalHistory(req, res) {
        try {
            const { id } = req.params;
            const updatedData = req.body;
    
            if (!Object.keys(updatedData).length) {
                return res.status(400).json({ message: 'No se encontraron datos para actualizar.' });
            }
    
            const response = await this.medicalHistoryService.updateMedicalHistory(id, updatedData);
            res.status(200).json(response);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    

}

export { MedicalHistoryController };