/*
 * Copyright (c) 2022 DXC Technology. All rights reserved.
 */

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CSSClassnames from '../utils/CSSClassnames';
import Props from '../utils/Props';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';
import Button from './Button';
import CheckBox from './CheckBox';
import PortalDrop from './PortalDrop';
import RadioButton from './RadioButton';
import Search from './Search';
import Tip from './Tip';
import DownIcon from './icons/base/CaretDown';
import Intl from '../utils/Intl';
import { announce } from '../utils/Announcer';
import _isEqual from 'lodash/isEqual';

const CLASS_ROOT = CSSClassnames.SELECT;
const { INPUT } = CSSClassnames;

const valueType = PropTypes.oneOfType([
  PropTypes.shape({
    label: PropTypes.node,
    value: PropTypes.any
  }),
  PropTypes.string,
  PropTypes.number
]);
const SelectPropTypes = {
  intl: PropTypes.object,
  inline: PropTypes.bool,
  multiple: PropTypes.bool,
  onSearch: PropTypes.func,
  onChange: PropTypes.func, // (value(s))
  placeHolder: PropTypes.string,
  searchPlaceHolder: PropTypes.string,
  options: PropTypes.arrayOf(valueType).isRequired,
  value: PropTypes.oneOfType([valueType, PropTypes.arrayOf(valueType)]),
  renderValue: PropTypes.func
};

const hasChildNode = (potentialParentNode, potentialChildNode) =>
  fWhile(
    potentialChildNode,
    (node) => !!node,
    (node) => node?.parentNode,
    (node, breakFc) => {
      if (node === potentialParentNode) {
        return breakFc(true);
      }
      return false;
    }
  );

class Select extends Component {
  constructor(props, context) {
    super(props, context);

    this._onToggleDrop = this._onToggleDrop.bind(this);
    this._onRemoveDrop = this._onRemoveDrop.bind(this);
    this._onForceClose = this._onForceClose.bind(this);
    this._onSearchChange = this._onSearchChange.bind(this);
    this._onNextOption = this._onNextOption.bind(this);
    this._onPreviousOption = this._onPreviousOption.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._stopPropagation = this._stopPropagation.bind(this);
    this._onInputKeyDown = this._onInputKeyDown.bind(this);
    this._announceOptions = this._announceOptions.bind(this);
    this._onShowTooltip = this._onShowTooltip.bind(this);
    this._onHideTooltip = this._onHideTooltip.bind(this);

    this.state = {
      divId: `select-tooltip-${Math.floor(Math.random() * 1000000000 + 1)}`,
      announceChange: false,
      activeOptionIndex: -1,
      dropActive: false,
      searchText: '',
      value: this._normalizeValue(props, {}),
      drop: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.props.hasOwnProperty('value') && !_isEqual(this.props.value, prevProps.value)) {
      // eslint-disable-next-line react/no-did-update-set-state,react/no-access-state-in-setstate
      this.setState({ value: this._normalizeValue(this.props, this.state) });
    }

    const { intl, inline, options, onSearch } = this.props;
    const { announceChange, dropActive } = this.state;

    // Set up keyboard listeners appropriate to the current state.
    const activeKeyboardHandlers = {
      up: this._onPreviousOption,
      down: this._onNextOption,
      enter: this._onEnter,
      left: this._stopPropagation,
      right: this._stopPropagation
    };

    if (!inline) {
      activeKeyboardHandlers.esc = this._onForceClose;
      activeKeyboardHandlers.tab = this._onForceClose;
    }

    const controlRef = inline ? this.contentRef : this.selectRef;
    // the order here is important, need to turn off keys before turning on
    if (!dropActive && prevState.dropActive) {
      document.removeEventListener('click', this._onRemoveDrop);
      KeyboardAccelerators.stopListeningToKeyboard(controlRef, activeKeyboardHandlers);
      this.setState({ drop: null });
    }

    if ((inline && !prevProps.inline) || (dropActive && !prevState.dropActive)) {
      if (!inline) {
        document.addEventListener('click', this._onRemoveDrop);
      }

      KeyboardAccelerators.startListeningToKeyboard(controlRef, activeKeyboardHandlers);

      if (!inline) {
        // If this is inside a FormField, place the drop in reference to it.
        const control = this.valueRef || this.inputRef;
        this.setState({
          drop: {
            control,
            opts: {
              align: { top: 'bottom', left: 'left' },
              context: { intl },
              responsive: false, // so suggestion changes don't re-align
              slightlyResponsivePxHeight: onSearch ? 11.5 * 15 : 7 * 15
            }
          }
        });
      }
    }

    if (announceChange && options) {
      const matchResultsMessage = Intl.getMessage(intl, 'Match Results', {
        count: options.length
      });
      let navigationHelpMessage = '';
      if (options.length) {
        navigationHelpMessage = `(${Intl.getMessage(intl, 'Navigation Help')})`;
      }
      announce(`${matchResultsMessage} ${navigationHelpMessage}`);
      this.setState({ announceChange: false });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._onRemoveDrop);
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  _normalizeValue(props, state) {
    const { multiple, value } = props;
    let normalizedValue = value;
    if (multiple) {
      if (value) {
        if (!Array.isArray(value)) {
          normalizedValue = [value];
        }
      } else {
        normalizedValue = [];
      }
    }
    return normalizedValue;
  }

  _announceOptions(index) {
    const { intl } = this.props;
    const labelMessage = this._renderValue(this.props.options[index]);
    const enterSelectMessage = Intl.getMessage(intl, 'Enter Select');
    announce(`${labelMessage} ${enterSelectMessage}`);
  }

  // eslint-disable-next-line class-methods-use-this
  _onInputKeyDown(event) {
    const up = 38;
    const down = 40;
    if (event.keyCode === up || event.keyCode === down) {
      // stop the input to move the cursor when options are present
      event.preventDefault();
    }
  }

  _onSearchChange(event) {
    const { inline } = this.props;
    this.setState({
      announceChange: true,
      activeOptionIndex: -1,
      dropActive: !inline,
      searchText: event.target.value
    });
    if (this.props.onSearch) {
      this.props.onSearch(event);
    }
  }

  _onToggleDrop(event) {
    const { dropActive } = this.state;
    const { options, value } = this.props;
    event.preventDefault();
    const clickedContent = this.contentRef && hasChildNode(this.contentRef, event.target);
    if (clickedContent) {
      return;
    }
    this._lastAddEventTimestamp = event.timeStamp;
    if (dropActive) {
      this.setState({
        dropActive: false
      });
    } else if (options) {
      // Get values of options, so we can highlight selected option
      const optionValues = options.map((option) => {
        if (option && typeof option === 'object') {
          return option.value;
        }
        return option;
      });
      const activeOptionIndex = optionValues.indexOf(value);
      this.setState({
        dropActive: true,
        activeOptionIndex
      });
    }
  }

  _onRemoveDrop(event) {
    const clickedContent = this.contentRef && hasChildNode(this.contentRef, event.target);
    const clickedSearch = this._searchRef && hasChildNode(this._searchRef, event.target);
    if (
      this._lastAddEventTimestamp !== event.timeStamp &&
      !clickedSearch &&
      (!this.props.multiple || !clickedContent) &&
      (!this.selectRef || !(hasChildNode(this.selectRef, event.target) && !clickedContent))
    ) {
      this.setState({ dropActive: false });
    }
  }

  _onForceClose() {
    this.setState({ dropActive: false });
  }

  _onNextOption(event) {
    event.preventDefault();
    // eslint-disable-next-line react/no-access-state-in-setstate
    let index = this.state.activeOptionIndex;
    index = Math.min(index + 1, this.props.options.length - 1);
    this.setState({ activeOptionIndex: index }, this._announceOptions.bind(this, index));
  }

  _onPreviousOption(event) {
    event.preventDefault();
    // eslint-disable-next-line react/no-access-state-in-setstate
    let index = this.state.activeOptionIndex;
    index = Math.max(index - 1, 0);
    this.setState({ activeOptionIndex: index }, this._announceOptions.bind(this, index));
  }

  _valueForSelectedOption(option) {
    const { multiple } = this.props;
    const { value } = this.state;
    let nextValue;
    const isClearingOption = option?.clearValue;
    if (isClearingOption) {
      return multiple ? [] : option;
    }
    if (multiple) {
      nextValue = value.slice(0);
      let index;
      for (index = 0; index < nextValue.length; index += 1) {
        if (this._valueEqualsOption(nextValue[index], option)) {
          break;
        }
      }
      if (index < nextValue.length) {
        // already existing, remove
        nextValue.splice(index, 1);
      } else {
        // not there, add
        nextValue.push(option);
      }
    } else {
      nextValue = option;
    }
    return nextValue;
  }

  _onEnter(event) {
    const { intl, onChange, options } = this.props;
    const { activeOptionIndex } = this.state;
    if (activeOptionIndex >= 0) {
      event.preventDefault(); // prevent submitting forms
      const option = options[activeOptionIndex];
      const value = this._valueForSelectedOption(option);
      this.setState({ dropActive: false, value }, () => {
        const optionMessage = this._renderLabel(option);
        const selectedMessage = Intl.getMessage(intl, 'Selected');
        announce(`${optionMessage} ${selectedMessage}`);
      });
      if (onChange) {
        onChange({ target: this.inputRef, option, value });
      }
    } else {
      this.setState({ dropActive: false });
    }
  }

  // eslint-disable-next-line consistent-return
  _stopPropagation() {
    // eslint-disable-next-line react/no-find-dom-node
    if (hasChildNode(this._searchRef, document.activeElement)) {
      return true;
    }
  }

  _onClickOption(option) {
    const { onChange, multiple } = this.props;
    const value = this._valueForSelectedOption(option);
    this.setState((prevState) => ({ dropActive: multiple ? prevState.dropActive : false, value }));
    if (onChange) {
      onChange({ target: this.inputRef, option, value });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _renderLabel(option) {
    if (option && typeof option === 'object') {
      // revert for announce as label is often a complex object
      return option.label || option.value || '';
    }
    return undefined === option || option === null ? '' : option;
  }

  // eslint-disable-next-line consistent-return
  _renderValue(option) {
    const { intl, renderValue } = this.props;
    if (renderValue) {
      return renderValue(option);
    }
    if (Array.isArray(option)) {
      // Could be an Array when !inline+multiple
      if (option.length === 1) {
        return this._renderValue(option[0]);
      }
      if (option.length > 1) {
        const selectedMultiple = Intl.getMessage(intl, 'Selected Multiple', {
          count: option.length
        });
        return selectedMultiple;
      }
    } else if (option && typeof option === 'object') {
      return option.label || option.value || '';
    } else {
      return undefined === option || option === null ? '' : option;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _valueEqualsOption(value, option) {
    let result = false;
    if (value && typeof value === 'object') {
      if (option && typeof option === 'object') {
        result = value.value === option.value;
      } else {
        result = value.value === option;
      }
    } else if (option && typeof option === 'object') {
      result = value === option.value;
    } else {
      result = value === option;
    }
    return result;
  }

  _optionSelected(option, value) {
    let result;
    if (value && Array.isArray(value)) {
      result = value.some((val) => this._valueEqualsOption(val, option));
    } else {
      result = this._valueEqualsOption(value, option);
    }
    return result;
  }

  _renderOptions(className, restProps = {}) {
    const { intl } = this.props;
    const {
      // eslint-disable-next-line react/prop-types
      id,
      inline,
      multiple,
      options,
      onSearch,
      value,
      searchPlaceHolder = Intl.getMessage(intl, 'Search')
    } = this.props;
    const { activeOptionIndex, searchText } = this.state;

    let search;
    if (onSearch) {
      search = (
        <div ref={(ref) => (this._searchRef = ref)}>
          <Search
            className={`${CLASS_ROOT}__search`}
            inline={true}
            fill={true}
            responsive={false}
            pad="medium"
            placeHolder={searchPlaceHolder}
            value={searchText}
            onDOMChange={this._onSearchChange}
            onKeyDown={this._onInputKeyDown}
          />
        </div>
      );
    }

    let items;
    if (options) {
      items = options.map((option, index) => {
        const selected = this._optionSelected(option, value);
        let content = this._renderLabel(option);
        const classes = classnames({
          [`${CLASS_ROOT}__option`]: true,
          [`${CLASS_ROOT}__option--element`]: React.isValidElement(content),
          [`${CLASS_ROOT}__option--selected`]: selected,
          [`${CLASS_ROOT}__option--active`]: index === activeOptionIndex
        });

        if (option && option.icon) {
          content = (
            <span>
              {option.icon} {content}
            </span>
          );
        }

        let itemOnClick;
        if (inline) {
          const itemId = `${option ? option.value || option : index}`;
          const Type = multiple ? CheckBox : RadioButton;
          content = (
            <Type
              key={itemId}
              id={id ? `${id}-${itemId}` : undefined}
              label={content}
              checked={selected}
              onChange={this._onClickOption.bind(this, option)}
            />
          );
        } else {
          itemOnClick = (e) => {
            e.stopPropagation();
            this._onClickOption.bind(this, option)();
          };
        }

        return (
          <li key={index} className={classes} onClick={itemOnClick}>
            {content}
          </li>
        );
      });
    }

    let onClick;
    if (!inline || !multiple) {
      onClick = this._onRemoveDrop;
    }

    return (
      <div {...restProps} className={className} ref={(ref) => (this.contentRef = ref)}>
        {search}
        <ol className={`${CLASS_ROOT}__options`} onClick={onClick}>
          {items}
        </ol>
      </div>
    );
  }

  _onShowTooltip() {
    if (!this.state.dropActive && this.inputRef && this.inputRef.offsetWidth < this.inputRef.scrollWidth) {
      const tooltipText = (this.inputRef && this.inputRef.value) || '';
      if (tooltipText) {
        this.setState({ tooltipText });
      }
    }
  }

  _onHideTooltip() {
    this.setState({ tooltipText: null });
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { intl, className, inline, placeHolder, value } = this.props;
    const { active, divId, tooltipText, drop } = this.state;
    const classes = classnames(
      CLASS_ROOT,
      {
        [`${CLASS_ROOT}--active`]: active,
        [`${CLASS_ROOT}--inline`]: inline
      },
      className
    );
    const restProps = Props.omit(this.props, Object.keys(SelectPropTypes));

    if (inline) {
      return this._renderOptions(classes, restProps);
    }
    const renderedValue = this._renderValue(value);
    const shouldRenderElement = React.isValidElement(renderedValue);

    return (
      <div
        className={classes}
        ref={(ref) => (this.selectRef = ref)}
        onClick={(evt) => {
          this._onHideTooltip();
          this._onToggleDrop(evt);
        }}
        id={divId}
        onMouseEnter={this._onShowTooltip}
        onMouseLeave={this._onHideTooltip}>
        {shouldRenderElement ? (
          <div ref={(ref) => (this.valueRef = ref)} className={`${CLASS_ROOT}__value`}>
            {renderedValue}
          </div>
        ) : null}
        <input
          {...restProps}
          ref={(ref) => (this.inputRef = ref)}
          type={shouldRenderElement ? 'hidden' : 'text'}
          className={`${INPUT} ${CLASS_ROOT}__input`}
          placeholder={placeHolder}
          readOnly={true}
          value={(!shouldRenderElement && renderedValue) || ''}
        />
        <Button
          className={`${CLASS_ROOT}__control`}
          a11yTitle={Intl.getMessage(intl, 'Select Icon')}
          icon={<DownIcon />}
          onClick={this._onToggleDrop}
        />
        {!shouldRenderElement && tooltipText ? (
          <Tip target={divId} onClose={() => {}} colorIndex="accent-1">
            {tooltipText}
          </Tip>
        ) : null}
        {drop ? (
          <PortalDrop
            content={this._renderOptions(`${CLASS_ROOT}__drop`)}
            control={drop.control}
            opts={drop.opts}
            afterRender={() => {
              if (this._searchRef) {
                this._searchRef.getElementsByTagName('input')[0]?.focus();
              }
            }}
          />
        ) : null}
      </div>
    );
  }
}

Select.propTypes = SelectPropTypes;

export default injectIntl(Select);
