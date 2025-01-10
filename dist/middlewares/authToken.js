import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
export function authToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se encontró el token.' });
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token no válido.' });
    }
}
//# sourceMappingURL=authToken.js.map