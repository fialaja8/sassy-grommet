// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import Graph from './Graph';
import composeKeepPropTypes from "../../utils/composeKeepPropTypes";
import {injectIntl} from "react-intl";

class Area extends Graph {}

Area.defaultProps = {
  ...Graph.defaultProps,
  type: 'area'
};

Area.displayName = 'Area';
export default composeKeepPropTypes(Area, injectIntl);
