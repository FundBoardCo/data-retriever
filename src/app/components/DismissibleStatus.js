import React from 'react';
import Alert from 'react-bootstrap/Alert';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';

export default function DAlert(props) {
  const {
    title,
    message,
    statusPrefix,
    status,
    dissmissAction,
    dismissParams,
    className,
    show = true,
    showSuccess = true,
    showSpinner = true,
  } = props;

  let variant = 'danger';
  if (status === 'succeeded') variant = 'success';
  if (status === 'pending') variant = 'info';

  const dispatch = useDispatch();

  const dissmiss = (type, params) => dispatch({
    type,
    params,
  });

  const onClickClose = () => {
    window.heap.track('DismissStatus-close', { status, dissmissAction });
    if (dissmissAction) {
      dissmiss(dissmissAction, dismissParams);
    }
  };

  if (show && status && (status !== 'succeeded' || showSuccess)) {
    return (
      <Alert
        variant={variant}
        className={className}
        onClose={onClickClose}
        dismissible
        data-track={`DismissStatus-${status}-${dissmissAction}`}
      >
        {title && (
          <Alert.Heading>{title}</Alert.Heading>
        )}
        {showSpinner && status === 'pending' && (
          <Spinner animation="border" variant="info" role="status" size="sm" className="mr-2" />
        )}
        {message || `${statusPrefix ? `${statusPrefix} ${status}` : `${status}`}`}
      </Alert>
    );
  }
  return null;
}

DAlert.defaultProps = {
  title: '',
  message: '',
  statusPrefix: '',
  status: '',
  dissmissAction: '',
  dismissParams: {},
  className: '',
  show: true,
  showSuccess: true,
  showSpinner: true,
};

DAlert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  statusPrefix: PropTypes.string,
  status: PropTypes.string,
  dissmissAction: PropTypes.string,
  dismissParams: PropTypes.shape({
    properties: PropTypes.objectOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.bool,
      ]),
    ),
  }),
  className: PropTypes.string,
  show: PropTypes.bool,
  showSuccess: PropTypes.bool,
  showSpinner: PropTypes.bool,
};
