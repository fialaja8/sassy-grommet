// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';
import Props from '../utils/Props';
import Responsive from '../utils/Responsive';
import Button from './Button';
import SearchIcon from './icons/base/Search';
import CSSClassnames from '../utils/CSSClassnames';
import Intl from '../utils/Intl';
import { announce } from '../utils/Announcer';
import InputPaste from "../utils/InputPaste";
import PortalDrop, {dropAlignPropType} from "./PortalDrop";

const CLASS_ROOT = CSSClassnames.SEARCH;
const INPUT = CSSClassnames.INPUT;
const BACKGROUND_COLOR_INDEX = CSSClassnames.BACKGROUND_COLOR_INDEX;

class Search extends Component {

  constructor(props) {
    super(props);

    this._onAddDrop = this._onAddDrop.bind(this);
    this._onRemoveDrop = this._onRemoveDrop.bind(this);
    this._onFocusInput = this._onFocusInput.bind(this);
    this._onChangeInput = this._onChangeInput.bind(this);
    this._onClickBody = this._onClickBody.bind(this);
    this._onNextSuggestion = this._onNextSuggestion.bind(this);
    this._onPreviousSuggestion = this._onPreviousSuggestion.bind(this);
    this._announceSuggestion = this._announceSuggestion.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onClickSuggestion = this._onClickSuggestion.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onInputKeyDown = this._onInputKeyDown.bind(this);
    this._onSink = this._onSink.bind(this);
    this._onResponsive = this._onResponsive.bind(this);
    this._stopPropagation = this._stopPropagation.bind(this);

    this.state = {
      announceChange: false,
      activeSuggestionIndex: -1,
      align: 'left',
      dropActive: false,
      inline: props.inline,
      small: false
    };
  }

  componentDidMount () {
    const { initialFocus, inline, responsive } = this.props;
    if (inline && responsive) {
      this._responsive = Responsive.start(this._onResponsive);
    }
    if (initialFocus) {
      this._inputRef?.focus();
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { dropAlign, suggestions } = this.props;
    const { announceChange, dropActive, inline, small } = this.state;
    const { intl } = this.props;

    if (suggestions && suggestions.length > 0 &&
      ! dropActive && this._inputRef === document.activeElement) {
      this.setState({ dropActive: true });
    } else if ((! suggestions || suggestions.length === 0)
      && inline && dropActive) {
      this.setState({ dropActive: false });
    }
    if (! small && prevProps.inline !== this.props.inline) {
      this.setState({ inline: this.props.inline });
    }

    // Set up keyboard listeners appropriate to the current state.
    const activeKeyboardHandlers = {
      esc: this._onRemoveDrop,
      tab: this._onRemoveDrop,
      up: this._onPreviousSuggestion,
      down: this._onNextSuggestion,
      enter: this._onEnter,
      left: this._stopPropagation,
      right: this._stopPropagation
    };

    if (! dropActive && prevState.dropActive) {
      document.removeEventListener('click', this._onClickBody);
      KeyboardAccelerators.stopListeningToKeyboard(this._controlRef,
        activeKeyboardHandlers);
      this.setState({drop: null});
    }

    if (dropActive && ! prevState.dropActive) {
      KeyboardAccelerators.startListeningToKeyboard(this._controlRef,
        activeKeyboardHandlers);

      let baseElement;
      if (this._controlRef) {
        baseElement = this._controlRef;
      } else {
        baseElement = this._inputRef;
      }
      const align = dropAlign || {
        top: (inline ? 'bottom' : 'top'),
        left: 'left'
      };
      this.setState({drop: {control:baseElement, opts:{
        align: align,
        focusControl: ! inline,
        responsive: false // so suggestion changes don't re-align
      }}},() => {
        document.addEventListener('click', this._onClickBody);
      });
    }

    if (announceChange && suggestions) {
      const matchResultsMessage = Intl.getMessage(
        intl, 'Match Results', {
          count: suggestions.length
        }
      );
      let navigationHelpMessage = '';
      if (suggestions.length) {
        navigationHelpMessage = `(${Intl.getMessage(intl, 'Navigation Help')})`;
      }
      announce(`${matchResultsMessage} ${navigationHelpMessage}`);
      this.setState({ announceChange: false });
    }
  }

  componentWillUnmount () {
    document.removeEventListener('click', this._onClickBody);
    KeyboardAccelerators.stopListeningToKeyboard(this._controlRef);
    if (this._responsive) {
      this._responsive.stop();
    }
  }

  focus () {
    const input = this._inputRef;
    if (input) {
      (input).focus();
    }
  }

  _stopPropagation () {
    if (document.activeElement === this._inputRef) {
      return true;
    }
  }

  _onInputKeyDown (event) {
    const {
      inline, onSelect, suggestions, onKeyDown
    } = this.props;
    const enter = 13;
    const { dropActive } = this.state;
    if (suggestions) {
      const up = 38;
      const down = 40;
      if (event.keyCode === up || event.keyCode === down) {
        // stop the input to move the cursor when suggestions are present
        event.preventDefault();

        if (event.keyCode === down && !dropActive && inline) {
          this._onAddDrop();
        }
      }
    }
    if (!dropActive && onSelect && event.keyCode === enter) {
      onSelect({
        target: this._inputRef || this._controlRef
      }, false);
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  }

  _onClickBody (event) {
    // don't close drop when clicking on input
    if (event.target !== this._inputRef) {
      this._onRemoveDrop();
    }
  }

  _onAddDrop () {
    this.setState({ dropActive: true, activeSuggestionIndex: -1 });
  }

  _onRemoveDrop () {
    this.setState({ dropActive: false });
  }

  _onFocusInput (event) {
    const { onFocus, suggestions } = this.props;
    if (onFocus) {
      onFocus(event);
    }
    if (suggestions && suggestions.length > 0) {
      this._onAddDrop();
    }
  }

  _fireDOMChange () {
    const { onDOMChange } = this.props;
    let event;
    try {
      event = new Event('change', {
        'bubbles': true,
        'cancelable': true
      });
    } catch (e) {
      // IE11 workaround.
      event = document.createEvent('Event');
      event.initEvent('change', true, true);
    }
    const target = this._inputRef;
    target.dispatchEvent(event);
    onDOMChange(event);
  }

  _onChangeInput (event) {
    const { onDOMChange } = this.props;
    this.setState({ activeSuggestionIndex: -1, announceChange: true });
    if (onDOMChange) {
      this._fireDOMChange();
    }
  }

  _announceSuggestion (index) {
    const { intl } = this.props;
    const labelMessage = this._renderLabel(this.props.suggestions[index]);
    const enterSelectMessage = Intl.getMessage(intl, 'Enter Select');
    announce(`${labelMessage} ${enterSelectMessage}`);
  }

  _onNextSuggestion () {
    const { suggestions } = this.props;
    if (suggestions) {
      let index = this.state.activeSuggestionIndex;
      index = Math.min(index + 1, suggestions.length - 1);
      this.setState({ activeSuggestionIndex: index },
        this._announceSuggestion.bind(this, index));
    }
  }

  _onPreviousSuggestion () {
    const { suggestions } = this.props;
    if (suggestions) {
      let index = this.state.activeSuggestionIndex;
      index = Math.max(index - 1, 0);
      this.setState({ activeSuggestionIndex: index },
        this._announceSuggestion.bind(this, index));
    }
  }

  _onEnter (event) {
    const { inline, onSelect, suggestions } = this.props;
    const { activeSuggestionIndex } = this.state;
    const { intl } = this.props;
    // for not inline search the enter should NOT submit the form
    // in this case double enter is required
    if (!inline) {
      event.preventDefault(); // prevent submitting forms
    }

    if (activeSuggestionIndex >= 0) {
      const suggestion = suggestions[activeSuggestionIndex];
      this.setState({ value: suggestion }, () => {
        const suggestionMessage = this._renderLabel(suggestion);
        const selectedMessage = Intl.getMessage(intl, 'Selected');
        announce(`${suggestionMessage} ${selectedMessage}`);
      });
      if (onSelect) {
        onSelect({
          target: this._inputRef || this._controlRef,
          suggestion: suggestion
        }, true);
      }
    } else if (onSelect) {
      onSelect({
        target: this._inputRef || this._controlRef
      }, false);
    }

    this._onRemoveDrop();
  }

  _onClickSuggestion (suggestion) {
    const { onSelect } = this.props;
    this._onRemoveDrop();
    if (onSelect) {
      onSelect({
        target: this._inputRef || this._controlRef,
        suggestion: suggestion
      }, true);
    }
  }

  _onMouseUp(event) {
    const { onMouseUp } = this.props;
    // This fixes a Safari bug which prevents the input
    // text from being selected on focus.
    event.preventDefault();
    if (onMouseUp) {
      onMouseUp(event);
    }
  }

  _onSink (event) {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  _onResponsive (small) {
    const { inline } = this.props;
    if (small) {
      this.setState({ inline: false, small: small });
    } else {
      this.setState({ inline: inline, small: small });
    }
  }

  _renderLabel (suggestion) {
    if (typeof suggestion === 'object') {
      return suggestion.label || suggestion.value;
    } else {
      return suggestion;
    }
  }

  _renderDropContent () {
    const {
      defaultValue, dropAlign, dropColorIndex, suggestions, value
    } = this.props;
    const { inline, activeSuggestionIndex } = this.state;
    let restProps = Props.omit(this.props, Object.keys(Search.propTypes));
    const classes = classnames(
      `${CLASS_ROOT}__drop`,
      {
        [`${BACKGROUND_COLOR_INDEX}-${dropColorIndex}`]: dropColorIndex,
        [`${CLASS_ROOT}__drop--controlled`]: !inline
      }
    );

    let input;
    if (!inline) {
      input = (
        <input {...restProps} key='input' ref={(ref) => this._inputRef = ref}
          type='search' autoComplete='off' value={value}
          defaultValue={defaultValue} onChange={this._onChangeInput}
          className={`${INPUT} ${CLASS_ROOT}__input`}
          onKeyDown={this._onInputKeyDown} />
      );
    }

    let suggestionsNode;
    if (suggestions) {
      suggestionsNode = suggestions.map((suggestion, index) => {
        const classes = classnames(
          `${CLASS_ROOT}__suggestion`,
          {
            [`${CLASS_ROOT}__suggestion--active`]: (
              index === activeSuggestionIndex
            )
          }
        );

        return (
          <div key={index} className={classes} tabIndex='-1' role='button'
            onClick={this._onClickSuggestion.bind(this, suggestion)}
            onFocus={() => this.setState({ activeSuggestionIndex: index })}>
            {this._renderLabel(suggestion)}
          </div>
        );
      }, this);
      suggestionsNode = (
        <div key='suggestions' className={`${CLASS_ROOT}__suggestions`}>
          {suggestionsNode}
        </div>
      );
    }

    let contents = [input, suggestionsNode];

    if (!inline) {
      contents = [
        <div key='contents' className={`${CLASS_ROOT}__drop-contents`}
          onClick={this._onSink}>
          {contents}
        </div>
      ];
      if (! dropAlign || (! dropAlign.top && ! dropAlign.bottom)) {
        const control = (
          <Button key='icon' icon={<SearchIcon />}
            className={`${CLASS_ROOT}__drop-control`}
            onClick={this._onRemoveDrop} />
        );
        if (! dropAlign || dropAlign.left === 'left') {
          contents.unshift(control);
        } else if (dropAlign.right === 'right') {
          contents.push(control);
        }
      }
    }

    return (
      <div className={classes}>
        {contents}
      </div>
    );
  }

  render () {
    const {
      className, defaultValue, iconAlign, id, fill, pad, placeHolder, size,
      value
    } = this.props;
    const { inline, drop } = this.state;
    const restProps = Props.omit(this.props, Object.keys(Search.propTypes));
    const classes = classnames(
      CLASS_ROOT,
      {
        [`${CLASS_ROOT}--controlled`]: !(inline),
        [`${CLASS_ROOT}--fill`]: fill,
        [`${CLASS_ROOT}--icon-align-${iconAlign}`]: iconAlign,
        [`${CLASS_ROOT}--pad-${pad}`]: pad,
        [`${CLASS_ROOT}--inline`]: inline,
        [`${CLASS_ROOT}--${size}`]: size
      },
      className
    );

    if (inline) {
      return (
        <div className={classes}>
          <input {...restProps} ref={(ref) => this._inputRef = ref}
            type='search' id={id} placeholder={placeHolder}
            autoComplete='off'
            defaultValue={this._renderLabel(defaultValue)}
            value={this._renderLabel(value)}
            className={`${INPUT} ${CLASS_ROOT}__input`}
            onFocus={this._onFocusInput}
            onChange={this._onChangeInput}
            onMouseUp={this._onMouseUp}
            onKeyDown={this._onInputKeyDown}
            onPaste={InputPaste.getInputOnPaste('search')} />
          <SearchIcon />
        </div>
      );

    } else {
      return (
        <><Button innerRef={(ref) => this._controlRef = ref}
          id={id} className={className} icon={<SearchIcon />}
          onClick={this._onAddDrop} />
        {drop ? <PortalDrop content={this._renderDropContent()} control={drop.control} opts={drop.opts} afterRender={() => {
          if (this._inputRef) {
            this._inputRef.focus();
          }
        }} /> : null}
        </>
      );
    }
  }
}


Search.defaultProps = {
  align: 'left',
  iconAlign: 'end',
  inline: false,
  responsive: true
};

Search.propTypes = {
  intl: PropTypes.object,
  align: PropTypes.string,
  defaultValue: PropTypes.string,
  dropAlign: dropAlignPropType,
  dropColorIndex: PropTypes.string,
  fill: PropTypes.bool,
  iconAlign: PropTypes.oneOf(['start', 'end']),
  id: PropTypes.string,
  initialFocus: PropTypes.bool,
  inline: PropTypes.bool,
  onDOMChange: PropTypes.func,
  onSelect: PropTypes.func,
  onKeyDown: PropTypes.func,
  pad: PropTypes.oneOf(['small', 'medium']),
  placeHolder: PropTypes.string,
  responsive: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  suggestions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        label: PropTypes.node,
        value: PropTypes.any
      }),
      PropTypes.string
    ])
  ),
  value: PropTypes.string
};

export default injectIntl(Search);
