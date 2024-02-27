// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CSSClassnames from '../utils/CSSClassnames';
import Intl from '../utils/Intl';

const COLOR_INDEX = CSSClassnames.COLOR_INDEX;

const CLASS_ROOT = {
  'control': CSSClassnames.CONTROL_ICON,
  'logo': CSSClassnames.LOGO_ICON,
  'status': CSSClassnames.STATUS_ICON
};

class SVGIcon extends Component {
  render () {
    const {
      a11yTitle, children, className, colorIndex, size, type, intl, ...props
    } = this.props;

    const classRoot = CLASS_ROOT[type];
    const classes = classnames(
      classRoot,
      {
        [`${classRoot}--${size}`]: size,
        [`${COLOR_INDEX}-${colorIndex}`]: colorIndex
      },
      className
    );

    const iconMessage = Intl.getMessage(intl, 'icon');
    const typeMessage = Intl.getMessage(intl, type);
    let defaultTitle = `${typeMessage} ${iconMessage}`;

    return (
      <svg {...props} className={classes} role='img'>
        <title>
          {a11yTitle || defaultTitle}
        </title>
        {children}
      </svg>
    );
  }
}


SVGIcon.defaultProps = {
  type: 'control'
};

SVGIcon.propTypes = {
  intl: PropTypes.object,
  a11yTitle: PropTypes.string,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge',
    'huge']),
  type: PropTypes.oneOf(['control', 'logo', 'status'])
};

export default injectIntl(SVGIcon);
