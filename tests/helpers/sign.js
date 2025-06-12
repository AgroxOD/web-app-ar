import jwt from 'jsonwebtoken';

export function sign(payload, secret) {
  return jwt.sign(payload, secret, { noTimestamp: true });
}
