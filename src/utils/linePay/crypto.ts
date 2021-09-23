import { createHmac } from 'crypto';

export const createGETSignature = ({
  channelSecret,
  urlPath,
  queryString,
  nonce,
}: {
  channelSecret: string;
  urlPath: string;
  queryString: string;
  nonce: string;
}): string => {
  const hmac = createHmac('sha256', channelSecret);
  return hmac.update(`${channelSecret}${urlPath}${queryString.replace(/^[?]/, '')}${nonce}`).digest('base64');
};

export const createPOSTSignature = ({
  channelSecret,
  urlPath,
  body,
  nonce,
}: {
  channelSecret: string;
  urlPath: string;
  body: string | object;
  nonce: string;
}): string => {
  const hmac = createHmac('sha256', channelSecret);
  const finalBody = typeof body === 'string' ? body : JSON.stringify(body);
  return hmac.update(`${channelSecret}${urlPath}${finalBody}${nonce}`).digest('base64');
};
