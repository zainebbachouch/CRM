const express = require("express");
const factureController = require("../controllers/factureController");
const router = express.Router();

//getAllFactures
router.get('/getInvoiceDetailsByCommandId/:CommandId', factureController.getInvoiceDetailsByCommandId);
router.get("/getAllFactures", factureController.getAllFactures);
router.put("/createInvoice",factureController.createInvoice);
router.delete("/deleteInvoice/:idcommande", factureController.deleteInvoiceByCommandId);
router.get("/getFactureOfClientAuthorized",factureController.getFactureOfClientAuthorized);


router.post("/createPDFInvoice", factureController.creatPDFInvoice);
router.get('/searchFactures', factureController.searchFactures);



module.exports = router;
