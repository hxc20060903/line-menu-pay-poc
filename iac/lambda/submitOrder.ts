import * as lambda from '@aws-cdk/aws-lambda';
import { Construct, Duration } from '@aws-cdk/core';
import fs from 'fs';
import path from 'path';
import urljoin from 'url-join';
import { STAGE, LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, API_DOMAIN_NAME } from '../env';
import { IEnv } from '../../src/lambda/submitOrder/env';
import { LAMBDA_DEST } from '../constant';

const name = path.basename(__filename, '.ts');
const source = path.join(LAMBDA_DEST, name);

export const createSubmitOrder = (construct: Construct): lambda.Function => {
  if (!fs.existsSync(source)) {
    throw new Error(`Please check lambda path: ${source}`);
  }
  const environment: IEnv = {
    env: STAGE === 'prod' ? 'PRODUCTION' : 'SANDBOX',
    confirmApi: urljoin(`https://${API_DOMAIN_NAME}`, 'orders', '{0}', 'confirm'),
    cancelApi: urljoin(`https://${API_DOMAIN_NAME}`, 'orders', '{0}', 'cancel'),
    lineChannelId: LINE_CHANNEL_ID,
    lineChannelSecret: LINE_CHANNEL_SECRET,
  };

  const func = new lambda.Function(construct, name, {
    runtime: lambda.Runtime.NODEJS_14_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(source),
    timeout: Duration.seconds(20),
    environment: environment as unknown as Record<string, string>,
  });

  return func;
};
