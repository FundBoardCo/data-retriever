import fetch from 'node-fetch';
import { toQueryString } from '../app/utils';

exports.handler = async event => {
  const query = event.queryStringParameters;
  const { entity_id } = query;
  delete query.entity_id;

  query.user_key = process.env.REACT_APP_CB_APIKEY

  const API_PARAMS = toQueryString(query);
  const API_URL = `https://api.crunchbase.com/api/v4/entities/people/${entity_id}`;

  try {
    const response = await fetch(`${API_URL}?${API_PARAMS}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    console.log(response);
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify(err.message || err),
    };
  }
};
