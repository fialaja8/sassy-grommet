// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Intl from '../utils/Intl';
import CSSClassnames from '../utils/CSSClassnames';

const CLASS_ROOT = CSSClassnames.TABS;

export default class Tabs extends Component {

  constructor(props, context) {
    super(props, context);

    this._activateTab = this._activateTab.bind(this);

    this.state = {
      justify: props.justify
    };
  }

  _activateTab (index) {
    if (this.props.onActive) {
      this.props.onActive(index);
    }
  }

  render () {
    const { children, className, justify, activeIndex, responsive, ...props } = this.props;
    delete props.onActive;
    const { intl } = this.props;
    const classes = classnames(
      CLASS_ROOT,
      {
        [`${CLASS_ROOT}--justify-${justify}`]: justify,
        [`${CLASS_ROOT}--responsive`]: responsive
      },
      className
    );

    let activeContainer;
    let activeTitle;
    const tabs = React.Children.map(children, (tab, index) => {
      if (!tab) return null;

      const tabProps = tab.props || tab._store.props || {};

      const isTabActive = index === activeIndex;

      if (isTabActive) {
        activeContainer = tabProps.children;
        activeTitle = tabProps.title;
      }

      return React.cloneElement(tab, {
        active: isTabActive,
        id: `tab-${index}`,
        onRequestForActive: () => {
          this._activateTab(index);
        }
      });
    }, this);

    const tabContentTitle = Intl.getMessage(intl, 'Tab Contents', {
      activeTitle: activeTitle
    });

    return (
      <div role='tablist'>
        <ul {...props} className={classes}>
          {tabs}
        </ul>
        <div aria-label={tabContentTitle} role='tabpanel'>
          {activeContainer}
        </div>
      </div>
    );
  }
}

Tabs.propTypes = {
  activeIndex: PropTypes.number,
  justify: PropTypes.oneOf(['start', 'center', 'end']),
  responsive: PropTypes.bool,
  onActive: PropTypes.func
};

Tabs.contextTypes = {
  intl: PropTypes.object
};

Tabs.defaultProps = {
  justify: 'center',
  responsive: true
};
