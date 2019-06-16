
export interface Context {
  id: number,
  name: string,
  rules: string[][]
  //each rule is a list of conditions which is just a part of a url to match against
}