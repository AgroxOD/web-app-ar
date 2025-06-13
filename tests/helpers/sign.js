import jwt from 'jsonwebtoken';

export function sign(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: '1h', noTimestamp: true });
}
