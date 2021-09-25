import * as lambda from '@aws-cdk/aws-lambda';
import { Construct, Duration } from '@aws-cdk/core';
import fs from 'fs';
import path from 'path';
import { STAGE, LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, JWT_SECRET, JWT_KEY, JWT_IV, ensureEnv } from '../env';
import { IEnv } from '../../src/lambda/confirmOrder/env';
import { LAMBDA_DEST } from '../constant';

const name = path.basename(__filename, '.ts');
const source = path.join(LAMBDA_DEST, name);

export const createConfirmOrder = (construct: Construct): lambda.Function => {
  if (!fs.existsSync(source)) {
    throw new Error(`Please check lambda path: ${source}`);
  }
  const environment = ensureEnv<IEnv>({
    env: STAGE === 'prod' ? 'PRODUCTION' : 'SANDBOX',
    lineChannelId: LINE_CHANNEL_ID,
    lineChannelSecret: LINE_CHANNEL_SECRET,
    jwtIv: JWT_IV,
    jwtKey: JWT_KEY,
    jwtSecret: JWT_SECRET,
  });

  return new lambda.Function(construct, name, {
    runtime: lambda.Runtime.NODEJS_14_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(source),
    timeout: Duration.seconds(20),
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      ...environment,
    },
  });
};
