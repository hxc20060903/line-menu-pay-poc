import axios from 'axios';
import { randomUUID } from 'crypto';
import jsonBigInt from 'json-bigint';
import type { BigNumber } from 'bignumber.js';
import { createPOSTSignature } from './crypto';

type Currency = 'JPY';
interface IOrderProductLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
export interface ILinePayOrderRequest {
  amount: number;
  currency: Currency;
  orderId: string;
  packages: Array<{
    id: string;
    name: string;
    amount: number;
    products: Array<IOrderProductLine>;
  }>;
  redirectUrls: {
    confirmUrl: string;
    cancelUrl: string;
  };
  options?: {
    display: { locale: string; checkConfirmUrlBrowser: boolean };
  };
}

const EndPoint = {
  SANDBOX: 'https://sandbox-api-pay.line.me',
  PRODUCTION: 'https://api-pay.line.me',
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createLinePay = (mode: keyof typeof EndPoint) => {
  const baseURL = EndPoint[mode];

  const post = (
    {
      body,
      channelId,
      channelSecret,
    }: {
      body: object;
      channelId: string;
      channelSecret: string;
    },
    urlPath: string
  ) => {
    const nonce = randomUUID();
    const data = JSON.stringify(body);
    const sig = createPOSTSignature({ channelSecret, body: data, nonce, urlPath });

    return axios({
      method: 'POST',
      baseURL,
      url: urlPath,
      headers: {
        'X-LINE-ChannelId': channelId,
        'X-LINE-Authorization': sig,
        'X-LINE-Authorization-Nonce': sig,
        'Content-Type': 'application/json',
      },
      data,
      transformResponse: jsonBigInt.parse,
    });
  };

  const startTransaction = async (payload: {
    body: ILinePayOrderRequest;
    channelId: string;
    channelSecret: string;
  }) => {
    const urlPath = '/v3/payments/request';
    try {
      const response = await post(payload, urlPath);
      const result: {
        returnCode: string;
        returnMessage: string;
        info: {
          paymentUrl: {
            web: string;
            app: string;
          };
          transactionId: BigNumber;
          paymentAccessToken: string;
        };
      } = response.data;
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const confirmTransaction = async (payload: {
    body: { amount: number; currency: Currency };
    channelId: string;
    channelSecret: string;
    transactionId: string;
  }) => {
    const urlPath = `/v3/payments/${payload.transactionId}/confirm`;
    try {
      const response = await post(payload, urlPath);
      const result: {
        returnCode: string;
        returnMessage: string;
        info: {
          transactionId: BigNumber;
          orderId: string;
          payInfo: Array<{ method: 'BALANCE'; amount: 1000 }>;
        };
        packages: Array<{
          id: string;
          amount: BigNumber;
          userFeeAmount: BigNumber;
          products: Array<{ id: string; name: string; quantity: 2; price: BigNumber }>;
        }>;
      } = response.data;
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    startTransaction,
    confirmTransaction,
  };
};
