// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import Graph from './Graph';
import composeKeepPropTypes from "../../utils/composeKeepPropTypes";
import {injectIntl} from "react-intl";

class Line extends Graph {}

Line.defaultProps = {
  ...Graph.defaultProps,
  type: 'line'
};

Line.displayName = 'Line';
export default composeKeepPropTypes(Line, injectIntl);
