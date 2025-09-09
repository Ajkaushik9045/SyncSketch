import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../Config/env.ts';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn,
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

// export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
//   const options: SignOptions = {
//     expiresIn: config.jwt.refreshExpiresIn,
//   };
//   return jwt.sign(payload, config.jwt.refreshSecret, options);
// };

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

// export const verifyRefreshToken = (token: string): JwtPayload => {
//   return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
// };

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
