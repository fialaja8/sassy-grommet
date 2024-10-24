// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { injectIntl, IntlProvider } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import ReactDOM_client from 'react-dom/client';
import classnames from 'classnames';
import Button from './Button';
import CloseIcon from './icons/base/Close';
import CSSClassnames from '../utils/CSSClassnames';
import { filterByFocusable } from '../utils/DOM';
import Intl from '../utils/Intl';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';

const CLASS_ROOT = CSSClassnames.LAYER;
const APP = CSSClassnames.APP;

class LayerContents extends Component {

  constructor(props) {
    super(props);

    this._onClickOverlay = this._onClickOverlay.bind(this);
    this._processTab = this._processTab.bind(this);

    this.state = {
      dropActive: false
    };
  }

  componentDidMount () {
    const { hidden, onClose, overlayClose } = this.props;

    if (!hidden) {
      this.anchorStepRef.focus();
      this.anchorStepRef.scrollIntoView();
    }

    this._keyboardHandlers = {
      tab: this._processTab
    };
    if (onClose) {
      this._keyboardHandlers.esc = onClose;
    }
    KeyboardAccelerators.startListeningToKeyboard(
      this.containerRef, this._keyboardHandlers
    );

    if (onClose && overlayClose) {
      const layerParent = this.containerRef.parentNode;
      layerParent.addEventListener('click', this._onClickOverlay);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { hidden } = this.props;
    if (prevProps.hidden !== hidden) {
      KeyboardAccelerators.stopListeningToKeyboard(
        this.containerRef, this._keyboardHandlers
      );

      if (!hidden) {
        KeyboardAccelerators.startListeningToKeyboard(
          this.containerRef, this._keyboardHandlers
        );
      }
    }
  }

  componentWillUnmount () {
    const { onClose, overlayClose } = this.props;
    KeyboardAccelerators.stopListeningToKeyboard(
      this.containerRef, this._keyboardHandlers
    );

    if (onClose && overlayClose) {
      const layerParent = this.containerRef.parentNode;
      layerParent.removeEventListener('click', this._onClickOverlay);
    }
  }

  _processTab (event) {
    const {hidden} = this.props;
    if (hidden) {
      return;
    }
    let items = this.containerRef.getElementsByTagName('*');
    items = filterByFocusable(items);

    if (!items || items.length === 0) {
      event.preventDefault();
    } else {
      if (event.shiftKey) {
        if (event.target === items[0]) {
          items[items.length - 1].focus();
          event.preventDefault();
        }
      } else if (event.target === items[items.length - 1]) {
        items[0].focus();
        event.preventDefault();
      }
    }
  }

  _onClickOverlay (event) {
    const { dropActive } = this.state;
    if (!dropActive) {
      const { onClose } = this.props;
      const layerContents = this.containerRef;

      if (layerContents && !layerContents.contains(event.target)) {
        onClose();
      }
    }
  }

  render () {
    const { a11yTitle, children, closer, onClose } = this.props;
    const { intl } = this.props;

    let closerNode;
    if (typeof closer === 'object') {
      closerNode = closer;
    } else if (onClose && closer) {
      const closeLabel = Intl.getMessage(intl, 'Close');
      const layerLabel = Intl.getMessage(intl, 'Layer');
      const closeIconTitle =
        `${closeLabel} ${a11yTitle || ''} ${layerLabel}`;

      closerNode = (
        <div className={`${CLASS_ROOT}__closer`}>
          <Button plain={true} icon={<CloseIcon
            a11yTitle={closeIconTitle} />}
          onClick={onClose} />
        </div>
      );
    }

    const res = (
      <div ref={ref => this.containerRef = ref}
        className={`${CLASS_ROOT}__container`}>
        <a tabIndex="-1" aria-hidden='true' style={{ outline: 'none' }}
          ref={ref => this.anchorStepRef = ref} />
        {closerNode}
        {children}
      </div>
    );
    return intl ? <IntlProvider locale={intl.locale} messages={intl.messages}>{res}</IntlProvider> : res;
  }
}

LayerContents.propTypes = {
  a11yTitle: PropTypes.string,
  closer: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.bool
  ]),
  history: PropTypes.object,
  intl: PropTypes.object,
  onClose: PropTypes.func,
  overlayClose: PropTypes.bool
};

// Because Layer creates a new DOM render context, the context
// is not transfered. For now, we hard code these specific ones.
// TODO: Either figure out how to introspect the context and transfer
// whatever we find or have callers explicitly indicate which parts
// of the context to transfer somehow.

class Layer extends Component {

  componentDidMount () {
    this._originalFocusedElement = document.activeElement;
    this._originalScrollPosition = {
      top: window.pageYOffset,
      left: window.pageXOffset
    };
    this._addLayer();
    this._renderLayer();
  }

  componentDidUpdate () {
    this._renderLayer();
  }

  componentWillUnmount () {
    const { hidden } = this.props;
    if (this._originalFocusedElement && !hidden) {
      if (this._originalFocusedElement.focus) {
        // wait for the fixed positioning to come back to normal
        // see layer styling for reference
        setTimeout(() => {
          this._originalFocusedElement.focus();
          window.scrollTo(
            this._originalScrollPosition.left, this._originalScrollPosition.top
          );
        }, 0);
      } else if (this._originalFocusedElement.parentNode &&
        this._originalFocusedElement.parentNode.focus) {
        // required for IE11 and Edge
        this._originalFocusedElement.parentNode.focus();
        window.scrollTo(
          this._originalScrollPosition.left, this._originalScrollPosition.top
        );
      }
    }

    this._removeLayer();
  }

  _classesFromProps () {
    const {
      align, className, closer, flush, hidden, peek
    } = this.props;

    return classnames(
      'grommet',
      CLASS_ROOT,
      {
        [`${CLASS_ROOT}--align-${this.props.align}`]: align,
        [`${CLASS_ROOT}--closeable`]: closer,
        [`${CLASS_ROOT}--flush`]: flush,
        [`${CLASS_ROOT}--hidden`]: hidden,
        [`${CLASS_ROOT}--peek`]: peek
      },
      className
    );
  }

  _addLayer () {
    const {
      id
    } = this.props;

    const element = document.createElement('div');
    if (id) {
      element.id = id;
    }
    element.className = this._classesFromProps();
    // insert before .app, if possible.
    var appElements = document.querySelectorAll(`.${APP}`);
    var beforeElement;
    if (appElements.length > 0) {
      beforeElement = appElements[0];
    } else {
      beforeElement = document.body.firstChild;
    }
    if (beforeElement) {
      this._element =
        beforeElement.parentNode.insertBefore(element, beforeElement);
    }
  }

  _handleAriaHidden (hideOverlay) {
    setTimeout(() => {
      const ariaHidden = hideOverlay || false;
      const grommetApps = document.querySelectorAll(`.${APP}`);
      const visibleLayers = document.querySelectorAll(
        `.${CLASS_ROOT}:not(.${CLASS_ROOT}--hidden)`
      );

      if (grommetApps) {
        Array.prototype.slice.call(grommetApps).forEach((grommetApp) => {
          if (ariaHidden && visibleLayers.length === 0) {
            // make sure to only show grommet apps if there is no other layer
            grommetApp.setAttribute('aria-hidden', false);
            grommetApp.classList.remove(`${APP}--hidden`);
            // scroll body content to the original position
            grommetApp.style.top = `-${this._originalScrollPosition.top}px`;
            grommetApp.style.left = `-${this._originalScrollPosition.left}px`;
          } else {
            grommetApp.setAttribute('aria-hidden', true);
            grommetApp.classList.add(`${APP}--hidden`);
            // this must be null to work
            grommetApp.style.top = null;
            grommetApp.style.left = null;
          }
        }, this);
      }
    }, 0);
  }

  _renderLayer () {
    if (this._element) {
      this._element.className = this._classesFromProps();
      const contents = (
        <LayerContents {...this.props}
          history={this.props.history}
          intl={this.props.intl} />
      );
      this._elementRDRoot = ReactDOM_client.createRoot(this._element);
      this._elementRDRoot.render(contents, () => {
        const { hidden } = this.props;
        if (hidden) {
          this._handleAriaHidden(true);
        } else {
          this._handleAriaHidden(false);
        }
      });
    }
  }

  _removeLayer () {
    if (this._element) {
      this._element.removeEventListener('animationend', this._onAnimationEnd);
      if (this._elementRDRoot) {
        this._elementRDRoot.unmount();
      }
      this._element.parentNode.removeChild(this._element);
      this._element = undefined;

      // make sure to handle aria attributes after the layer is removed
      this._handleAriaHidden(true);
    }
  }

  render () {
    return (<span style={{display: 'none'}} />);
  }

}

Layer.propTypes = {
  history: PropTypes.object,
  intl: PropTypes.object,
  align: PropTypes.oneOf(['center', 'top', 'bottom', 'left', 'right']),
  closer: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.bool
  ]),
  flush: PropTypes.bool,
  hidden: PropTypes.bool,
  overlayClose: PropTypes.bool,
  peek: PropTypes.bool,
  onClose: PropTypes.func
};


Layer.defaultProps = {
  align: 'center'
};

export default withRouter(injectIntl(Layer));
