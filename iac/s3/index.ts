import { Construct } from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { CfnOutput } from '@aws-cdk/core';

export const createS3 = (scope: Construct) => {
  const siteBucket = new s3.Bucket(scope, 'siteBucket', {
    websiteIndexDocument: 'index.html',
    websiteErrorDocument: '404.html',
    publicReadAccess: true,
    versioned: false,
  });
  new CfnOutput(scope, 'SiteBucket', { value: siteBucket.bucketName });
  new CfnOutput(scope, 'SiteBucketWebsite', { value: siteBucket.bucketWebsiteDomainName });
  return { siteBucket };
};
