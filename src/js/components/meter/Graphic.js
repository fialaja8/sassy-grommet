// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Intl from '../../utils/Intl';
import KeyboardAccelerators from '../../utils/KeyboardAccelerators';
import CSSClassnames from '../../utils/CSSClassnames';
import { propTypes, buildPath } from './utils';

const CLASS_ROOT = CSSClassnames.METER;
const COLOR_INDEX = CSSClassnames.COLOR_INDEX;

class Graphic extends Component {

  constructor(props) {
    super(props);
    this.state = this._stateFromProps(props);

    this._onNextBand = this._onNextBand.bind(this);
    this._onPreviousBand = this._onPreviousBand.bind(this);
    this._onGraphicFocus = this._onGraphicFocus.bind(this);
    this._onGraphicBlur = this._onGraphicBlur.bind(this);
    this._onBandClick = this._onBandClick.bind(this);
  }

  componentWillUnmount () {
    if (this._keyboardHandlers) {
      this._onGraphicBlur();
    }
  }

  _onGraphicFocus () {
    this._keyboardHandlers = {
      left: this._onPreviousBand,
      up: this._onPreviousBand,
      right: this._onNextBand,
      down: this._onNextBand,
      enter: this._onBandClick
    };
    KeyboardAccelerators.startListeningToKeyboard(
      this.svgRef, this._keyboardHandlers
    );
  }

  _onGraphicBlur () {
    KeyboardAccelerators.stopListeningToKeyboard(
      this.svgRef, this._keyboardHandlers
    );
    this._keyboardHandlers = undefined;
  }

  _onBandClick () {
    if (this.props.activeIndex !== undefined) {
      const activeBand = this.props.series[this.props.activeIndex];
      if (activeBand && activeBand.onClick) {
        activeBand.onClick();
      }
    }
  }

  // override
  _stateFromProps (props) {
    return {};
  }

  // override
  _sliceCommands (trackIndex, item, startValue) {
    return "";
  }

  _renderSlice (trackIndex, item, itemIndex, startValue, max, track,
    threshold) {
    const { activeIndex, onActivate } = this.props;
    let path;
    if (! item.hidden) {
      const classes = classnames(
        `${CLASS_ROOT}__slice`,
        {
          [`${CLASS_ROOT}__slice--active`]: (itemIndex === activeIndex),
          [`${CLASS_ROOT}__slice--clickable`]: item.onClick,
          [`${COLOR_INDEX}-${item.colorIndex}`]: item.colorIndex
        }
      );

      let commands = this._sliceCommands(trackIndex, item, startValue, max);

      if (threshold) {
        path = buildPath(itemIndex, commands, classes);
      } else if (track) {
        path = buildPath(itemIndex, commands, classes,
          onActivate, item.onClick);
      } else {
        const a11yTitle = `${item.value}`;
        const role = this.props.series.length > 1 ? 'img' : undefined;
        path = buildPath(itemIndex, commands, classes,
          onActivate, item.onClick, a11yTitle, role);
      }
    }

    return path;
  }

  _renderSlices (series, trackIndex, track, threshold) {
    const { min, max } = this.props;
    let startValue = min;

    let paths = series.map((item, itemIndex) => {
      let path = this._renderSlice(trackIndex, item, itemIndex, startValue,
        max, track, threshold);

      startValue += item.value;

      return path;
    });

    return paths;
  }

  _loadingCommands () {
    return this._sliceCommands(0, { value: this.props.max }, this.props.min);
  }

  _onPreviousBand (event) {
    event.preventDefault();
    const activeIndex = (
      this.props.activeIndex !== undefined ? this.props.activeIndex : -1
    );

    if (activeIndex - 1 >= 0) {
      this.props.onActivate(activeIndex - 1);
    }

    //stop event propagation
    return true;
  }

  _onNextBand (event) {
    event.preventDefault();
    const activeIndex = (
      this.props.activeIndex !== undefined ? this.props.activeIndex : -1
    );

    var totalBands = (
      this.meterValuesRef.childNodes.length
    );

    if (activeIndex + 1 < totalBands) {
      this.props.onActivate(activeIndex + 1);
    }

    //stop event propagation
    return true;
  }

  _renderLoading () {
    const classes = classnames(
      `${CLASS_ROOT}__slice`,
      `${CLASS_ROOT}__slice--loading`,
      `${COLOR_INDEX}-loading`
    );
    let commands = this._loadingCommands();
    return [
      <path key="loading" className={classes} d={commands} />
    ];
  }

  _renderValues () {
    const { min, max } = this.props;
    let values;
    if (this.props.stacked) {
      values = this._renderSlices(this.props.series, 0);
    } else {
      values = this.props.series.map((item, index) => {
        return this._renderSlice(index, item, index, min, max);
      });
    }
    if (values.length === 0) {
      values = this._renderLoading();
    }
    return (
      <g ref={ref => this.meterValuesRef = ref}
        className={`${CLASS_ROOT}__values`}>
        {values}
      </g>
    );
  }

  _renderTracks () {
    const { min, max } = this.props;
    const trackValue = { value: max };
    let tracks;
    if (this.props.stacked) {
      tracks =
        this._renderSlice(0, trackValue, 0, min, max, true, false);
    } else {
      tracks = this.props.series.map((item, index) => (
        this._renderSlice(index, trackValue, index, min, max,
          true, false)
      ));
    }
    return (
      <g className={`${CLASS_ROOT}__tracks`}>
        {tracks}
      </g>
    );
  }

  _renderThresholds () {
    let result;
    let thresholds =
      this._renderSlices(this.props.thresholds, -0.4, false, true);
    if (thresholds.length > 0) {
      result = (
        <g className={`${CLASS_ROOT}__thresholds`}>
          {thresholds}
        </g>
      );
    }
    return result;
  }

  _renderTotal () {
    return this.props.series.map((s) => s.value)
      .reduce((prev, curr) => prev + curr, 0);
  }

  _renderTopLayer () {
    return undefined;
  }

  _renderA11YTitle () {
    let a11yTitle = this.props.a11yTitle;
    if (!a11yTitle) {
      let graphicTitle = Intl.getMessage(
        this.props.intl, this.displayName
      );
      let meterTitle = Intl.getMessage(this.props.intl, 'Meter');

      a11yTitle = `${graphicTitle} ${meterTitle}`;
    }

    return `${a11yTitle}. ${this._renderA11YDesc()}`;
  }

  _renderA11YDesc () {
    let a11yDesc = this.props.a11yDesc;
    if (!a11yDesc) {
      let valueLabel = Intl.getMessage(this.props.intl, 'Value');
      a11yDesc = `, ${valueLabel}: ${this._renderTotal()}`;

      if (this.props.min) {
        let minLabel = Intl.getMessage(this.props.intl, 'Min');
        a11yDesc += `, ${minLabel}: ${this.props.min}`;
      }

      if (this.props.max) {
        let maxLabel = Intl.getMessage(this.props.intl, 'Max');
        a11yDesc += `, ${maxLabel}: ${this.props.max}`;
      }

      if (this.props.thresholds) {
        let thresholdLabel = Intl.getMessage(this.props.intl, 'Threshold');
        this.props.thresholds.forEach((threshold) => {
          if (threshold.ariaLabel) {
            a11yDesc += `, ${thresholdLabel}: ${threshold.ariaLabel}`;
          }
        });
      }
    }

    return a11yDesc;
  }

  render () {
    const { series, tabIndex, preserveAspectRatio } = this.props;
    const { viewBoxHeight, viewBoxWidth } = this.state;
    let tracks = this._renderTracks();
    let values = this._renderValues();
    let thresholds = this._renderThresholds();
    let topLayer = this._renderTopLayer();

    let a11yTitle = this._renderA11YTitle();

    const role = series.length > 1 ? 'group' : 'img';

    return (
      <svg className={`${CLASS_ROOT}__graphic`}
        tabIndex={role === 'img' ? undefined : tabIndex || '0'}
        width={viewBoxWidth} role={role}
        height={viewBoxHeight}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio={preserveAspectRatio || "xMidYMid meet"}
        aria-label={a11yTitle} onFocus={this._onGraphicFocus}
        onBlur={this._onGraphicBlur}
        ref={(ref) => this.svgRef = ref}>
        {tracks}
        {thresholds}
        {values}
        {topLayer}
      </svg>
    );
  }
}

Graphic.propTypes = {
  intl: PropTypes.object,
  stacked: PropTypes.bool,
  tabIndex: PropTypes.string,
  thresholds: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    colorIndex: PropTypes.string
  })).isRequired,
  vertical: PropTypes.bool,
  preserveAspectRatio: PropTypes.string,
  ...propTypes
};


Graphic.defaultProps = {
  tabIndex: '0'
};

//NOTE: No HOC, other components extend this one
export default Graphic;
