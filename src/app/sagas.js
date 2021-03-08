import axios from 'axios';
import {
  fork,
  call,
  put,
  takeEvery,
} from 'redux-saga/effects';
import { toQueryString, trackErr } from './utils';
import * as types from './actionTypes';
import { field_ids } from '../constants';

function postInvestor(params = {}) {
  const data = {
    records: [
      {
        fields: { ...params },
      },
    ],
    typecast: true,
  };
  return axios({
    method: 'post',
    url: 'https://api.airtable.com/v0/appUJz2H2nGD8Ldyc/upworker_added',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_APIKEY}`,
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
      trackErr(results.data.error);
      yield put({ type: types.AIRTABLE_POST_INVESTOR_FAILED, error: results.data.error });
    } else {
      yield put({ type: types.AIRTABLE_POST_INVESTOR_SUCCEEDED });
    }
  } catch (error) {
    trackErr(error);
    yield put({ type: types.AIRTABLE_POST_INVESTOR_FAILED, error });
  }
}

export function* watchPostInvestor() {
  yield takeEvery(types.AIRTABLE_POST_INVESTOR_SUBMITTED, workPostInvestor);
}

function getCBInvestor(params = {}) {
  const getParams = { ...params };
  const { entity_id } = getParams;
  delete getParams.entity_id;

  return axios.get(`https://api.crunchbase.com/api/v4/entities/people/${entity_id}?${toQueryString(params)}`);
}

function* workGetCBInvestor(action) {
  const { params } = action;
  params.user_key = process.env.REACT_APP_CB_APIKEY;
  console.log(process.env.REACT_APP_CB_APIKEY);
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

export function* watchGetCBInvestor() {
  yield takeEvery(types.CBDATA_GET_INVESTOR_SUBMITTED, workGetCBInvestor);
}

export default function* rootSaga() {
  yield fork(watchPostInvestor);
  yield fork(watchGetCBInvestor);
}
