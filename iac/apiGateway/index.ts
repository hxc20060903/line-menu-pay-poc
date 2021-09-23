import { Construct } from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import type { ICertificate } from '@aws-cdk/aws-certificatemanager';
import type { Function } from '@aws-cdk/aws-lambda';
import { STAGE, API_DOMAIN_NAME } from '../env';

export const createApiGateway = (
  scope: Construct,
  {
    apiCertificate,
    lambda,
  }: {
    apiCertificate: ICertificate;
    lambda: {
      signUp: Function;
      submitOrder: Function;
    };
  }
) => {
  const apiGatewayRestApi = new apigateway.RestApi(scope, `kun-server`, {
    deployOptions: { stageName: STAGE },
    domainName: {
      domainName: API_DOMAIN_NAME,
      certificate: apiCertificate,
    },
  });

  const users = apiGatewayRestApi.root.addResource('users');
  users.addMethod('POST', new apigateway.LambdaIntegration(lambda.signUp));

  const orders = apiGatewayRestApi.root.addResource('orders');
  orders.addMethod('POST', new apigateway.LambdaIntegration(lambda.submitOrder));

  return apiGatewayRestApi;
};
