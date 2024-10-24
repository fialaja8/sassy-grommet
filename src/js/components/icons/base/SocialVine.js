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
      `${CLASS_ROOT}-social-vine`,
      className,
      {
        [`${CLASS_ROOT}--${size}`]: size,
        [`${CLASS_ROOT}--responsive`]: responsive,
        [`${COLOR_INDEX}-${colorIndex}`]: colorIndex
      }
    );

    a11yTitle = a11yTitle || Intl.getMessage(intl, 'social-vine');

    const restProps = Props.omit(this.props, Object.keys(Icon.propTypes));
    return <svg {...restProps} version="1.1" viewBox="0 0 24 24" width="24px" height="24px" role="img" className={classes} aria-label={a11yTitle}><path fill="#00B488" fillRule="evenodd" d="M22.0406139,11.9310646 C21.4226105,12.0735653 20.8241073,12.1365657 20.2863544,12.1365657 C17.257838,12.1365657 14.9268254,10.0215542 14.9268254,6.34428433 C14.9268254,4.54202458 15.6235791,3.6045195 16.6090845,3.6045195 C17.5465895,3.6045195 18.1713429,4.44602406 18.1713429,6.15228329 C18.1713429,7.12278854 17.9110915,8.18554429 17.7198405,8.8147977 C17.7198405,8.8147977 18.6528455,10.4423065 21.2043593,9.9428038 C21.7458623,8.7405473 22.0406139,7.18203886 22.0406139,5.81553147 C22.0406139,2.13901157 20.1656037,0 16.7290851,0 C13.196566,0 11.1295548,2.7157647 11.1295548,6.29628407 C11.1295548,9.84380327 12.7878138,12.8895697 15.5223286,14.2770773 C14.3725724,16.5765897 12.9093144,18.6031007 11.3830562,20.1301089 C8.61479121,16.7828408 6.11202766,12.3180667 5.0845221,3.6045195 L1,3.6045195 C2.88701021,18.116348 8.51129065,22.737123 9.99779869,23.6243778 C10.8393032,24.1291306 11.5638072,24.1051304 12.3325613,23.6723781 C13.5400679,22.9853744 17.1655875,19.3613548 19.1748483,15.1155818 C20.0178529,15.1133318 21.0311084,15.0165813 22.0406139,14.78783 L22.0406139,11.9310646 Z" stroke="none"/></svg>;
  }
};


Icon.defaultProps = {
  responsive: true
};

Icon.displayName = 'SocialVine';

Icon.icon = true;

Icon.propTypes = {
  intl: PropTypes.object,
  a11yTitle: PropTypes.string,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge', 'huge']),
  responsive: PropTypes.bool
};


export default injectIntl(Icon);
