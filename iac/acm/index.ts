import { Construct } from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { API_CERT_DOMAIN_NAME, CDN_CERT_DOMAIN_NAME } from '../env';

export const createAcm = (scope: Construct, { hostedZone }: { hostedZone: route53.IHostedZone }) => {
  const cdnCertificate = new acm.DnsValidatedCertificate(scope, 'cdn-cert', {
    domainName: CDN_CERT_DOMAIN_NAME,
    region: 'us-east-1', // cloudfront restriction
    hostedZone,
  });
  const apiCertificate = new acm.DnsValidatedCertificate(scope, 'api-cert', {
    domainName: API_CERT_DOMAIN_NAME,
    hostedZone,
  });

  return { cdnCertificate, apiCertificate };
};
