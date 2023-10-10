import express from 'express';
import gameController from '../controllers/gameController';


const router = express.Router();

router.post('/createNewGame', gameController.createNewGame);

export default router
