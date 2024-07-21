const express = require("express");
const commandsController = require("../controllers/commandsContoller");
const router = express.Router();

router.get("/getAllCommands", commandsController.getAllCommands);
router.get('/searchCommands/:searchTerm', commandsController.searchCommands);

router.put("/updateStatus", commandsController.updateCommandStatus);
router.get("/getCommandsByClientId/:clientId", commandsController.getCommandsByClientId);
router.get("/getCommandsByCommandId/:CommandId", commandsController.getCommandsByCommandId);
router.get("/getCustomerByIDCommand/:CommandId", commandsController.getCustomerByIDCommand);

module.exports = router;
