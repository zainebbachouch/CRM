const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';
const creatToken = async (iduser, email, secretkey, duration) => {
    const token = jwt.sign({ id: iduser, email: email }, secretkey, { expiresIn: duration });
    return token;

}

module.exports = { creatToken }