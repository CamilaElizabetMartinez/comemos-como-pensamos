import { Router } from "express";
import { medicalHistoryController } from "../../../modules/medicalHistory/medicalHistory.js";

const medicalHistoryRoutes = Router();

medicalHistoryRoutes.post('/:appoiment_id',(req, res) =>{
    medicalHistoryController.createMedicalHistory(req, res)
});
    
medicalHistoryRoutes.get('/:patient_id', (req, res) => {
    medicalHistoryController.getMedicalHistoryByPatient.bind(req, res)
});

medicalHistoryRoutes.put('/:id', (req, res) => {
    medicalHistoryController.updateMedicalHistory(req, res)
});


export default medicalHistoryRoutes;