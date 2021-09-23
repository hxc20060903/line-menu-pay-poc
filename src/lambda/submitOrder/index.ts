import Joi from '@hapi/joi';
import format from 'pupa';
import { randomUUID } from 'crypto';
import urlJoin from 'url-join';
import { IHttpResponse, serializeHttpResponse } from '~/utils/http';
import { createLinePay, ILinePayOrderRequest } from '../../utils/linePay';
import { Env } from './env';

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
const UNIT_PRICE = 50;

export const handler = async (event: { headers: {}; body: string }): Promise<IHttpResponse> => {
  console.log(event.body);
  const orderRequest: IOrderRequest = JSON.parse(event.body);
  const { error } = schema.validate(orderRequest);
  if (error) {
    return serializeHttpResponse({ statusCode: 400, body: error });
  }
  const orderId = randomUUID();
  const lineOrderRequest: ILinePayOrderRequest = {
    amount: orderRequest.products.reduce((reduced, next) => {
      return next.quantity * UNIT_PRICE + reduced;
    }, 0),
    currency: 'JPY',
    orderId,
    packages: [
      {
        id: 'TerraBucks',
        name: 'TerraBucks',
        amount: 1,
        products: orderRequest.products.map((item, index) => ({
          id: item.id,
          name: `TerraBuck Latte Type ${index}`,
          quantity: item.quantity,
          price: UNIT_PRICE,
        })),
      },
    ],
    redirectUrls: {
      confirmUrl: urlJoin(format(Env.confirmApi, [orderId]), `?token=confirm-${randomUUID()}`),
      cancelUrl: urlJoin(format(Env.cancelApi, [orderId]), `?token=cancel-${randomUUID}`),
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
