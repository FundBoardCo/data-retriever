import axios from 'axios';
import {
  fork,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import { toQueryString } from './utils';
import * as types from './actionTypes';
import { field_ids } from '../constants';

const getATInvestors = state => state.ATInvestors;

function* workGetUUIDs(action) {
  const invs = yield select(getATInvestors);
  const ents = invs
    // remove any that already have uuids
    .filter(i => !i.fields.uuid)
    .map(i => (
      {
        permalink: i.fields.crunchbase.split('/').pop(),
        id: i.id,
      }
    ));

  const params = {};
  params.field_ids = 'uuid';
  console.log(ents);

  try {
    while (ents.length) {
      const ent = ents.pop();
      console.log(`Remaining ents: ${ents.length}`);
      params.entity_id = ent.permalink;
      console.log(params);
      console.log(typeof params.entity_id);
      // some of the permalinks are coming back as the string undefined?
      if (params.entity_id && params.entity_id !== 'undefined') {
        const results = yield call(getCBInvestor, params);
        if (results.data.error) throw new Error(results.data.error);
        yield put({type: types.CBDATA_GET_INVESTORUUIDS_SUCCEEDED, params, data: results.data});
        const patchParams = {
          id: ent.id,
          uuid: results.data.properties.uuid,
        }
        yield put({ type: types.AIRTABLE_POST_INVESTOR_SUBMITTED, params: patchParams });
      }
    }
    yield put({ type: types.CBDATA_GET_INVESTORUUIDS_COMPLETED });
  } catch (error) {
    yield put({ type: types.CBDATA_GET_INVESTORUUIDS_FAILED, error });
  }
}

function* watchGetUUIDs() {
  yield takeLatest(types.CBDATA_GET_INVESTORUUIDS_SUBMITTED, workGetUUIDs);
}

function getInvestors(params) {
  const { offset } = params;
  const getParams = {
    fields: ['crunchbase', 'uuid'],
  };
  if (offset) getParams.offset = offset;

  return axios({
    method: 'get',
    url: `https://api.airtable.com/v0/appUJz2H2nGD8Ldyc/upworker_added_test?${toQueryString(getParams)}`,
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_APIKEY}`,
    },
  });
}

function* workGetATInvestors() {
  const params = {};
  let firstRun = true;

  try {
    while (firstRun || params.offset) {
      const results = yield call(getInvestors, params);
      if (results.data.error) throw new Error(results.data.error);
      firstRun = false;
      params.offset = results.data.offset;
      yield put({ type: types.AIRTABLE_GET_INVESTORS_SUCCEEDED, params, data: results.data });
    }
    yield put({ type: types.AIRTABLE_GET_INVESTORS_COMPLETED });
    yield put({ type: types.CBDATA_GET_INVESTORUUIDS_SUBMITTED });
  } catch (error) {
    yield put({ type: types.AIRTABLE_GET_INVESTORS_FAILED });
  }
}

function* watchGetATInvestors() {
  yield takeLatest(types.AIRTABLE_GET_INVESTORS_REQUESTED, workGetATInvestors);
}

function postInvestor(params = {}) {
  const parsedParams = {};
  Object.keys(params).forEach(k => {
    if (Array.isArray(params[k])) {
      parsedParams[k] = params[k].join();
    } else {
      parsedParams[k] = params[k];
    }
  });
  const extraData = {};
  let method = 'post';
  if (parsedParams.id) {
    extraData.id = parsedParams.id;
    method = 'patch';
    delete parsedParams.id;
  }

  const data = {
    records: [
      {
        ...extraData,
        fields: { ...parsedParams },
      },
    ],
    typecast: true,
  };
  console.log(data);
  return axios({
    method,
    url: 'https://api.airtable.com/v0/appUJz2H2nGD8Ldyc/upworker_added_test',
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_APIKEY}`,
      'Content-Type': 'application/json',
    },
    data,
  });
}

function* workPostInvestor(action) {
  const { params } = action;
  try {
    const results = yield call(postInvestor, params);
    // catch airtable errors
    if (results.data.error) {
      yield put({ type: types.AIRTABLE_POST_INVESTOR_FAILED, error: results.data.error });
    } else {
      yield put({ type: types.AIRTABLE_POST_INVESTOR_SUCCEEDED });
    }
  } catch (error) {
    yield put({ type: types.AIRTABLE_POST_INVESTOR_FAILED, error });
  }
}

function* watchPostInvestor() {
  yield takeEvery(types.AIRTABLE_POST_INVESTOR_SUBMITTED, workPostInvestor);
}

function getCBInvestor(params = {}) {
  const getParams = { ...params };
  const { entity_id } = getParams;
  delete getParams.entity_id;

  return axios.get(`/.netlify/functions/cb_get_person/${entity_id}?${toQueryString(params)}`);
}

function* workGetCBInvestor(action) {
  const { params } = action;
  params.entity_id = params.permalink;
  delete params.permalink;
  params.field_ids = field_ids.join();
  const card_ids = [
    'participated_investments',
    'partner_funding_rounds',
    'partner_investments',
    'primary_organization'
  ];
  params.card_ids = card_ids.join();

  try {
    const results = yield call(getCBInvestor, params);
    yield put({ type: types.CBDATA_GET_INVESTOR_SUCCEEDED, data: results.data });
  } catch (error) {
    yield put({ type: types.CBDATA_GET_INVESTOR_FAILED, error });
  }
}

function* watchGetCBInvestor() {
  yield takeEvery(types.CBDATA_GET_INVESTOR_SUBMITTED, workGetCBInvestor);
}

export default function* rootSaga() {
  yield fork(watchPostInvestor);
  yield fork(watchGetCBInvestor);
  yield fork(watchGetATInvestors);
  yield fork(watchGetUUIDs);
}
