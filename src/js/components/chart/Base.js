// (C) Copyright 2016 Hewlett Packard Enterprise Development LP

import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CSSClassnames from '../../utils/CSSClassnames';

const CLASS_ROOT = CSSClassnames.CHART_BASE;

// Placeholder that reserves space on the screen for Layers to be
// positioned over.

export default class Base extends Component {

  componentDidUpdate (prevProps) {
    const { height, width } = this.props;
    if (prevProps.width !== width || prevProps.height !== height) {
      let event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      window.dispatchEvent(event);
    }
  }

  render () {
    const {
      children, className, height, vertical, width, ...props
    } = this.props;
    const childCount = Children.count(children);
    const finalHeight = (! childCount && ! height ? 'medium' : height);
    const finalWidth = (! childCount && ! width && 'sparkline' !== height ?
      'medium' : width);

    const classes = classnames(
      CLASS_ROOT, {
        [`${CLASS_ROOT}--vertical`]: vertical,
        [`${CLASS_ROOT}--height-${finalHeight}`]: finalHeight,
        [`${CLASS_ROOT}--width-${finalWidth}`]: finalWidth
      },
      className
    );

    let mappedChildren = children;
    // We can't distribute children when vertical because our height isn't
    // known.
    if (! vertical) {
      // Round to hundredths of a % so things line up reasonably accurately
      const basis = `${Math.floor(10000 / childCount) / 100.0}%`;
      mappedChildren = Children.map(children, child => (
        child ? React.cloneElement(child, { style: { flexBasis: basis }}) :
          child
      ));
    }

    return (
      <div {...props} className={classes}>
        {mappedChildren}
      </div>
    );
  }

}

Base.propTypes = {
  height: PropTypes.oneOf([
    'xxsmall', 'xsmall', 'small', 'medium', 'large', 'sparkline'
  ]),
  vertical: PropTypes.bool,
  width: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'full'])
};
