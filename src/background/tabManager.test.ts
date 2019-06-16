import {assoc, assocPath, contains, evolve, update} from "ramda";
import {contextForUri, doesUrlMatchContext, doesUrlMatchRule} from "./tabManager";

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
  expect(contextForUri(url,contexts)).toEqual(matchingOne)
})