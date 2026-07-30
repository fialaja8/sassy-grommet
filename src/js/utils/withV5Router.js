/*
 * Copyright (c) 2025 DXC Technology. All rights reserved.
 */

import {useState, useEffect} from 'react';
import {
  useLocation,
  useNavigate,
  useBlocker,
  createPath,
  useParams,
  useHref
} from 'react-router';
import _startsWith from 'lodash/startsWith';
import _endsWith from 'lodash/endsWith';
import mapProps from './mapProps';

const sharedBlockers = [];

// NOTE: Since react-router 7, changes to location are not immediate.
// We use data from window.location to get the latest/actual location to get closer to V5 behavior.
// https://github.com/remix-run/react-router/issues/12552
const sharedLocation = {};

export function useMasterBlocker(autoReset) {
  const blocker = useBlocker(() => {
    const blockResult = !sharedBlockers.every(bf => bf());
    if (blockResult && autoReset) {
      setTimeout(() => {
        if (blocker?.state === 'blocked') {
          blocker.reset?.();
        }
      }, 1000);
    }
    return blockResult;
  });
  useEffect(() => {
    return () => {
      if (blocker?.state === 'blocked') {
        blocker.reset?.();
      }
    };
  }, [blocker]);
  return blocker;
}

const updateLocation = (location = {}, basename = '/', reactRouterLocation) => {
  if (reactRouterLocation?.key && location.key === reactRouterLocation.key) {
    return location;
  }
  const wl = window?.location;
  if (wl) {
    location.pathname = (wl.pathname || '/').substring(basename.length - 1) || '/';
    location.search = wl.search;
    location.hash = wl.hash;
  } else if (reactRouterLocation) {
    location.pathname = reactRouterLocation.pathname;
    location.search = reactRouterLocation.search;
    location.hash = reactRouterLocation.hash;
  }
  if (reactRouterLocation) {
    Object.keys(reactRouterLocation).forEach(lc => {
      if (lc !== 'pathname' && lc !== 'search' && lc !== 'hash') {
        location[lc] = reactRouterLocation[lc];
      }
    });
  }
  return location;
};

export function useHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const basename = useHref('/');
  const [listenerFunction, setListenerFunction] = useState(null);

  useEffect(() => {
    if (listenerFunction && location) {
      listenerFunction.run(location, 'PUSH');
    }
  }, [location]);

  updateLocation(sharedLocation, basename, location);

  const navigateAndUpdateLocation = (...nParams) => {
    const r = navigate(...nParams);
    updateLocation(sharedLocation, basename, null);
    return r;
  };

  return {
    push: navigateAndUpdateLocation,
    go: navigateAndUpdateLocation,
    replace: (p) => navigateAndUpdateLocation(p, {replace: true}),
    goBack: () => navigateAndUpdateLocation(-1),
    goForward: () => navigateAndUpdateLocation(1),
    listen: (newListenerFunction) => {
      setListenerFunction({run: newListenerFunction});
      return () => {
        setListenerFunction(null);
      };
    },
    createHref: pathObj => pathObj && createPath({
      ...pathObj,
      pathname: _startsWith(pathObj.pathname, '/') ?
        `${basename}${pathObj.pathname.substring(_endsWith(basename, '/') ? 1 : 0)}`
        : pathObj.pathname
    }),
    // NOTE: For the blocker to work, useMasterBlocker() needs to be used somewhere in the app
    block: (newBlockerFunction) => {
      sharedBlockers.push(newBlockerFunction);
      return () => {
        sharedBlockers.splice(sharedBlockers.findIndex(a => a === newBlockerFunction), 1);
      };
    },
    length: window?.history?.length,
    location: sharedLocation
  };
}

export const withMasterBlocker = (autoReset) => mapProps((props) => ({
  ...props,
  blocker: useMasterBlocker(autoReset)
}));
const withV5Router = mapProps((props) => {
  const history = useHistory();
  return ({
    ...props,
    history,
    location: history.location,
    match: {params: useParams()}
  });
});

export default withV5Router;
