const jwt = require("jsonwebtoken");


module.exports = (req) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        return req;
    }
    const token = authHeader.split(' ')[1];
    if (!token || token === '') {
        req.isAuth = false;
        return req;
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretkey');
    } catch {
        req.isAuth = false;
        return req;
    }
    if (!decodedToken) {
        req.isAuth = false;
        return req;
    }
    req.isAuth = true;
    req.userId = decodedToken.userId; // in jwt.sign we put userId as part of crypted token
    return req;
}