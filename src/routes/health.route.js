import express from 'express';
import { healthCheck } from '../controllers/health.controllers.js';



const healthRouter = express.Router();

healthRouter.get('/', healthCheck);

export default healthRouter;