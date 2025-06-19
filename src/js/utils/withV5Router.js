/*
 * Copyright (c) 2025 DXC Technology. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  useLocation,
  useNavigate,
  useBlocker,
  createPath,
  useParams,
  useHref
} from 'react-router-dom';
import _startsWith from 'lodash/startsWith';
import _endsWith from 'lodash/endsWith';
import mapProps from './mapProps';

const sharedBlockers = [];

export function useMasterBlocker(autoReset) {
  const blocker = useBlocker(() => {
    const blockResult = !sharedBlockers.every(bf => bf());
    if (blockResult && autoReset) {
      setTimeout(() => {
        if (blocker?.state === 'blocked') {
          blocker.reset?.();
        }
      },1000);
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

  return {
    push: navigate,
    go: navigate,
    replace: (p) => navigate(p, {replace: true}),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    listen: (newListenerFunction) => {
      setListenerFunction({run: newListenerFunction});
      return () => {
        setListenerFunction(null);
      };
    },
    createHref: pathObj => pathObj && createPath({...pathObj,
      pathname: _startsWith(pathObj.pathname, '/') ?
        `${basename}${pathObj.pathname.substring(_endsWith(basename,'/')?1: 0)}`
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
    location
  };
}

export const withMasterBlocker = (autoReset) => mapProps((props) => ({...props, blocker: useMasterBlocker(autoReset)}));
const withV5Router = mapProps((props) => ({...props, history: useHistory(), location: useLocation(), match: {params: useParams()}}));

export default withV5Router;
