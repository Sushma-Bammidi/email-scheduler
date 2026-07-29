import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';

const router = Router();

router.post('/schedule', EmailController.schedule);
router.get('/scheduled', EmailController.getScheduled);
router.get('/sent', EmailController.getSent);
router.get('/stats', EmailController.getStats);

export default router;
