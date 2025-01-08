// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import Graph, {graphDefaultProps} from './Graph';
import composeKeepPropTypes from "../../utils/composeKeepPropTypes";
import {injectIntl} from "react-intl";

class Line extends Graph {}

Line.defaultProps = {
  ...graphDefaultProps,
  type: 'line'
};

Line.displayName = 'Line';
export default composeKeepPropTypes(Line, injectIntl);
