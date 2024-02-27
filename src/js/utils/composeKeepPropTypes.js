import _compose from 'lodash/fp/compose';

const composeKeepPropTypes = (WrappedComponent,...injectors) => {
  const result = _compose(
    ...injectors
  )(WrappedComponent);
  result.propTypes = WrappedComponent.propTypes;
  result.defaultProps = WrappedComponent.defaultProps;
  result.displayName = WrappedComponent.displayName;
  return result;
};

export default composeKeepPropTypes;
