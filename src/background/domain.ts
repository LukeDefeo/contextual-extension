import {
  all,
  contains,
  defaultTo,
  filter,
  find,
  flip,
  head, isEmpty,
  last,
  length,
  map,
  max, none,
  partial,
  pipe,
  prop,
  propEq,
  reduce,
  reject, tap
} from "ramda";
import {Context, PopUpItem, WindowContextMapping} from "./model";
import {threadLast} from "./thread";

/**
 * in order for a url to match a rule every condition must be substring of the url
 */
const containsStr = flip(contains);

export const doesUrlMatchRule = (url: string, conditions: string[]): boolean => {
  const nonEmptyStringConditions = reject(isEmpty, conditions)
  return !isEmpty(nonEmptyStringConditions) && all(containsStr(url), nonEmptyStringConditions)
}

/**
 * Checks if url matches context by checking if matches any of the rules. Returns the number of conditions that the rule had if it matches
 * or null. If multiple rules match returns the greater number
 */
export const doesUrlMatchContext: (url: string, context: Context) => number | null = (url: string, context: Context) => {
  // @ts-ignore
  return pipe(
    filter(partial(doesUrlMatchRule, [url])),
    map(length),
    partial(reduce, [max, null]),
  )(context.rules)
}

/*
 * looks through all contexts and finds the most specific match (deterimined by the number of conditions)
 * @param url
 * @param contexts
 */
export const contextForUri = (url: string, contexts: Context[]): Context | null => {

  return pipe(
    map((ctx: any) => [doesUrlMatchContext(url, ctx), ctx]),
    filter(([conditionCount, _]) => conditionCount !== null),
    head,
    res => res ? last(res) : null
  )(contexts) as Context | null

}


export const createPopupState = (windowFocusOrder: number[], windowContextMapping: WindowContextMapping, contexts: Context[]): PopUpItem[] => {

  return threadLast(
    windowFocusOrder,
    reject(id => id === -1),
    map((windowId: number) => {

      const contextId = prop(windowId, windowContextMapping)
      const context = find(propEq('id', contextId), contexts)
      const withDefault = defaultTo('Unmanaged')

      return {
        windowId: windowId,
        name: withDefault(prop('name', context)),
        isManaged: context !== undefined
      }
    }),
  )
}