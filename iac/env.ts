import dotenv from 'dotenv';
import { isNil } from 'lodash';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const STAGE = NODE_ENV === 'development' ? 'dev' : NODE_ENV === 'production' ? 'prod' : 'test';

export const DOMAIN_NAME = 'hxcstatic.tk';
export const CDN_CERT_DOMAIN_NAME = `*.cdn.${DOMAIN_NAME}`;
export const API_CERT_DOMAIN_NAME = `*.api.${DOMAIN_NAME}`;
export const CDN_DOMAIN_NAME = CDN_CERT_DOMAIN_NAME.replace('*', STAGE);
export const API_DOMAIN_NAME = API_CERT_DOMAIN_NAME.replace('*', STAGE);
export const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID as string;
export const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_KEY = process.env.JWT_KEY as string;
export const JWT_IV = process.env.JWT_IV as string;

export const ensureEnv = <T extends object>(environment: T): T => {
  Object.entries(environment).forEach(([key, value]) => {
    if (isNil(value)) {
      throw new Error(`${key} is not properly set`);
    }
  });
  return environment;
};
