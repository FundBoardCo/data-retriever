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
import * as types from '../../actionTypes';
import DismissibleStatus from '../../components/DismissibleStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InvestorData from './InvestorData';

function Investor() {
  const getInvestorStatus = useSelector(state => state.get_CBInvestor_status);
  const searchingFor = useSelector(state => state.searchingFor);
  const investor = useSelector(state => state.investor);
  const getATIvestorsStatus = useSelector(state => state.get_ATInvestors_status);
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

  const onSearchKeyDown = (e) => {
    if (e.keyCode === 13) {
      submitSearch();
    }
  }
/*
  const onGetATInvestors = () => {
    dispatch({
      type: types.AIRTABLE_GET_INVESTORS_REQUESTED,
    });
  }
 */

  return (
    <div className="mb-5">
      <Row className="mt-3 mb-2">
        <Col>
          <div className="d-flex mb-2 ">
            <InputGroup className="mr-2">
              <FormControl
                type="text"
                value={searchingFor}
                placeholder="URL or Permalink"
                onChange={e => setSearchedText(e.target.value)}
                onKeyDown={onSearchKeyDown}
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
          <DismissibleStatus
            status={getATIvestorsStatus}
            statusPrefix="Retrieving All Investors from AirTable"
          />
        </Col>
      </Row>
      <InvestorData investor={investor} />
    </div>
  );
}

export default Investor;
