import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
export function generateToken(user) {
    const payload = {
        id: user.id,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
//# sourceMappingURL=generateToken.js.map