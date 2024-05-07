const express = require("express");
const commandsController = require("../controllers/commandsContoller");
const router = express.Router();

router.get("/getAllCommands", commandsController.getAllCommands);
router.put("/updateStatus", commandsController.updateCommandStatus);
router.get("/getCommandsByClientId/:clientId", commandsController.getCommandsByClientId);
router.get("/getCommandsByCommandId/:CommandId", commandsController.getCommandsByCommandId);


module.exports = router;
