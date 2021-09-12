import type { Bucket } from '@aws-cdk/aws-s3';
import * as cloudFront from '@aws-cdk/aws-cloudfront';
import type { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Construct, Duration } from '@aws-cdk/core';
import { CDN_DOMAIN_NAME } from '../env';

export const createDistribution = (
  scope: Construct,
  {
    websiteBucket,
    certificate,
  }: {
    certificate: Certificate;
    websiteBucket: Bucket;
  }
) => {
  const webSiteDistribution = new cloudFront.CloudFrontWebDistribution(scope, 'kun-cdn', {
    originConfigs: [
      {
        customOriginSource: {
          domainName: websiteBucket.bucketWebsiteDomainName,
          originProtocolPolicy: cloudFront.OriginProtocolPolicy.HTTP_ONLY,
        },
        behaviors: [
          {
            compress: true,
            isDefaultBehavior: true,
            pathPattern: '*',
            allowedMethods: cloudFront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
            cachedMethods: cloudFront.CloudFrontAllowedCachedMethods.GET_HEAD,
            minTtl: Duration.seconds(1),
            maxTtl: Duration.days(365),
            defaultTtl: Duration.days(1),
          },
        ],
      },
    ],
    priceClass: cloudFront.PriceClass.PRICE_CLASS_200,
    viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    viewerCertificate: cloudFront.ViewerCertificate.fromAcmCertificate(certificate, {
      securityPolicy: cloudFront.SecurityPolicyProtocol.TLS_V1_2_2021,
      aliases: [CDN_DOMAIN_NAME],
    }),
    defaultRootObject: 'index.html',
  });

  return { webSiteDistribution };
};
