import Joi from '@hapi/joi';
import { randomUUID } from 'crypto';
import urlJoin from 'url-join';
import { IHttpResponse, serializeHttpResponse } from '~/utils/http';
import { createLinePay, ILinePayOrderRequest } from '../../utils/linePay';
import { Env } from './env';
import { CancelToken, ConfirmToken, createJwt } from '~/utils/jwt';

interface IOrderProductBasic {
  id: string;
  quantity: number;
}
interface IOrderRequest {
  userId: string;
  products: Array<IOrderProductBasic>;
}

const schema = Joi.object<IOrderRequest>({
  userId: Joi.string(),
  products: Joi.array().items(
    Joi.object<IOrderProductBasic>({
      id: Joi.string(),
      quantity: Joi.number(),
    }).options({ presence: 'required' })
  ),
}).options({ presence: 'required' });
const linePay = createLinePay(Env.env);
const jwt = createJwt({ key: Env.jwtKey, iv: Env.jwtIv, secret: Env.jwtSecret });
const UNIT_PRICE = 50;

export const handler = async (event: { headers: {}; body: string }): Promise<IHttpResponse> => {
  console.log(event.body);
  const orderRequest: IOrderRequest = JSON.parse(event.body);
  const { error } = schema.validate(orderRequest);
  if (error) {
    return serializeHttpResponse({ statusCode: 400, body: error });
  }
  const orderId = randomUUID();
  const amount = orderRequest.products.reduce((reduced, next) => {
    return next.quantity * UNIT_PRICE + reduced;
  }, 0);
  const [confirmToken, cancelToken] = await Promise.all([
    jwt.sign({ orderId, action: 'confirm', amount } as ConfirmToken),
    jwt.sign({ orderId, action: 'cancel' } as CancelToken),
  ]);
  if (!confirmToken || !cancelToken) {
    return serializeHttpResponse({ statusCode: 500, body: 'Internal Error' });
  }
  const lineOrderRequest: ILinePayOrderRequest = {
    amount,
    currency: 'JPY',
    orderId,
    packages: [
      {
        id: 'TerraBucks',
        name: 'TerraBucks',
        amount,
        products: orderRequest.products.map((item) => ({
          id: item.id,
          name: `TerraBuck ${item.id}`,
          quantity: item.quantity,
          price: UNIT_PRICE,
        })),
      },
    ],
    redirectUrls: {
      // the extra ending-slash prevents cloudfront/S3 from swallowing querystring
      confirmUrl: urlJoin(Env.confirmUrl, '/', `?token=${confirmToken}`),
      cancelUrl: urlJoin(Env.cancelUrl, '/', `?token=${cancelToken}`),
    },
    options: {
      display: { locale: 'ja', checkConfirmUrlBrowser: true },
    },
  };

  try {
    const result = await linePay.startTransaction({
      body: lineOrderRequest,
      channelId: Env.lineChannelId,
      channelSecret: Env.lineChannelSecret,
    });
    console.log(result);
    if (result.returnCode === '0000') {
      return serializeHttpResponse({
        statusCode: 200,
        body: result.info.paymentUrl,
      });
    }
    return serializeHttpResponse({
      statusCode: 500,
      body: result.returnMessage,
    });
  } catch (err) {
    return serializeHttpResponse({
      statusCode: 500,
      body: 'Please try again later',
    });
  }
};
