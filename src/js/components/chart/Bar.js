// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import Graph from './Graph';
import composeKeepPropTypes from "../../utils/composeKeepPropTypes";
import {injectIntl} from "react-intl";

class Bar extends Graph {}

Bar.defaultProps = {
  ...Graph.defaultProps,
  type: 'bar'
};

Bar.displayName = 'Bar';
export default composeKeepPropTypes(Bar, injectIntl);
