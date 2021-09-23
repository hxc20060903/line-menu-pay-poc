export interface IEnv {
  env: 'PRODUCTION' | 'SANDBOX';
  confirmApi: string;
  cancelApi: string;
  lineChannelId: string;
  lineChannelSecret: string;
}

export const Env: IEnv = {
  env: process.env.ENV === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX',
  confirmApi: process.env.CONFIRM_API as string,
  cancelApi: process.env.CANCEL_API as string,
  lineChannelId: process.env.lineChannelId as string,
  lineChannelSecret: process.env.lineChannelSecret as string,
};
