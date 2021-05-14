---
title: Javascript Series - Typing
slug: js-series-typing
createdAt: "2021-05-14"
keywords: javascript, js, typing, frontend, node
---

Hello folks!

I've decided to write a series of posts sharing some javascript concepts that I believe JS developers should be concerned about. The idea is not to extend too much, so I'll try to add some resources at the end of the post if you want to dive into it.

Hope it helps someone, so let's start!

In this post, we're going to talk about **Typing**.

Javascript is a _"weakly typed"_ or even _"untyped"_ language, this means that we don't need to care about specifying types for our variables, functions, etc. Javascript will infer it for us based on the data.

But what if we want to check types before running some logic? We have some options to do it, so let's see them.

## Equality operators (== vs ===)

When we want to compare the equality in our logic, we can use double equals(`==`) or triple equals(`===`).

The simple difference between these operators are that the triple `===` compares **type** and **value**, and the double `==` will perform a _type coercion_, meaning that it will try to convert the values to a common type before comparing it.

Eg.

|             |         |
| ----------- | ------- |
| `1 == "1"`  | `true`  |
| `1 === "1"` | `false` |

### Falsy values

Something we need to be concerned about is that when javascript performs the type coercion for us, there are some values that are considered `false` when it is used in a Boolean context.

E.g.

|               |         |
| ------------- | ------- |
| `0 == false`  | `true`  |
| `0 === false` | `false` |

This is useful because we cant do something like `if (!value)`, but we need to be concerned about what we are doing.

These are the falsy values:

- `false`
- `0`
- `''`
- `null`
- `undefined`
- `NaN`

## Type checking

Now we have talked a little about how typing works, coercion, etc. Let's how we can check this types.
The most common approach is to use `typeof`. This will give us the type of the variable we pass to id.

E.g.

```js
const myNumber = 1;
typeof myNumber; // "number"

const myString = "string";
typeof myString; // "string"

const myArray = [1, 2];
typeof myArray; // "object"
```

### Arrays

You may have noticed that `typeof myArray` gave us and output of `object`. WTF?

As you can see, in Javascript arrays are objects, so whenever we call `typeof` for it, we'll get `object` as type.

So, when we need to check if a given object is an Array, we have a few options:

- use the Array API.
  E.g.
  ```js
  Array.isArray([]); // true
  ```
- use `instanceof`.
  E.g.
  ```js
  [] instanceof Array; // true
  ```
- use `Object.prototype.toString.call()`.
  E.g.
  ```js
  Object.prototype.toString.call([]); // "[object Array]"
  ```

### null, undefined

Another types we should be aware of are `null` and `undefined`. Although they both are falsy, they are not equal, as the name itself says, `null` is a variable with `null` value, `undefined` is a variable which **value** was not defined.

## Further reading

1. [MDN Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
2. [MDN Equality Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality)
3. [MDN Strict Equality Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
4. [MDN typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
5. [MDN instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
6. [Book Eloquent Javascript](https://eloquentjavascript.net/)
