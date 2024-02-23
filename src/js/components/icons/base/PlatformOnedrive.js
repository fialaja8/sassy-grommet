// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CSSClassnames from '../../../utils/CSSClassnames';
import Intl from '../../../utils/Intl';
import Props from '../../../utils/Props';

const CLASS_ROOT = CSSClassnames.CONTROL_ICON;
const COLOR_INDEX = CSSClassnames.COLOR_INDEX;

export default class Icon extends Component {
  render () {
    const { className, colorIndex } = this.props;
    let { a11yTitle, size, responsive } = this.props;
    let { intl } = this.props;

    const classes = classnames(
      CLASS_ROOT,
      `${CLASS_ROOT}-platform-onedrive`,
      className,
      {
        [`${CLASS_ROOT}--${size}`]: size,
        [`${CLASS_ROOT}--responsive`]: responsive,
        [`${COLOR_INDEX}-${colorIndex}`]: colorIndex
      }
    );

    a11yTitle = a11yTitle || Intl.getMessage(intl, 'platform-onedrive');

    const restProps = Props.omit(this.props, Object.keys(Icon.propTypes));
    return <svg {...restProps} version="1.1" viewBox="0 0 24 24" width="24px" height="24px" role="img" className={classes} aria-label={a11yTitle}><path fillRule="evenodd" d="M21.6924215,13.986674 C22.9997233,14.1908343 24,15.3216239 24,16.6862741 C24,17.7522298 23.3892094,18.6751163 22.4988002,19.1254521 C22.4321553,19.1592575 22.3639409,19.1904067 22.294157,19.2186583 L8.59404885,19.2186583 L8.59404885,19.2181754 C6.85476268,19.2073094 5.44797646,17.7943658 5.44797646,16.0524235 C5.44797646,14.3037201 6.86550796,12.8860679 8.61421133,12.8860679 C8.70222602,12.8860679 8.78903338,12.8906557 8.87511633,12.8976583 C8.87028699,12.8172498 8.86702719,12.7364791 8.86702719,12.6548633 C8.86702719,10.4662072 10.6413261,8.69190834 12.8299821,8.69190834 C14.3676434,8.69190834 15.6998164,9.5683125 16.3568479,10.8482079 C16.9002691,10.4918027 17.5498151,10.283779 18.2483789,10.283779 C20.1559675,10.283779 21.7023216,11.8301331 21.7023216,13.7377217 C21.7023216,13.8215107 21.6982167,13.9043338 21.6924215,13.986674 Z M8.18741857,12.2086324 C6.25507961,12.421727 4.74711875,14.0641849 4.74711875,16.0524235 C4.74711875,16.8619413 4.9992102,17.6150766 5.42841764,18.2378198 L3.27887919,18.2378198 C1.46799809,18.2378198 -1.77635684e-15,16.7698217 -1.77635684e-15,14.9589406 C-1.77635684e-15,13.2281057 1.34134869,11.8115401 3.04103428,11.6894786 C2.98428956,11.4324371 2.95350253,11.1656161 2.95350253,10.8915512 C2.95350253,8.85248384 4.60646427,7.19964283 6.64541087,7.19964283 C7.40977438,7.19964283 8.11980783,7.43181327 8.70886636,7.82963 C9.54542848,6.15252157 11.276867,5 13.2783862,5 C15.9223281,5 18.0967377,7.01021204 18.3569183,9.58557738 C18.3206982,9.58461151 18.2847197,9.58292125 18.2483789,9.58292125 C17.6798451,9.58292125 17.1232638,9.6982217 16.6079734,9.92012979 C15.7386926,8.71545137 14.3462736,7.99105063 12.8299821,7.99105063 C10.4089142,7.99105063 8.41282793,9.84563725 8.18741857,12.2086324 Z"/></svg>;
  }
};

Icon.contextTypes = {
  intl: PropTypes.object
};

Icon.defaultProps = {
  responsive: true
};

Icon.displayName = 'PlatformOnedrive';

Icon.icon = true;

Icon.propTypes = {
  a11yTitle: PropTypes.string,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge', 'huge']),
  responsive: PropTypes.bool
};

