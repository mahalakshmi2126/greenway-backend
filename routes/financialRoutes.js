import express from "express";
import {
    addFinancial,
    getFinancials,
    updateFinancial,
    deleteFinancial,
} from "../controllers/financialController.js";
import { uploadFinancial } from "../middleware/uploadFinancial.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Public
router.get("/", getFinancials);

// Admin
router.post(
    "/add",
    protect,
    uploadFinancial.single("pdf"),
    addFinancial
);

router.put(
    "/update/:id",
    protect,
    uploadFinancial.single("pdf"),
    updateFinancial
);

router.delete(
    "/delete/:id",
    protect,
    deleteFinancial
);

export default router;