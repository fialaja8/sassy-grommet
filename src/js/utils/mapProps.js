/*
 * Copyright (c) 2022 DXC Technology. All rights reserved.
 */

import React from 'react';

const mapPropsInner = (transformFc, WrappedComponent, props) => <WrappedComponent {...{ ...transformFc(props) }} />;
const mapProps = (transformFc) => (WrappedComponent) => (props) => mapPropsInner(transformFc, WrappedComponent, props);
export default mapProps;
