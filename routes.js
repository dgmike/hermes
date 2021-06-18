const { Router } = require("express");
const loginController = require("./controllers/login");
const clientsController = require("./controllers/clients");

const router = Router();

router.get("/", loginController.home);
router.post("/login", loginController.login);
router.get("/logout", loginController.logout);
router.get("/dashboard", loginController.secureRoute, loginController.dashboard);

router.all("/clients*", loginController.secureRoute);
router.get("/clients", clientsController.index);
router.get("/clients/new", clientsController.create);
router.post("/clients", clientsController.store);
router.get("/clients/:client_id/edit", clientsController.edit);
router.post("/clients/:client_id", clientsController.update);

module.exports = router;
