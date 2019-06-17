import {assoc, assocPath, contains, evolve, update} from "ramda";
import {contextForUri, createPopupState, doesUrlMatchContext, doesUrlMatchRule} from "./domain";

test('doesUrlMatchRule works with single condition matching', () => {
  const url = "http://bbc.co.uk/news"
  const rule = ["bbc.co.uk"]
  expect(doesUrlMatchRule(url, rule)).toBeTruthy();
});

test('doesUrlMatchRule works with two conditions match', () => {
  const url = "http://bbc.co.uk/news"
  const rule = ["bbc.co.uk", "news"]
  expect(doesUrlMatchRule(url, rule)).toBeTruthy();
});

//what about ordering of conditions?

test('doesUrlMatchRule works with one condition matching and one not', () => {
  const url = "http://bbc.co.uk/news"
  const rule = ["bbc.co.uk", "neNOTws"]
  expect(doesUrlMatchRule(url, rule)).toBeFalsy();
});


test("doesUrlMatchContext with matching context returns rule number with more contexts", () => {
  const ctx = {
    id: 1,
    name: 'foo',
    rules: [
      ["bbc.co.uk", "news"],
      ["bbc.co.uk"]
    ]
  }

  const url = "http://bbc.co.uk/news"


  expect(doesUrlMatchContext(url, ctx)).toEqual(2)
})


test("doesUrlMatchContext with non matching context returns null", () => {
  const ctx = {
    id: 1,
    name: 'foo',
    rules: [
      ["bbc.co.uk", "news"],
      ["bbc.co.uk"]
    ]
  }

  const url = "http://bblabc.co.uk/news"


  expect(doesUrlMatchContext(url, ctx)).toEqual(null)
})


test("contextForUri returns context which matches", () => {
  const url = "http://bbc.co.uk/news"

  let matchingOne = {
    id: 1,
    name: 'foo',
    rules: [
      ["bbc.co.uk", "news"],
      ["bbc.co.uk"]
    ]
  };
  const contexts = [{
    id: 2,
    name: 'bar',
    rules: [
      ["other", "news"],
      ["bla"]
    ]
  }, matchingOne]
  expect(contextForUri(url, contexts)).toEqual(matchingOne)
})


test("returns null when no contexts match", () => {
  const url = "not.com"

  const ctxs = [
    {
      "id": 12312,
      "name": "News2",
      "rules": [
        ["bbc.co.uk/sport", "sport", "sport"],
        ["facebook.com", "messages"]]
    },
    {
      "id": 552,
      "name": "monitoring",
      "rules": [["new-relic"], ["stack driver"]]
    }]
  expect(contextForUri(url, ctxs)).toEqual(null)
})


test('popup state', () => {

  const orderedWindowId = [1, 3, -1] //-1 is dropped
  const windowContextMapping = {
    1: 100,
  }

  const contexts = [{
    id: 100,
    name: "Name",
    rules: []
  }]
  const state = createPopupState(orderedWindowId, windowContextMapping, contexts)

  expect(state).toEqual([{
    windowId: 1,
    name: "Name"
  }, {
    windowId: 3,
    name: "Unmanaged"
  }])


})

