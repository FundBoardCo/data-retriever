import React, { useState } from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import * as types from '../../actionTypes';
import DismissibleStatus from '../../components/DismissibleStatus';

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

function mapTypeToInput(val) {
  const inputProps = {
    type: 'text',
  }
  let parsedVal = val;
  if (Array.isArray(val)) {
    parsedVal = parsedVal.join(', ');
  }
  if (typeof parsedVal === 'number') inputProps.type = 'number';
  if (typeof parsedVal === 'string' && parsedVal.length > 60) {
    inputProps.as = 'textarea';
    inputProps.rows = 4;
  }

  return inputProps;
}

function InvestorData(props) {
  const { investor } = props;
  console.log(investor);

  const toSave = useSelector(state => state.toSave || {});
  const post_AirTable_status = useSelector(state => state.post_AirTable_status);
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();

  const onInputChange = e => {
    const { name, type, checked } = e.target;
    let { value } = e.target;
    console.log(value);
    if (type === 'checkbox') value = !!checked;
    if (type === 'number') value = Number(value);
    dispatch({
      type: types.TOSAVE_DATA_SET,
      data: {
        [name]: value,
      }
    })
  };

  const handleSubmit = event => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
    if (form.checkValidity() !== false) {
      dispatch({
        type: types.AIRTABLE_POST_INVESTOR_SUBMITTED,
        params: {
          ...toSave,
        }
      })
    }
  };

  return (
    <div>
      <Row>
        <Col xs={6}>
          <h2>CrunchBase Data</h2>
        </Col>
        <Col xs={6}>
          <h2>Replacement Data</h2>
        </Col>
      </Row>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
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
              {typeof toSave[k] === 'boolean' ? (
                <Form.Check
                  className="txs-2"
                  type="checkbox"
                  checked={toSave[k]}
                  onChange={onInputChange}
                  label={k}
                  name={k}
                  id={`checkbox-${k}`}
                  key={`input-${k}`}
                />
              ) : (
                <Form.Control
                  className="txs-2"
                  value={toSave[k]}
                  onChange={onInputChange}
                  placeholder={k}
                  name={k}
                  key={`input-${k}`}
                  {...mapTypeToInput(toSave[k])}
                />
              )}
            </Col>
          </Row>
        ))}
        <div className="d-flex align-items-center">
          <DismissibleStatus
            status={post_AirTable_status}
            statusPrefix="Saving Investor..."
            dismissAction={types.AIRTABLE_POST_INVESTOR_DISMISSED}
            className="mr-2"
          />
          <Button
          type="submit"
          className="ml-auto flex-shrink-0 flex-grow-0"
          disabled={Object.keys(toSave).length === 0}
          >
          Save to AirTable
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default InvestorData;
