import { MedicalHistoryService } from "./medicalHistory.service.js";
import { MedicalHistoryController } from "./medicalHistory.controller.js";
import { MedicalHistory } from "./medicalHistory.model.js";
import { MedicalHistoryRepository } from "./medialHistory.repository.js";

const medicalHistoryRepository = new MedicalHistoryRepository(MedicalHistory);
const medicalHistoryService = new MedicalHistoryService(medicalHistoryRepository);
const medicalHistoryController = new MedicalHistoryController(medicalHistoryService);

export { medicalHistoryController };