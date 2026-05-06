/*
 * Copyright (c) 2022 DXC Technology. All rights reserved.
 */

export const fWhile = (startValue, conditionFc, modifyFc, evalFc, defaultResult, maxLoops = 50000) => {
  let testedValue = startValue;
  let result = defaultResult;
  let i = 1;
  while (i < maxLoops && conditionFc(testedValue)) {
    let shouldBreak = false;
    result = evalFc(
      testedValue,
      (a) => {
        shouldBreak = true;
        return a;
      },
      result
    );
    if (shouldBreak) {
      break;
    }
    testedValue = modifyFc(testedValue);
    i++;
  }
  return result;
};
