import Joi from '@hapi/joi';
import { IHttpResponse, serializeHttpResponse } from '~/utils/http';

interface Form {
  username: string;
  password: string;
  email: string;
}

const schema = Joi.object<Form>({
  username: Joi.string(),
  password: Joi.string(),
  email: Joi.string().email(),
}).options({ presence: 'required' });

export const handler = async (event: { headers: {}; body: string }): Promise<IHttpResponse> => {
  console.log(event.body);
  const form: Form = JSON.parse(event.body);
  const { error } = schema.validate(form);
  if (!error) {
    return serializeHttpResponse({ statusCode: 200 });
  }
  return serializeHttpResponse({ statusCode: 400, body: error });
};
