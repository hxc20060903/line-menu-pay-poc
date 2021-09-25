import * as cdk from '@aws-cdk/core';

import { createSignUp, createSubmitOrder } from '../lambda';
import { createAcm } from '../acm';
import { createHostZone, createRoute53 } from '../route53';
import { createApiGateway } from '../apiGateway';
import { createS3 } from '../s3';
import { createDistribution } from '../cloudfront';
import { createConfirmOrder } from '../lambda/confirmOrder';

export class IacStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // route53-host-zone
    const hostedZone = createHostZone(this);
    // acm
    const { cdnCertificate, apiCertificate } = createAcm(this, { hostedZone: hostedZone });

    // lambda
    const signUpLambda = createSignUp(this);
    const submitOrderLambda = createSubmitOrder(this);
    const confirmOrderLambda = createConfirmOrder(this);
    const apiGatewayRestApi = createApiGateway(this, {
      apiCertificate,
      lambda: {
        signUp: signUpLambda,
        submitOrder: submitOrderLambda,
        confirmOrder: confirmOrderLambda,
      },
    });
    const { siteBucket } = createS3(this);
    const { webSiteDistribution } = createDistribution(this, {
      websiteBucket: siteBucket,
      certificate: cdnCertificate,
    });
    createRoute53(this, { cdnDistribution: webSiteDistribution, apiGatewayRestApi });
  }
}
