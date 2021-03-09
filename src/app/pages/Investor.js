import React, { useState } from 'react';
import {
  useSelector,
  useDispatch,
} from 'react-redux';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import * as types from '../actionTypes';
import DismissibleStatus from '../components/DismissibleStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function DataItem(props) {
  let displayText = props.text;
  if (Array.isArray(displayText)) {
    displayText = displayText.join(', ');
  }

  return (
    <div className="p-2 mb-2">
      <div className="mb-1">
        <strong>
        {`${props.label}: `}
        </strong>
      </div>
      <div>
        {displayText}
      </div>
    </div>
  )
}

const initialInputState = {
  crunchbase: '',
  name: '',
  image_url: '',
  primary_job_title: '',
  description: '',
  location_city: '',
  location_state: '',
  invested_locations: '',
  location_country_outside_usa: '',
  primary_organization_name: '',
  primary_organization_url: '',
  linkedin: '',
  twitter: '',
  raises: '',
  raise_min: '',
  raise_max: '',
  raise_median: '',
  raise_average: '',
  is_lead_investor: false,
  keywords: '',
}

function mapTypeToInput(val) {
  const inputProps = {
    type: 'text',
  }
  let parsedVal = val;
  if (Array.isArray(val)) {
    parsedVal = parsedVal.join(', ');
  }
  console.log(typeof val);
  console.log(typeof parsedVal);
  console.log(val);
  if (typeof parsedVal === 'number') inputProps.type = 'number';
  if (typeof parsedVal === 'string' && parsedVal.length > 60) {
    inputProps.as = 'textarea';
    inputProps.rows = 4;
  }
  console.log(inputProps);

  return inputProps;
}

function Investor() {
  const getInvestorStatus = useSelector(state => state.get_CBInvestor_status);
  const searchingFor = useSelector(state => state.searchingFor);
  const investor = useSelector(state => state.investor);
  console.log(investor);

  const [inputState, setInputState] = useState(initialInputState);

  const onInputChange = e => {
    const { name, type, checked } = e.target;
    let { value } = e.target;
    if (type === 'checkbox') value = !!checked;
    if (type === 'number') value = Number(value);
    setInputState(prevState => ({ ...prevState, [name]: value }));
  };

  const dispatch = useDispatch();

  const setSearchedText = text => dispatch({
    type: types.SEARCH_SET_SEARCHTEXT,
    text,
  });

  const onClickClearSearchText = () => {
    setSearchedText('');
  };

  const submitSearch = () => {
    const permalink = searchingFor.split('/').pop();
    dispatch({
      type: types.CBDATA_GET_INVESTOR_SUBMITTED,
      params: { permalink },
    });
  }
  console.log(Object.keys(investor));

  return (
    <div>
      <Row className="mt-2">
        <Col>
          <div className="d-flex mb-2 ">
            <InputGroup className="mr-2">
              <FormControl
                type="text"
                value={searchingFor}
                placeholder="URL or Permalink"
                onChange={e => setSearchedText(e.target.value)}
                aria-label="Search for an investor by CrunchBase permalink or URL."
              />
              <InputGroup.Append>
                <Button
                  variant="outline-primary"
                  onClick={onClickClearSearchText}
                >
                  <FontAwesomeIcon className="mr-1 ml-1" icon="times" />
                </Button>
              </InputGroup.Append>
            </InputGroup>
            <Button
              variant="primary"
              onClick={submitSearch}
            >
              Search
            </Button>
          </div>
          <DismissibleStatus
            status={getInvestorStatus}
            statusPrefix="Retrieving Investor"
            dismissible={false}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <h2>CrunchBase Data</h2>
        </Col>
        <Col xs={6}>
          <h2>Replacement Data</h2>
        </Col>
      </Row>
      {Object.keys(investor).map(k => (
        <Row key={`row=${k}`} className="pt-3 mb-3">
          <Col xs={12}>
            <hr className="bd-primary"/>
          </Col>
          <Col xs={6}>
            <DataItem
              label={k}
              key={k}
              text={investor[k]}
            />
          </Col>
          <Col xs={6}>
            {typeof investor[k] === 'boolean' ? (
              <Form.Check
                custom
                className="txs-2"
                type="checkbox"
                value={inputState[k]}
                onChange={onInputChange}
                label={k}
                name={k}
                key={`input-${k}`}
              />
            ) : (
              <Form.Control
                className="txs-2"
                value={inputState[k]}
                onChange={onInputChange}
                placeholder={k}
                name={k}
                key={`input-${k}`}
                {...mapTypeToInput(investor[k])}
              />
            )}
          </Col>
        </Row>
      ))}
    </div>
  );
}

export default Investor;
