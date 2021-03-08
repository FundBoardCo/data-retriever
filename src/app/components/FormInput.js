import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';
import { capitalizeFirstLetter } from '../utils';

export default function FormInput(props) {
  const {
    iKey,
    label,
    type,
    placeholder,
    feedback,
    onChange,
    value,
    formText,
    min,
    max,
    required,
    pattern,
  } = props;

  const optionalProps = {};
  if (min && type === 'number') optionalProps.min = min;
  if (max) {
    if (type === 'number') optionalProps.max = max;
    if (!type || type === 'text') optionalProps.maxLength = max;
  }
  if (required) optionalProps.required = true;
  if (pattern) optionalProps.pattern = pattern;

  return (
    <Form.Group controlId={`${iKey}Input`}>
      {type !== 'checkbox' && (
        <Form.Label>{label}</Form.Label>
      )}
      {type === 'checkbox' ? (
        <Form.Check
          type="checkbox"
          label={label}
          name={iKey}
          checked={!!value}
          onChange={e => onChange(e)}
          data-track={`Profile${capitalizeFirstLetter(iKey)}`}
          {...optionalProps}
        />
      ) : (
        <Form.Control
          type={type || 'text'}
          placeholder={placeholder}
          name={iKey}
          value={value}
          onChange={e => onChange(e)}
          data-track={`Profile${capitalizeFirstLetter(iKey)}`}
          {...optionalProps}
        />
      )}
      {feedback && (
        <Form.Control.Feedback type="invalid">
          {`Please enter a valid ${placeholder}`}
        </Form.Control.Feedback>
      )}
      {formText && (
        <Form.Text className="text-muted">
          {formText}
        </Form.Text>
      )}
    </Form.Group>
  );
}

FormInput.defaultProps = {
  iKey: '',
  label: '',
  type: '',
  placeholder: '',
  feedback: false,
  formText: '',
  value: '',
  onChange: '',
  min: 0,
  max: 0,
  required: false,
  pattern: '',
};

FormInput.propTypes = {
  iKey: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  feedback: PropTypes.bool,
  formText: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  required: PropTypes.bool,
  pattern: PropTypes.string,
};
