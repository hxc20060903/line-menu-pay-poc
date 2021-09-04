import * as cdk from '@aws-cdk/core';
import { createSignUp } from '../lambda';

export class IacStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda
    createSignUp(this);
  }
}
