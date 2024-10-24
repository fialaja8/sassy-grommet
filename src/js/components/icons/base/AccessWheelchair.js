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
      `${CLASS_ROOT}-access-wheelchair`,
      className,
      {
        [`${CLASS_ROOT}--${size}`]: size,
        [`${CLASS_ROOT}--responsive`]: responsive,
        [`${COLOR_INDEX}-${colorIndex}`]: colorIndex
      }
    );

    a11yTitle = a11yTitle || Intl.getMessage(intl, 'access-wheelchair');

    const restProps = Props.omit(this.props, Object.keys(Icon.propTypes));
    return <svg {...restProps} version="1.1" viewBox="0 0 24 24" width="24px" height="24px" role="img" className={classes} aria-label={a11yTitle}><path fillRule="evenodd" d="M8.05024041,4.27066668 C9.13670406,4.17035941 9.98081518,3.2343354 9.98081518,2.13951989 C9.98081517,0.961122081 9.01969309,0 7.84129528,0 C6.66289747,0 5.70181789,0.961122081 5.70181789,2.13951989 C5.70181789,2.49888341 5.80208265,2.86659878 5.96924725,3.17582992 L6.73158244,13.9028415 L14.5830059,13.9049667 L17.8033365,21.4503679 L22.0313726,19.7922379 L21.3766552,18.233225 L19.0104664,19.0873668 L15.8946083,11.8938486 L8.59449231,11.9428971 L8.49427005,10.5844138 L13.7789751,10.5865177 L13.7789751,8.5764834 L8.29267796,8.57433699 L8.05024041,4.27066668 L8.05024041,4.27066668 Z M15.9467171,19.6546554 C14.6215561,22.2742051 11.8479328,24 8.88942116,24 C4.54407658,24 1,20.4559234 1,16.1105788 C1,13.0595805 2.84909637,10.224349 5.60831112,8.96751171 L5.78686655,11.2976367 C4.1548759,12.3260199 3.14882807,14.1815767 3.14882807,16.12656 C3.14882807,19.2788007 5.71979669,21.8497268 8.8719949,21.8497268 C11.7559137,21.8497268 14.2150992,19.6365066 14.5504485,16.7972585 L15.9467171,19.6546554 L15.9467171,19.6546554 Z"/></svg>;
  }
};


Icon.defaultProps = {
  responsive: true
};

Icon.displayName = 'AccessWheelchair';

Icon.icon = true;

Icon.propTypes = {
  intl: PropTypes.object,
  a11yTitle: PropTypes.string,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge', 'huge']),
  responsive: PropTypes.bool
};


export default injectIntl(Icon);
