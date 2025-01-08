import _compose from 'lodash/fp/compose';

const composeKeepPropTypes = (WrappedComponent,...injectors) => {
  const result = _compose(
    ...injectors
  )(WrappedComponent);
  result.propTypes = WrappedComponent.propTypes;
  result.displayName = WrappedComponent.displayName;
  // NOTE: defaultProps shall not be copied, as function components cannot have defaultProps
  return result;
};

export default composeKeepPropTypes;
