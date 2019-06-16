import {
  all,
  contains,
  curry,
  filter,
  flip,
  prop,
  startsWith,
  length,
  sort,
  either,
  pipe,
  map,
  maxBy,
  max,
  always,
  reduce,
  partial,
  head,
  tap,
  last, propOr, find, propEq, or, defaultTo, invertObj, tail
} from "ramda";
import {Context, ContextWindowMapping, PopUpItem, WindowContextMapping} from "./model";
import {pipeline} from "stream";
import {isNullOrUndefined} from "util";

/**
 * in order for a url to match a rule every condition must be substring of the url
 */
const containsStr = flip(contains);
export const doesUrlMatchRule = (url: string, rule: string[]): boolean => {
  return all(containsStr(url), rule)
}

/**
 * Checks if url matches context by checking if matches any of the rules. Returns the number of conditions that the rule had if it matches
 * or null. If multiple rules match returns the greater number
 */
export const doesUrlMatchContext: (url: string, context: Context) => number | null = (url: string, context: Context) => {
  // @ts-ignore-start
  return pipe(
    filter(partial(doesUrlMatchRule, [url])),
    map(length),
    partial(reduce, [max, null]),
  )(context.rules)
  // @ts-ignore-end
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
  const mapped =  map(windowId => {

    const contextId = prop(windowId, windowContextMapping)
    const context = find(propEq('id', contextId), contexts)
    const withDefault = defaultTo('Unmanaged')

    return {
      windowId: windowId,
      name: withDefault(prop('name',context))
    }
  }, windowFocusOrder)

  return tail(mapped) //drop first element as its the current window

}