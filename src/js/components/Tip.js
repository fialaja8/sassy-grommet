// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Box from './Box';
import CSSClassnames from '../utils/CSSClassnames';
import composeKeepPropTypes from "../utils/composeKeepPropTypes";
import { injectIntl } from 'react-intl';
import PortalDrop from './PortalDrop';

const CLASS_ROOT = CSSClassnames.TIP;


class Tip extends Component {

  constructor (props) {
    super(props);
    this.state = { drop: null };
    this._getTarget = this._getTarget.bind(this);
  }

  componentDidMount () {
    const { onClose, colorIndex, intl } = this.props;
    const target = this._getTarget();
    if (target) {
      const rect = target.getBoundingClientRect();
      let align = {
        left: (
          rect.left < (window.innerWidth - rect.right) ? 'left' : undefined
        ),
        right: (
          rect.left >= (window.innerWidth - rect.right) ? 'right' : undefined
        ),
        top: (
          rect.top < (window.innerHeight - rect.bottom) ? 'bottom' : undefined
        ),
        bottom: (
          rect.top >= (window.innerHeight - rect.bottom) ? 'top' : undefined
        )
      };

      const classNames = classnames(
        `${CLASS_ROOT}__drop`, {
          [`${CLASS_ROOT}__drop--left`]: align.left,
          [`${CLASS_ROOT}__drop--right`]: align.right,
          [`${CLASS_ROOT}__drop--top`]: align.top,
          [`${CLASS_ROOT}__drop--bottom`]: align.bottom
        }
      );
      this.setState({drop: {control: target, opts: {
        align: align,
        className: classNames,
        colorIndex: colorIndex,
        context: { intl },
        responsive: false
      }}}, () => {
        target.addEventListener('click', onClose);
        target.addEventListener('blur', onClose);
      });
    }
  }

  componentWillUnmount () {
    const { onClose } = this.props;
    const target = this._getTarget();
    if (target) {
      target.removeEventListener('click', onClose);
      target.removeEventListener('blur', onClose);
    }
  }

  _getTarget () {
    const { target } = this.props;

    return (
      document.getElementById(target) ||
      document.querySelector(`.${target}`)
    );
  }

  _renderDropContent () {
    const { onClose } = this.props;
    return (
      <Box className={CLASS_ROOT}
        pad={{ horizontal: 'medium', vertical: 'small' }}
        onClick={onClose}>
        {this.props.children}
      </Box>
    );
  }

  render () {
    const { drop } = this.state;
    return <>{drop ? <PortalDrop content={this._renderDropContent()} control={drop.control} opts={drop.opts} /> : null}</>;
  }

}

Tip.propTypes = {
  colorIndex: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  target: PropTypes.string.isRequired,
  intl: PropTypes.object
};

Tip.defaultProps = {
  colorIndex: 'accent-1'
};

export default composeKeepPropTypes(Tip, injectIntl);
