import { Lens } from 'monocle-ts'
import {nth} from "ramda";
type Person = {
  name: string;
  age: number;
  accounts: Array<Account>;
};

type Account = {
  type: string;
  handle: string;
  foad: string;
}

let modify: (s: Person) => Person = Lens.fromProp<Person>()('name').modify( (x) => {
  return x
});


interface Props<T> {
  data: Account
  lens: Lens<T, Account>
  update: (T) => T
}

const saccountsLens = Lens.fromPath<Person>()(['accounts'])
const accountsLens = Lens.fromProp<Person>()('accounts').asOptional().compose(nth(1))

const component = <T>({lens, data, update} : Props<T>) => {
  const  x:  Lens<T, string> =lens.composeLens(Lens.fromProp<Account>()('handle'))

  update(x.modify( x => `${x} foo`))

}