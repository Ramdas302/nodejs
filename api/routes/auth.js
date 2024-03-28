const security = require('../middleware/security')
const { BadRequest, Unauthorized } = require('../utils/appErrors');
module.exports = function (server, express) {
    server.post("/create-user", async (req, res, next) => {
        try {
            var vStatus = new validator(req.body, {
                name:"required",
                username: "required",
                password: "required"
            });
            if (vStatus.fails()) {
                throw new BadRequest(vStatus.errors)
            }
            const data = await USER_AUTH.userSignup(req);
            res.send(data)
        } catch (err) {
            next(err)
        }
    });

    server.post("/auth", async (req, res, next) => {
        try {
            var vStatus = new validator(req.body, {
                username: "required",
                password: "required",
            });
            if (vStatus.fails()) {
                throw new BadRequest(vStatus.errors)
            }
            const data = await USER_AUTH.userLogin(req,res);
            res.send(data)
        } catch (err) {
            next(err)
        }
    });

    server.get("/get-details", async (req, res, next) => {
        try {
            const data = await USER_AUTH.getAllUsers();
            res.send(data)
        } catch (err) {
            next(err)
        }
    });

}