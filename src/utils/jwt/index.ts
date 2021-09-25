import jwt, { JwtPayload } from 'jsonwebtoken';
import { createCipheriv, createDecipheriv } from 'crypto';

export * from './types';

const AES = 'aes-256-cbc';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createJwt = ({ key, iv, secret }: { key: string; iv: string; secret: string }) => {
  return {
    sign: async (value: object): Promise<string | null> => {
      try {
        const signedToken = await new Promise<string>((resolve, reject) => {
          jwt.sign(value, secret, (err, token) => {
            if (err || !token) {
              return reject(err);
            }
            resolve(token);
          });
        });
        const cipher = createCipheriv(AES, key, iv);
        const encrypted = cipher.update(signedToken, 'utf-8', 'base64');
        return encrypted + cipher.final('base64');
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    verify: async <T = JwtPayload>(token: string): Promise<T | null> => {
      try {
        const decipher = createDecipheriv(AES, key, iv);
        // AWS turns "+" in a url-query into a space
        const sanitizedToken = token.replace(/\s/g, '+');
        const decrypted = decipher.update(sanitizedToken, 'base64', 'utf-8');
        const signedToken = decrypted + decipher.final('utf-8');
        const data = await new Promise<T>((resolve, reject) => {
          jwt.verify(signedToken, secret, (err, value) => {
            if (err) {
              return reject(err);
            }
            resolve(value as T);
          });
        });
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  };
};
