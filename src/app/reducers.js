import * as types from './actionTypes';
import {
  processErr,
  getSafeVar,
  isPlainObject,
  stateToAcronym,
  median,
  average,
} from './utils';
import { cb_investor_imagePrefix } from '../constants';

function extractLocation(locationArray, type, lowerCase) {
  if (Array.isArray(locationArray)) {
    const locObj = locationArray.filter(l => l.location_type === type)[0];
    let val = isPlainObject(locObj) && locObj.value;
    if (val && type === 'region') val = stateToAcronym(val);
    if (val && lowerCase) {
      return val.toLowerCase();
    }
    return val || '';
  }
  return '';
}

function extractOrgData(org = {}) {
  const { identifier = {} } = org;
  return {
    description: org.description || '',
    permalink: identifier.permalink || '',
    image_url: org.image_url || '',
    image_id: org.image_id || '',
    name: identifier.value || '',
    homepage: (org.website && org.website.value) || org.website_url || '',
  };
}

function parseInvestor(data) {
  const { properties = {}, cards = {} } = data;
  const inv = getSafeVar(() => cards.partner_investments, []);
  const investments_led = inv.filter(i => i.is_lead_investor);
  const { primary_organization = {} } = cards;
  const org = extractOrgData(primary_organization[0]);
  /*
  const curOrgUUID = getSafeVar(() => primary_organization.identifier.uuid);
  const cur_investments_led = investments_led.filter(i => {
    const orgUUID = getSafeVar(() => i.investor_identifier.uuid);
    return orgUUID === curOrgUUID;
  });
   */
  const raises = inv
    .filter(r => isPlainObject(r.funding_round_money_raised))
    .map(r => r.funding_round_money_raised.value_usd);
  const location_city = extractLocation(properties.location_identifiers, 'city');
  const location_state = extractLocation(properties.location_identifiers, 'region');
  const location_country = extractLocation(properties.location_identifiers, 'country');

  const image_url = properties.image_url
    || (properties.image_id && `${cb_investor_imagePrefix}${properties.image_id}`)
    || '';

  const location_country_outside_usa =
    location_country.toLowerCase() === 'usa' || location_country.toLowerCase() === 'united states'
      ? '' : location_country

  return {
    crunchbase: `https://www.crunchbase.com/person/${properties.permalink}`,
    name: properties.name || '',
    source: properties.source || '',
    source_name: properties.source_name || '',
    image_url,
    primary_job_title: properties.primary_job_title || '',
    description: properties.description || '',
    location_city,
    location_state,
    invested_locations: [], // TODO: add a way to get this
    location_country_outside_usa,
    primary_organization_name: org.name || '',
    primary_organization_url: `https://www.crunchbase.com/organization/${org.permalink}`,
    linkedin: (properties.linkedin && properties.linkedin.value) || '',
    twitter: (properties.twitter && properties.twitter.value) || '',
    raises,
    raise_min: Math.min(...raises),
    raise_max: Math.max(...raises),
    raise_median: median(raises, true),
    raise_average: average(raises, true),
    is_lead_investor: investments_led.length > 0,
    keywords: [], // TODO: add a way to get this
  }
}

const defaults = {
  post_AirTable_status: '',
  get_CBInvestor_status: '',
  investor: {},
  toSave: {},
  searchingFor: '',
};

export default function rootReducer(state = defaults, action) {
  console.log(action);
  switch (action.type) {
    case types.SEARCH_SET_SEARCHTEXT: return {
      ...state,
      searchingFor: action.text,
    };
    case types.AIRTABLE_POST_INVESTOR_SUBMITTED: return {
      ...state,
      post_AirTable_status: 'pending',
    };
    case types.AIRTABLE_POST_INVESTOR_SUCCEEDED:
      return {
        ...state,
        post_AirTable_status: 'succeeded',
      };
    case types.AIRTABLE_POST_INVESTOR_FAILED: return {
      ...state,
      post_AirTable_status: processErr(action.error),
    };
    case types.AIRTABLE_POST_INVESTOR_DISMISSED: return {
      ...state,
      post_AirTable_status: '',
    };
    case types.CBDATA_GET_INVESTOR_SUBMITTED: return {
      ...state,
      get_CBInvestor_status: 'pending',
      investor: {},
    };
    case types.CBDATA_GET_INVESTOR_SUCCEEDED:
      return {
        ...state,
        investor: parseInvestor(action.data),
        toSave: parseInvestor(action.data),
        get_CBInvestor_status: 'succeeded',
      };
    case types.CBDATA_GET_INVESTOR_FAILED: return {
      ...state,
      get_CBInvestor_status: processErr(action.error),
    };
    case types.CBDATA_GET_INVESTOR_DISMISSED: return {
      ...state,
      get_CBInvestor_status: '',
    };
    case types.TOSAVE_DATA_SET: return {
      ...state,
      toSave: {
        ...state.toSave,
        ...action.data,
      },
    }
    default: return state;
  }
}
