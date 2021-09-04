export interface IHttpResponse {
  statusCode: number;
  headers?: object;
  body?: string;
}
export const serializeHttpResponse = <Body extends object | string>({
  statusCode,
  headers,
  body,
}: {
  statusCode: number;
  headers?: object;
  body?: Body;
}): IHttpResponse => ({
  statusCode,
  headers: {
    ...{
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Pragma,X-Content-Type-Options',
    },
    ...(headers || {}),
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
