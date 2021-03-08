import React from 'react';
import {
  useSelector,
  useDispatch,
} from 'react-redux';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
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
    <div className="border bd-primary p-2 mb-2">
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

function Investor() {
  const getInvestorStatus = useSelector(state => state.get_CBInvestor_status);
  const searchingFor = useSelector(state => state.searchingFor);
  const investor = useSelector(state => state.investor);
  console.log(investor);

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
            dissmissAction={types.CBDATA_GET_INVESTOR_DISMISSED}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <h2>CrunchBase Data</h2>
          {Object.keys(investor).map(k => (
            <DataItem
              label={k}
              key={k}
              text={investor[k]}
            />
          ))}
        </Col>
        <Col xs={6}>
          <h2>Overrides</h2>

        </Col>
      </Row>
    </div>
  );
}

export default Investor;
