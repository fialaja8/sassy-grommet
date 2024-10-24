// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CSSClassnames from '../utils/CSSClassnames';

const CLASS_ROOT = CSSClassnames.FORM_FIELD;

export default class FormField extends Component {

  constructor(props) {
    super(props);

    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onClick = this._onClick.bind(this);

    this.state = { focus: false };
  }

  componentDidMount () {
    const contentsElement = this.contentsRef;
    if (contentsElement) {
      const inputElements = (
        contentsElement.querySelectorAll('input, textarea, select')
      );
      if (inputElements.length === 1) {
        this._inputElement = inputElements[0];
        this._inputElement.addEventListener('focus', this._onFocus);
        this._inputElement.addEventListener('blur', this._onBlur);
      }
    }
  }

  componentWillUnmount () {
    if (this._inputElement) {
      this._inputElement.removeEventListener('focus', this._onFocus);
      this._inputElement.removeEventListener('blur', this._onBlur);
      delete this._inputElement;
    }
  }

  _onFocus () {
    this.setState({focus: true});
  }

  _onBlur () {
    this.setState({focus: false});
  }

  _onClick (evt) {
    if (this._inputElement && this.containerRef) {
      let node = evt.target;
      let containerFound = false;
      while (node && node.parentNode) {
        if (node === document.body) {
          break;
        }
        if (node === this.containerRef) {
          containerFound = true;
          break;
        }
        let nodeParent = null;
        try {
          nodeParent = node.parentNode;
        } catch (e) {
          // Nothing
        }
        node = nodeParent;
      }
      if (containerFound) {
        this._inputElement.focus();
      }
    }
  }

  render () {
    const {
      children, className, help, hidden, htmlFor, label, size, strong, error,
      ...props
    } = this.props;

    const classes = classnames(
      CLASS_ROOT,
      {
        [`${CLASS_ROOT}--focus`]: this.state.focus,
        [`${CLASS_ROOT}--hidden`]: hidden,
        [`${CLASS_ROOT}--text`]: htmlFor,
        [`${CLASS_ROOT}--size-${size}`]: size,
        [`${CLASS_ROOT}--strong`]: strong,
        [`${CLASS_ROOT}--error`]: error
      },
      className
    );

    const fieldError = (error)
      ? <span className={CLASS_ROOT + "__error"}>{error}</span>
      : undefined;

    const fieldHelp = (help !== null && help !== undefined)
      ? <span className={CLASS_ROOT + "__help"}>{this.props.help}</span>
      : undefined;

    const labelNode = (label) ? (
      <label className={CLASS_ROOT + "__label"} htmlFor={htmlFor}>
        {label}
      </label>
    ) : undefined;

    return (
      <div className={classes} {...props} onClick={this._onClick} ref={ref => this.containerRef = ref}>
        {fieldError}
        {labelNode}
        {fieldHelp}
        <span ref={ref => this.contentsRef = ref}
          className={CLASS_ROOT + "__contents"}>
          {children}
        </span>
      </div>
    );
  }

}

FormField.propTypes = {
  error: PropTypes.node,
  help: PropTypes.node,
  hidden: PropTypes.bool,
  htmlFor: PropTypes.string,
  label: PropTypes.node,
  size: PropTypes.oneOf(['medium', 'large']),
  strong: PropTypes.bool
};

FormField.defaultProps = {
  size: 'medium',
  strong: false
};
