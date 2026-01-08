import React from "react";
import _ from "lodash";
import { usePrevious } from "./useEffectDebugger";

const useSmartRef = (dependencies, dependencyNames = []) => {
  const trackRef = React.useRef({});
  const simplifiedRef = React.useRef({});
  const previousDeps = usePrevious(dependencies, [], true);

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (!_.isEqual(dependency, previousDeps[index])) {
      const keyName = dependencyNames[index] || index;

      trackRef.current[keyName] = {
        before: previousDeps[index],
        after: dependency,
      };

      simplifiedRef.current[keyName] = dependency;

      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
        },
      };
    }

    return accum;
  }, {});

  return {
    simplifiedRef: simplifiedRef.current,
    trackRef: trackRef.current,
    changedDeps,
    previousDeps,
  };
};

export default useSmartRef;
