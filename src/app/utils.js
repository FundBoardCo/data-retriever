export function processErr(err) {
  console.log(err);
  if (!err) return false;
  if (err.response && err.response.data) {
    const { data } = err.response;
    if (data.error) {
      if (typeof data.error === 'object') {
        return JSON.stringify(data.error);
      }
      return data.error;
    }
    if (data.error_msg) {
      return data.error_msg;
    }
    if (Array.isArray(data)) {
      const m = data[0];
      return `${m.code ? `Code: ${m.code}` : ''} 
      ${m.collection_id ? `Collection: ${m.collection_id}` : ''} 
      ${m.message ? m.message : ''}`;
    }
    return err.response.data;
  }
  if (err.message) return err.message;
  if (typeof err === 'object') return JSON.stringify(err);
  // TODO: detect 401 errors and inject a login link here if the user is logged out
  return err;
}

export function statusIsError(state) {
  return !!state && !['pending', 'succeeded'].includes(state);
}

export function capitalizeFirstLetter(str) {
  if (typeof str !== 'string') return '';
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

// from https://stackoverflow.com/a/43105324
// This is needed to get array values into the right format.
// It should also cover any future nested object values.
const format = (k, v) => (v ? `${k}=${encodeURIComponent(v)}` : '');

// eslint-disable-next-line max-len
export const toQueryString = obj => []
  .concat(...Object.entries(obj).map(([k, v]) => (Array.isArray(v) ? v.map(arr => toQueryString({ [k]: arr })) : format(k, v))))
  .filter(x => x)
  .join('&');

// Adapted from here https://github.com/pawelt/safethen/blob/master/index.js
export function getSafeVar(fn, defaultVal) {
  try {
    const value = fn();
    // eslint-disable-next-line no-void
    return value !== void 0 ? value : defaultVal;
  } catch (e) {
    return defaultVal; // will be undefined if not passed in, which is intentional.
  }
}

export function getSearchLocations(zipCode, locations) {
  if (!zipCode) return false;
  if (!Array.isArray(locations)) return false;

  let searchedCity = locations.filter(l => l.zip_code === zipCode)[0];
  if (searchedCity && searchedCity.city && searchedCity.state) {
    searchedCity = [`${searchedCity.city},${searchedCity.state}`];
  } else {
    return false;
  }

  let searchedSecondaryCities = locations.filter(l => l.zip_code !== zipCode)
    .map(cs => `${cs.city},${cs.state}`);
  searchedSecondaryCities = [...new Set(searchedSecondaryCities)];
  return { searchedCity, searchedSecondaryCities };
}

export function convertKeyTags(text) {
  if (typeof text !== 'string') throw new Error('A string must be submitted.');
  let newText = text.replace(/\[fbkw]/g, '<i>');
  newText = newText.replace(/\[\/fbkw]/g, '</i>');
  return newText;
}

export function getMatchedKeywords(text, keywords) {
  if (typeof text !== 'string') throw new Error('A string must be submitted.');
  if (!Array.isArray(keywords)) throw new Error('An array of keywords must be submitted');
  const k = text.toLowerCase().match(/\[fbkw](.*?)\[\/fbkw]/g).map(
    v => v.replace(/\[\/?fbkw]/g, ''),
  );
  return [...new Set(k)];
}

export function isLoginErr(err) {
  const status = getSafeVar(() => err.response.status);
  return status === '401';
}

export function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function median(arr, returnInt) {
  if (!Array.isArray(arr)) throw new Error('Median requires an array');
  arr.sort((a, b) => a - b);
  const lowMid = Math.floor((arr.length - 1) / 2);
  const highMid = Math.ceil((arr.length - 1) / 2);
  let med = (arr[lowMid] + arr[highMid]) / 2;
  if (returnInt) med = Math.ceil(med);
  return med;
}

export function average(arr, returnInt) {
  if (!Array.isArray(arr)) throw new Error('Average requires an array');
  if (arr.length === 0) return 0;
  let ave = arr.reduce((acc, cv) => acc + cv) / arr.length;
  if (returnInt) ave = Math.ceil(ave);
  return ave;
}

export function stateToAcronym(state) {
  const states_hash = {
    Alabama: 'AL',
    Alaska: 'AK',
    'American Samoa': 'AS',
    Arizona: 'AZ',
    Arkansas: 'AR',
    California: 'CA',
    Colorado: 'CO',
    Connecticut: 'CT',
    Delaware: 'DE',
    'District Of Columbia': 'DC',
    'Federated States Of Micronesia': 'FM',
    Florida: 'FL',
    Georgia: 'GA',
    Guam: 'GU',
    Hawaii: 'HI',
    Idaho: 'ID',
    Illinois: 'IL',
    Indiana: 'IN',
    Iowa: 'IA',
    Kansas: 'KS',
    Kentucky: 'KY',
    Louisiana: 'LA',
    Maine: 'ME',
    'Marshall Islands': 'MH',
    Maryland: 'MD',
    Massachusetts: 'MA',
    Michigan: 'MI',
    Minnesota: 'MN',
    Mississippi: 'MS',
    Missouri: 'MO',
    Montana: 'MT',
    Nebraska: 'NE',
    Nevada: 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands': 'MP',
    Ohio: 'OH',
    Oklahoma: 'OK',
    Oregon: 'OR',
    Palau: 'PW',
    Pennsylvania: 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    Tennessee: 'TN',
    Texas: 'TX',
    Utah: 'UT',
    Vermont: 'VT',
    'Virgin Islands': 'VI',
    Virginia: 'VA',
    Washington: 'WA',
    'West Virginia': 'WV',
    Wisconsin: 'WI',
    Wyoming: 'WY',
  };
  return states_hash[state] || '';
}
