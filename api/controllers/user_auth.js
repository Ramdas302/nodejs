const { NotFound, BadRequest, Unauthorized, Conflict } = require('../utils/appErrors');
module.exports = {
    userSignup: async function (req) {
        var dataParams = req.body
        let dbQuery = `SELECT username FROM user WHERE username = '${dataParams.username.trim()}'`
        var findUser = await db_query(dbQuery);
        if (findUser.status && findUser.data.length > 0) {
            throw new Conflict('This user is already in use!')
        } else {
            var hash = await bcrypt.hash(dataParams.password, 10);
            var userdata = {
                name: dataParams.name ? dataParams.name : "",
                username: dataParams.username ? dataParams.username : "",
                password: hash,
            };
            var registerData = await db_insertQ1("user", userdata);
            if (registerData.status && registerData.data) {
                req.log.info('user successfully register');
                return ({ status: "success", msg: 'user successfully register', data: registerData.data })
            } else {
                return ({ status: "error", msg: registerData.data, data: "" })
            }
        }
    },

    userLogin: async function (req, res) {
        var dataParams = req.body
        let dbQuery = `SELECT * FROM user WHERE username = '${dataParams.username}'`
        var findUser = await db_query(dbQuery);
        if (!findUser.status) {
            throw new Unauthorized('user not found')
        } else {
            var bResult = await bcrypt.compare(dataParams.password, findUser.data[0].password);
            if (!bResult) {
                throw new Unauthorized('password is incorrect')
            } else {
                if (findUser.data[0].isActive === "false") {
                    return ({ status: "error", msg: "user is not active", data: findUser.data[0] });
                } else {
                    const accessToken = jwt.sign(
                        { USERID: findUser.data[0].username },
                        process.env.SECRET_KEY,
                        { expiresIn: process.env.JWT_EXPIRE }
                    );
                    const refreshToken = jwt.sign(
                        { USERID: findUser.data[0].username },
                        process.env.SECRET_KEY,
                        {}
                    );
                    res.cookie('auth-token', accessToken, { httpOnly: true });
                    res.cookie('refresh-token', refreshToken, { httpOnly: true });
                    return ({
                        status: "success",
                        token: accessToken,
                        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
                        userid: findUser.data[0].username,
                    });

                }
            }
        }
    },

    getAllUsers: async function (req, res) {
        let dbQuery = `SELECT * FROM user`
        var findUser = await db_query(dbQuery);
        if (!findUser.status) {
            return ({status:"error",msg:'user data not found'})
        } else {
           return ({status:"success",data:findUser.data})
        }
    }
}