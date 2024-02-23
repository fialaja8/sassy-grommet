import _compose from 'lodash/fp/compose';

const composeKeepPropTypes = (WrappedComponent,...injectors) => {
  const result = _compose(
    ...injectors
  )(WrappedComponent);
  result.propTypes = WrappedComponent.propTypes;
  return result;
};

export default composeKeepPropTypes;
