export interface IEnv {
  env: 'PRODUCTION' | 'SANDBOX';
  lineChannelId: string;
  lineChannelSecret: string;
  jwtSecret: string;
  jwtKey: string;
  jwtIv: string;
}
const env = process.env as NodeJS.ProcessEnv & IEnv;

export const Env: IEnv = {
  env: env.env === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX',
  lineChannelId: env.lineChannelId,
  lineChannelSecret: env.lineChannelSecret,
  jwtSecret: env.jwtSecret,
  jwtKey: env.jwtKey,
  jwtIv: env.jwtIv,
};
