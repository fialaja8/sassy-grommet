// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

// NOTE: This component is a temporary wrapper of react-intl FormattedMessage
// to avoid errors being thrown if the context hasn't been wrapped by
// IntlProvider. The hope is that react-intl will change to obviate the
// need for this component.

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

const GrommetFormattedMessage = ({intl, ...props}) => (
  intl ? <FormattedMessage {...props} />
    : <span>
      {props.defaultMessage || props.id}
    </span>
);

GrommetFormattedMessage.propTypes = {
  id: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
  intl: PropTypes.object
};

GrommetFormattedMessage.displayName = 'GrommetFormattedMessage';

export default injectIntl(GrommetFormattedMessage);
