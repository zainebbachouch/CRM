const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';

const isAuthorize = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')
            || !req.headers.authorization.split(' ')[1]) {
            return res.status(422).json({ message: 'Please provide a valid token' });
        }

        const authToken = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(authToken, JWT_SECRET);

        if (!decode) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = decode;

        next();

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { isAuthorize };