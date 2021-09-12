import { Construct } from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import type { IDistribution } from '@aws-cdk/aws-cloudfront';
import type { RestApi } from '@aws-cdk/aws-apigateway';
import { DOMAIN_NAME, API_DOMAIN_NAME, CDN_DOMAIN_NAME } from '../env';
import once from 'lodash/once';

export const createHostZone = once((scope: Construct) => {
  const hostZone = route53.HostedZone.fromLookup(scope, 'host-zone', {
    domainName: DOMAIN_NAME,
    privateZone: false,
  });
  return hostZone;
});

export const createRoute53 = (
  scope: Construct,
  {
    cdnDistribution,
    apiGatewayRestApi,
  }: {
    cdnDistribution: IDistribution;
    apiGatewayRestApi: RestApi;
  }
) => {
  const hostZone = createHostZone(scope);
  new route53.ARecord(scope, 'dns-to-cdn', {
    zone: hostZone,
    recordName: CDN_DOMAIN_NAME,
    target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(cdnDistribution)),
  });
  new route53.ARecord(scope, 'dns-to-api', {
    zone: hostZone,
    recordName: API_DOMAIN_NAME,
    target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(apiGatewayRestApi)),
  });
};
