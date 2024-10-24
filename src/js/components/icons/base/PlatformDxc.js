// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CSSClassnames from '../../../utils/CSSClassnames';
import Intl from '../../../utils/Intl';
import Props from '../../../utils/Props';

const CLASS_ROOT = CSSClassnames.CONTROL_ICON;
const COLOR_INDEX = CSSClassnames.COLOR_INDEX;

class Icon extends Component {
  render () {
    const { className, colorIndex } = this.props;
    let { a11yTitle, size, responsive } = this.props;
    let { intl } = this.props;

    const classes = classnames(
      CLASS_ROOT,
      `${CLASS_ROOT}-platform-dxc`,
      className,
      {
        [`${CLASS_ROOT}--${size}`]: size,
        [`${CLASS_ROOT}--responsive`]: responsive,
        [`${COLOR_INDEX}-${colorIndex}`]: colorIndex
      }
    );

    a11yTitle = a11yTitle || Intl.getMessage(intl, 'platform-dxc');

    const restProps = Props.omit(this.props, Object.keys(Icon.propTypes));
    return <svg {...restProps} version="1.1" viewBox="0 0 24 24" width="24px" height="24px" role="img" className={classes} aria-label={a11yTitle}><path fill="#000000" fillRule="evenodd" d="M20.7613636,17.5 C18.4078775,17.5 16.5,15.1494949 16.5,12.25 C16.5,9.35050506 18.4078775,7 20.7613636,7 C21.5091155,7 22.588661,7 24,7 C24,9.48823368 24,11.2382337 24,12.25 C24,13.2666389 24,15.0166389 24,17.5 C22.584706,17.5 21.5051605,17.5 20.7613636,17.5 Z M8.5,20.5 L12.25,14 L16,20.5 L8.5,20.5 Z M3.23863636,7 C5.59212251,7 7.5,9.35050506 7.5,12.25 C7.5,15.1494949 5.59212251,17.5 3.23863636,17.5 C2.49088449,17.5 1.41133904,17.5 8.8817842e-16,17.5 C0,15.0117663 0,13.2617663 0,12.25 C-8.8817842e-16,11.2333611 -8.8817842e-16,9.48336115 8.8817842e-16,7 C1.41529402,7 2.49483947,7 3.23863636,7 Z M8.5,4 L16,4 L12.25,10.5 L8.5,4 Z" stroke="none"/></svg>;
  }
};


Icon.defaultProps = {
  responsive: true
};

Icon.displayName = 'PlatformDxc';

Icon.icon = true;

Icon.propTypes = {
  intl: PropTypes.object,
  a11yTitle: PropTypes.string,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge', 'huge']),
  responsive: PropTypes.bool
};


export default injectIntl(Icon);
