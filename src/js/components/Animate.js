// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { TransitionGroup } from 'react-transition-group';
import classnames from 'classnames';
import CSSClassnames from '../utils/CSSClassnames';
import { findScrollParents } from '../utils/DOM';

const CLASS_ROOT = CSSClassnames.ANIMATE;

class AnimateChild extends Component {

  constructor(props) {
    super(props);
    this.state = {
      state: 'inactive'
    };
  }

  static getDerivedStateFromProps(nextProps) {
    // leave will reuse enter if leave is not defined
    const { enter, leave } = nextProps;
    return {
      enter: enter,
      leave: leave || enter
    };
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.visible !== this.props.visible) {
      const [ nextState, lastState ] = this.props.visible ?
        [ 'enter', 'active' ] : [ 'leave', 'inactive' ];
      this._delay(nextState, this._done.bind(this, lastState));
    }
  }

  componentWillUnmount () {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  componentWillAppear (callback) {
    if (true === this.props.visible) {
      this._delay('enter', callback);
    }
  }

  componentWillEnter (callback) {
    if (true === this.props.visible) {
      this._delay('enter', callback);
    }
  }

  componentDidAppear () {
    this._done('active');
  }

  componentDidEnter () {
    this._done('active');
  }

  componentWillLeave (callback) {
    this._delay('leave', callback);
  }

  componentDidLeave (callback) {
    this._done('inactive');
  }

  _delay (state, callback) {
    const { delay } = this.state[state];
    // ensure we start out inactive in case we aren't being kept in the DOM
    if ('enter' === state) {
      this.setState({ state: 'inactive '});
    }
    clearTimeout(this._timer);
    this._timer = setTimeout(this._start.bind(this, state, callback),
      delay || 1);
  }

  _start (state, callback) {
    const { duration } = this.state[state];
    this.setState({ state });
    this._timer = setTimeout(callback, duration);
  }

  _done (state) {
    this.setState({ state });
  }

  render () {
    const { children } = this.props;
    const { enter, leave, state } = this.state;
    const animation = (this.state[state] || this.state.enter).animation;
    const className = classnames(
      `${CLASS_ROOT}__child`,
      `${CLASS_ROOT}__child--${animation}`,
      `${CLASS_ROOT}__child--${state}`
    );
    const duration = ('enter' === state || 'inactive' === state) ?
      enter.duration : leave.duration;
    const style = { transitionDuration: `${duration || 0}ms` };
    return <div className={className} style={style}>{children}</div>;
  }
}

AnimateChild.propTypes = {
  enter: PropTypes.shape({
    animation: PropTypes.string,
    duration: PropTypes.number,
    delay: PropTypes.number
  }).isRequired,
  leave: PropTypes.shape({
    animation: PropTypes.string,
    duration: PropTypes.number,
    delay: PropTypes.number
  }),
  visible: PropTypes.bool
};

AnimateChild.defaultProps = {
  visible: false
};

export default class Animate extends Component {

  constructor(props) {
    super(props);
    this._checkScroll = this._checkScroll.bind(this);
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      visible: true === nextProps.visible
    };
  }

  componentDidMount () {
    if ('scroll' === this.props.visible) {
      this._listenForScroll();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (prevProps.visible !== visible) {
      if ('scroll' === prevProps.visible) {
        this._unlistenForScroll();
      } else if ('scroll' === visible) {
        this._listenForScroll();
      }
    }
  }

  componentWillUnmount () {
    if ('scroll' === this.props.visible) {
      this._unlistenForScroll();
    }
  }

  _listenForScroll () {
    // add a timeout so that the findScrollParents function
    // get the right container sizes
    setTimeout(() => {
      const scrollParents = findScrollParents(findDOMNode(this.animateRef));
      if (scrollParents.indexOf(document) === -1) {
        document.addEventListener('scroll', this._checkScroll);
      }
      scrollParents.forEach((scrollParent) => {
        scrollParent.addEventListener('scroll', this._checkScroll);
      }, this);
    }, 0);
  }

  _unlistenForScroll () {
    const scrollParents = findScrollParents(findDOMNode(this.animateRef));
    if (scrollParents.indexOf(document) === -1) {
      document.removeEventListener('scroll', this._checkScroll);
    }
    scrollParents.forEach((scrollParent) => {
      scrollParent.removeEventListener('scroll', this._checkScroll);
    }, this);
  }

  _checkScroll () {
    const { onAppear, onLeave } = this.props;
    const group = findDOMNode(this.animateRef);
    const rect = group.getBoundingClientRect();

    if (rect.top < window.innerHeight) {
      this.setState({ visible: true }, () => {
        if (onAppear) {
          onAppear();
        }
      });
    } else {
      this.setState({ visible: false }, () => {
        if (onLeave) {
          onLeave();
        }
      });
    }
  }

  render () {
    const {
      enter, leave, className, children, component, keep, ...props
    } = this.props;
    delete props.onAppear;
    delete props.onLeave;
    delete props.visible;
    const { visible } = this.state;

    const classes = classnames( CLASS_ROOT, className );

    let animateChildren;
    if (keep || visible) {
      animateChildren = React.Children.map(children, (child, index) => (
        <AnimateChild key={index} enter={enter} leave={leave}
          visible={visible}>
          {child}
        </AnimateChild>
      ));
    }

    return (
      <TransitionGroup
        {...props}
        className={classes}
        component={component}
        ref={ref => this.animateRef = ref}
      >
        {animateChildren}
      </TransitionGroup>
    );
  }
}

const ANIMATIONS =
  ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'jiggle'];

Animate.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  enter: PropTypes.shape({
    animation: PropTypes.oneOf(ANIMATIONS).isRequired,
    duration: PropTypes.number,
    delay: PropTypes.number
  }).isRequired,
  keep: PropTypes.bool,
  leave: PropTypes.shape({
    animation: PropTypes.oneOf(ANIMATIONS).isRequired,
    duration: PropTypes.number,
    delay: PropTypes.number
  }),
  onAppear: PropTypes.func,
  onLeave: PropTypes.func,
  visible: PropTypes.oneOfType([
    PropTypes.oneOf(['scroll']),
    PropTypes.bool
  ])
};

Animate.defaultProps = {
  component: 'div',
  enter: { animation: 'fade', duration: 300 },
  visible: true
};
