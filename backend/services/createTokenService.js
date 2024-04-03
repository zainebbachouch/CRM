const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';
const creatToken = async (role, iduser, email, secretkey, duration) => {
    const token = jwt.sign({ role: role, id: iduser, email: email }, secretkey, { expiresIn: duration });
    return token;

}

module.exports = { creatToken }