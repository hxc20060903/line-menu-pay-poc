import * as lambda from '@aws-cdk/aws-lambda';
import { Construct, Duration } from '@aws-cdk/core';
import path from 'path';
import fs from 'fs';
import { LAMBDA_DEST } from '../constant';

const name = path.basename(__filename, '.ts');
const source = path.join(LAMBDA_DEST, name);

export const createSignUp = (construct: Construct): lambda.Function => {
  if (!fs.existsSync(source)) {
    throw new Error(`Please check lambda path: ${source}`);
  }
  const func = new lambda.Function(construct, name, {
    runtime: lambda.Runtime.NODEJS_14_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(source),
    timeout: Duration.seconds(20),
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
    },
  });

  return func;
};
