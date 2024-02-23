// (C) Copyright 2014 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import { filterByFocusable, findScrollParents, findVisibleParent } from '../utils/DOM';
import CSSClassnames from '../utils/CSSClassnames';
import KeyboardAccelerators from '../utils/KeyboardAccelerators';

const CLASS_ROOT = CSSClassnames.DROP;
const BACKGROUND_COLOR_INDEX = CSSClassnames.BACKGROUND_COLOR_INDEX;

/*
 * Drop is a utility for rendering components like drop down menus layered above
 * their initiating controls.
 */

// TODO: fix scroll reset on parent scroll

const VERTICAL_ALIGN_OPTIONS = ['top', 'bottom'];
const HORIZONTAL_ALIGN_OPTIONS = ['right', 'left'];

class DropContents extends Component {
  constructor (props) {
    super(props);
    this._processTab = this._processTab.bind(this);
  }

  componentDidMount () {
    const { focusControl, afterRender } = this.props;
    if (focusControl) {
      this._keyboardHandlers = {
        tab: this._processTab
      };
      KeyboardAccelerators.startListeningToKeyboard(
        this, this._keyboardHandlers
      );
    }
    if (afterRender) {
      afterRender();
    }
  }

  componentWillUnmount () {
    const { focusControl } = this.props;
    if (focusControl) {
      KeyboardAccelerators.stopListeningToKeyboard(
        this, this._keyboardHandlers
      );
    }
  }

  _processTab (event) {
    let items = this._containerRef.getElementsByTagName('*');
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

  render () {
    const { content, focusControl } = this.props;

    let anchorStep;
    if (focusControl) {
      anchorStep = (
        <a tabIndex="-1" aria-hidden='true'
          className={`${CLASS_ROOT}__anchor`} />
      );
    }
    return (
      <div ref={(ref) => this._containerRef = ref}>
        {anchorStep}
        {content}
      </div>
    );
  }
}

DropContents.propTypes = {
  content: PropTypes.node.isRequired,
  focusControl: PropTypes.bool,
  afterRender: PropTypes.func
};

const _normalizeOptions = (options) => {
  let opts = { ...options };
  // normalize for older interface that just had align content
  if (options.top || options.bottom || options.left || options.right) {
    opts = { align: { ...options } };
  }
  // validate align
  if (options && options.align && options.align.top &&
    VERTICAL_ALIGN_OPTIONS.indexOf(options.align.top) === -1) {
    console.warn("Warning: Invalid align.top value '" + options.align.top +
      "' supplied to Drop," +
      "expected one of [" + VERTICAL_ALIGN_OPTIONS.join(',') + "]");
  }
  if (options.align && options.align.bottom &&
    VERTICAL_ALIGN_OPTIONS.indexOf(options.align.bottom) === -1) {
    console.warn("Warning: Invalid align.bottom value '" +
      options.align.bottom +
      "' supplied to Drop," +
      "expected one of [" + VERTICAL_ALIGN_OPTIONS.join(',') + "]");
  }
  if (options.align && options.align.left &&
    HORIZONTAL_ALIGN_OPTIONS.indexOf(options.align.left) === -1) {
    console.warn("Warning: Invalid align.left value '" + options.align.left +
      "' supplied to Drop," +
      "expected one of [" + HORIZONTAL_ALIGN_OPTIONS.join(',') + "]");
  }
  if (options.align && options.align.right &&
    HORIZONTAL_ALIGN_OPTIONS.indexOf(options.align.right) === -1) {
    console.warn("Warning: Invalid align.right value '" +
      options.align.right +
      "' supplied to Drop," +
      "expected one of [" + HORIZONTAL_ALIGN_OPTIONS.join(',') + "]");
  }
  opts.align = { ...opts.align } || {};
  if (! options.align.top && ! options.align.bottom) {
    opts.align.top = "top";
  }
  if (! options.align.left && ! options.align.right) {
    opts.align.left = "left";
  }
  opts.responsive = options.responsive !== false ? true : options.responsive;
  return opts;
};

// Drop options:
//
// align: See dropAlignPropType
// className: PropTypes.string
// colorIndex: PropTypes.string
//    Background color
// focusControl: PropTypes.bool
//    Whether to focus inside the dropped content when added
// responsive: PropTypes.bool
//    Whether to dynamically re-place when resized
//

class PortalDrop extends Component {

  constructor (props) {
    super(props);
    const {control, opts} = props;
    const options = _normalizeOptions(opts);
    const { focusControl } = options;

    // bind functions to instance
    this.place = this.place.bind(this);
    this._onResize = this._onResize.bind(this);
    this._control = control;

    // setup DOM
    let container = document.createElement('div');
    container.className = classnames('grommet', CLASS_ROOT, {
      [options.className]: options.className,
      [`${BACKGROUND_COLOR_INDEX}-${options.colorIndex}`]: options.colorIndex
    });

    if ( opts.dropContainer ) {
      opts.dropContainer.appendChild(container);
      this.parentContainer = opts.dropContainer;

    } else {
      // prepend in body to avoid browser scroll issues
      document.body.insertBefore(container, document.body.firstChild);
      this.parentContainer = document.body;
    }

    const scrollParents = findScrollParents(control);

    // initialize state
    this.state = {
      container, control, initialFocusNeeded: focusControl, options,
      scrollParents
    };
    this._listen();
  }

  _listen () {
    const { scrollParents } = this.state;
    scrollParents.forEach(scrollParent => {
      scrollParent.addEventListener('scroll', this.place);
    });
    // we intentionally skipped debounce as we believe resizing
    // will not be a common action. Also the UI looks better if the Drop
    // doesn’t lag to align with the control component.
    window.addEventListener('resize', this._onResize);
  }

  _onResize () {
    const { scrollParents } = this.state;
    // we need to update scroll parents as Responsive options may change
    // the parent for the target element
    scrollParents.forEach(scrollParent => {
      scrollParent.removeEventListener('scroll', this.place);
    });

    const nextScrollParents = findScrollParents(this._control);

    nextScrollParents.forEach(scrollParent => {
      scrollParent.addEventListener('scroll', this.place);
    });

    this.state.scrollParents = nextScrollParents;

    this.place();
  }

  place() {
    const {
      control, container, initialFocusNeeded, options: { align, responsive }
    } = this.state;
    const windowWidth = document.body.getBoundingClientRect().width;
    const windowHeight = window.innerHeight;

    // clear prior styling
    container.style.left = '';
    container.style.width = '';
    container.style.top = '';
    container.style.maxHeight = '';

    const containerOY = getComputedStyle(container).overflowY;
    const canContentYScroll = containerOY === 'scroll' || containerOY === 'auto';
    if (canContentYScroll) {
      // Set overflow to scroll for size calculations
      container.style.overflow = 'scroll';
    }

    // get bounds
    const controlRect = findVisibleParent(control).getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // determine width
    const width = Math.min(
      Math.max(controlRect.width, containerRect.width),
      windowWidth
    );

    // set left position
    let left;
    if (align.left) {
      if ('left' === align.left) {
        left = controlRect.left;
      } else if ('right' === align.left) {
        left = controlRect.left - width;
      }
    } else if (align.right) {
      if ('left' === align.right) {
        left = controlRect.left - width;
      } else if ('right' === align.right) {
        left = (controlRect.left + controlRect.width) - width;
      }
    }

    if ((left + width) > windowWidth) {
      left -= ((left + width) - windowWidth);
    } else if (left < 0) {
      left = 0;
    }

    // set top position
    let top, maxHeight;
    if (align.top) {
      if ('top' === align.top) {
        top = controlRect.top;
        maxHeight = Math.min(windowHeight - controlRect.top, windowHeight);
      } else {
        top = controlRect.bottom;
        maxHeight = Math.min(
          windowHeight - controlRect.bottom,
          windowHeight - controlRect.height
        );
      }
    } else if (align.bottom) {
      if ('bottom' === align.bottom) {
        top = controlRect.bottom - containerRect.height;
        maxHeight = Math.max(controlRect.bottom, 0);
      } else {
        top = controlRect.top - containerRect.height;
        maxHeight = Math.max(controlRect.top, 0);
      }
    }

    // if we can't fit it all, see if there's more room the other direction
    if (containerRect.height > maxHeight) {
      // We need more room than we have.
      if (align.top && top > (windowHeight / 2)) {
        // We put it below, but there's more room above, put it above
        if (align.top === 'bottom') {
          if (responsive) {
            top = Math.max(controlRect.top - containerRect.height, 0);
          }
          maxHeight = controlRect.top;
        } else {
          if (responsive) {
            top = Math.max(controlRect.bottom - containerRect.height, 0);
          }
          maxHeight = controlRect.bottom;
        }
      } else if (align.bottom && maxHeight < (windowHeight / 2)) {
        // We put it above but there's more room below, put it below
        if (align.bottom === 'bottom') {
          if (responsive) {
            top = controlRect.top;
          }
          maxHeight = Math.min(windowHeight - top, windowHeight);
        } else {
          if (responsive) {
            top = controlRect.bottom;
          }
          maxHeight = Math.min(
            windowHeight - top,
            windowHeight - controlRect.height
          );
        }
      }
    }

    container.style.left = `${left}px`;
    // offset width by 0.1 to avoid a bug in ie11 that
    // unnecessarily wraps the text if width is the same
    container.style.width = `${width + 0.1}px`;
    // the (position:absolute + scrollTop)
    // is presenting issues with desktop scroll flickering
    container.style.top = `${top}px`;
    container.style.maxHeight = `${windowHeight - (top)}px`;

    // Return default overflow value
    container.style.overflow = '';

    if (initialFocusNeeded) {
      // Now that we've placed it, focus on it
      this._focus();
    }
  }

  _focus() {
    const { container } = this.state;
    this.state.originalFocusedElement = document.activeElement;
    if (! container.contains(document.activeElement)) {
      const anchor = container.querySelector(`${CLASS_ROOT}__anchor`);
      if (anchor) {
        anchor.focus();
        anchor.scrollIntoView();
      }
    }
    delete this.state.initialFocusNeeded;
  }

  render() {
    const { content } = this.props;
    const { container, options: { focusControl } } = this.state;
    const originalScrollPosition = container.scrollTop;
    console.log({renderingPortal: {container, content}});
    return createPortal(<DropContents content={content}
      focusControl={focusControl} afterRender={() => {
        this.place();
        // reset container to its original scroll position
        container.scrollTop = originalScrollPosition;
      }}/>, container);
  }

  componentWillUnmount() {
    const { container, originalFocusedElement, scrollParents } = this.state;
    scrollParents.forEach(scrollParent => {
      scrollParent.removeEventListener('scroll', this.place);
    });
    window.removeEventListener('resize', this._onResize);
    this.parentContainer.removeChild(container);
    // weird bug in Chrome does not remove child if
    // document.body.insertBefore is called in another new drop.
    // the code below will go over remaining drop that was not removed
    [].forEach.call(document.getElementsByClassName(CLASS_ROOT), (element) => {
      if(element.getAttribute('style') === container.getAttribute('style')) {
        document.body.removeChild(element);
      }
    });
    if (originalFocusedElement) {
      originalFocusedElement.focus();
    }
    this.place = function () {};
    this.state = undefined;
  }
}

// How callers can validate a property for drop alignment which will be
// passed to add().
export var dropAlignPropType = PropTypes.shape({
  top: PropTypes.oneOf(VERTICAL_ALIGN_OPTIONS),
  bottom: PropTypes.oneOf(VERTICAL_ALIGN_OPTIONS),
  left: PropTypes.oneOf(HORIZONTAL_ALIGN_OPTIONS),
  right: PropTypes.oneOf(HORIZONTAL_ALIGN_OPTIONS)
});

export default PortalDrop;
