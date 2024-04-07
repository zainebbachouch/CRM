const jwt = require('jsonwebtoken');
require("dotenv").config();



const isAuthorize = async (req, res) => {
    //   console.log('Request headerssssssssssssssssssss:', req.headers);

    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return ({ message: 'Unauthorized' })
        }

        const authToken = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!decode) {
            return ({ message: 'Unauthorized' })
        }
        // console.log(decode);
        /*console.log('hhhhhhhhhhhh:', decode.type);
          if (!decode.type || (decode.type !== 'admin' && decode.type !== 'client' && decode.type !== 'employe')) {
              return res.status(401).json({ message: 'Unauthorized: User type not found or invalid' });
          }
          console.log('User type:', decode.type);*/


        //  req.user = decode;

        return ({ message: 'authorized', decode })

    } catch (error) {
        console.log(error.message);
        return ({ message: 'Server erroooooooooooor' });
    }
};

module.exports = { isAuthorize };
