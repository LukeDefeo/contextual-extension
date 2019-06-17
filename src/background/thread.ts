const thread: (operator, first, ...args) => any = (operator, first, ...args) => {
  let isThreadFirst;
  switch (operator) {
    case '->>':
      isThreadFirst = false;
      break
    case '->':
      isThreadFirst = true;
      break;
    default:
      throw new Error('Operator not supported');
      break;
  }
  return args.reduce((prev, next) => {
    if (Array.isArray(next)) {
      const [head, ...tail] = next;
      return isThreadFirst ? head.apply(this, [prev, ...tail]) : head.apply(this, tail.concat(prev));
    } else {
      return next.call(this, prev);
    }
  }, first);
}
export const threadLast: (first, ...args) => any = (first, ...args) => {
  return thread('->>', first, ...args)
}
const threadFirst: (first, ...args) => any = (first, ...args) => {
  return thread('->', first, ...args)
}