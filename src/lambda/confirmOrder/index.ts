import Joi from '@hapi/joi';
import { IHttpResponse, serializeHttpResponse } from '~/utils/http';
import { ConfirmToken, createJwt } from '~/utils/jwt';
import { createLinePay } from '~/utils/linePay';

import { Env } from './env';

const linePay = createLinePay(Env.env);
const jwt = createJwt({ key: Env.jwtKey, iv: Env.jwtIv, secret: Env.jwtSecret });
const BEARER = /^Bearer (\S+)$/;
interface RequestBody {
  orderId: string;
  transactionId: string;
}
const schema = Joi.object<RequestBody>({
  orderId: Joi.string(),
  transactionId: Joi.string(),
}).options({ presence: 'required' });

export const handler = async (event: {
  headers: { Authorization: string };
  body: string;
}): Promise<IHttpResponse> => {
  console.log(event);

  const {
    headers: { Authorization },
  } = event;
  const tokenMatch = Authorization.match(BEARER);
  if (!tokenMatch) {
    return serializeHttpResponse({ statusCode: 403, body: 'Header Authorization Error' });
  }
  const token = tokenMatch[1];

  const body = JSON.parse(event.body);
  const validation = schema.validate(body);
  if (validation.error) {
    return serializeHttpResponse({ statusCode: 400, body: validation.error });
  }
  const { orderId, transactionId } = body as RequestBody;

  const data = await jwt.verify<ConfirmToken>(token);
  if (!data || data.action !== 'confirm' || data.orderId !== orderId) {
    return serializeHttpResponse({ statusCode: 403, body: 'Header Authorization Error. Incorrect Token.' });
  }

  const result = await linePay.confirmTransaction({
    channelId: Env.lineChannelId,
    channelSecret: Env.lineChannelSecret,
    body: { amount: data.amount, currency: 'JPY' },
    transactionId,
  });
  console.warn(result);
  if (result.returnCode === '0000') {
    return serializeHttpResponse({ statusCode: 200, body: 'ok' });
  }
  return serializeHttpResponse({ statusCode: 500, body: result.returnMessage });
};
