"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gameController_1 = __importDefault(require("../controllers/gameController"));
const router = express_1.default.Router();
router.post('/createNewGame', gameController_1.default.createNewGame);
router.post('/gameExists', gameController_1.default.checkGameExists);
exports.default = router;
