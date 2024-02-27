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
      `${CLASS_ROOT}-platform-chrome`,
      className,
      {
        [`${CLASS_ROOT}--${size}`]: size,
        [`${CLASS_ROOT}--responsive`]: responsive,
        [`${COLOR_INDEX}-${colorIndex}`]: colorIndex
      }
    );

    a11yTitle = a11yTitle || Intl.getMessage(intl, 'platform-chrome');

    const restProps = Props.omit(this.props, Object.keys(Icon.propTypes));
    return <svg {...restProps} version="1.1" viewBox="0 0 24 24" width="24px" height="24px" role="img" className={classes} aria-label={a11yTitle}><path fillRule="evenodd" d="M11.9733005,16.4144516 C9.59429509,16.4144516 7.65884342,14.4788121 7.65884342,12.0999945 C7.65884342,9.72075429 9.59429509,7.78530262 11.9733005,7.78530262 C14.3523059,7.78530262 16.2879454,9.72075429 16.2879454,12.0999945 C16.2879924,14.4788121 14.3523529,16.4144516 11.9733005,16.4144516 L11.9733005,16.4144516 Z M13.7910066,17.1810894 C13.1872494,17.4007528 12.5549364,17.5116882 11.9068426,17.5116882 C10.6352186,17.5116882 9.39370022,17.0652225 8.41129728,16.2548117 C7.61431896,15.5972306 7.02033082,14.7318218 6.69297277,13.7500294 L6.691235,13.7442055 L1.93641793,5.50854377 C0.228238232,8.1357683 -0.377867323,11.2684017 0.230163868,14.3493248 C0.849467072,17.4870306 2.65331799,20.1955546 5.30970885,21.9764857 C6.69353637,22.9040785 8.22657716,23.5227711 9.86735961,23.8160783 L13.7910066,17.1810894 L13.7910066,17.1810894 Z M22.7599128,6.70666487 C19.7903479,0.731840215 12.5393434,-1.70437065 6.56465968,1.26519432 C5.01832731,2.03375777 3.65958002,3.12347966 2.57441389,4.45616042 L6.59105498,11.413435 C6.85172029,9.39264477 8.25048322,7.60626547 10.3219975,6.95469613 C10.8217704,6.79763941 11.341739,6.71403864 11.865371,6.70666487 L22.7599128,6.70666487 Z M11.9264747,24 C14.936431,24 17.8171819,22.8712018 20.0368292,20.8218558 C22.2681243,18.7619893 23.6231612,15.9588274 23.8523118,12.9290041 C23.983349,11.1937716 23.7261592,9.41711443 23.1082181,7.78530262 L15.2520944,7.78530262 C16.5738788,8.83162726 17.3494403,10.4306093 17.3416908,12.1250278 C17.3360548,13.3449884 16.9177692,14.5439079 16.1598672,15.5064909 L11.1518525,23.9751076 C11.4097938,23.9916399 11.6696606,24 11.926052,24 L11.9264747,24 L11.9264747,24 Z"/></svg>;
  }
};


Icon.defaultProps = {
  responsive: true
};

Icon.displayName = 'PlatformChrome';

Icon.icon = true;

Icon.propTypes = {
  intl: PropTypes.object,
  a11yTitle: PropTypes.string,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge', 'huge']),
  responsive: PropTypes.bool
};


export default injectIntl(Icon);
