// The MIT License (MIT)
//
// node-enumerable (https://github.com/mkloubert/node-enumerable)
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import * as Enumerable from "../";
import * as FS from "fs";

class Person {
  constructor(name: string) {
    this.name = name;
  }

  public name: string;
}

class Pet {
  constructor(name: string, owner: Person) {
    this.name = name;
    this.owner = owner;
  }

  public name: string;
  public owner: Person;
}

let persons = [
  new Person("Tanja"),
  new Person("Marcel"),
  new Person("Yvonne"),
  new Person("Josefine"),
];

let pets = [
  new Pet("Gina", persons[1]),
  new Pet("Schnuffi", persons[1]),
  new Pet("Schnuffel", persons[2]),
  new Pet("WauWau", persons[0]),
  new Pet("Lulu", persons[3]),
  new Pet("Asta", persons[1]),
];

// groupJoin()
//
// [0] 'Owner: Tanja; Pets: WauWau, Sparky'
// [1] 'Owner: Marcel; Pets: Gina, Schnuffi, Asta'
// [2] 'Owner: Yvonne; Pets: Schnuffel'
// [3] 'Owner: Josefine; Pets: Lulu'
let k = Enumerable.from(persons).groupJoin(
  pets,
  (person) => person.name,
  (pet) => pet.owner.name,
  (person, petsOfPerson) => {
    let petList = petsOfPerson.select((pet) => pet.name).joinToString(", ");

    return "Owner: " + person.name + "; Pets: " + petList;
  },
);

// join()
//
// [0] 'Owner: Tanja; Pet: WauWau'
// [1] 'Owner: Marcel; Pet: Gina'
// [2] 'Owner: Marcel; Pet: Schnuffi'
// [3] 'Owner: Marcel; Pet: Asta'
// [4] 'Owner: Yvonne; Pet: Schnuffel'
// [5] 'Owner: Josefine; Pet: Lulu'
let j = Enumerable.from(persons).join(
  pets,
  (person) => person.name,
  (pet) => pet.owner.name,
  (person, pet) => {
    return "Owner: " + person.name + "; Pet: " + pet.name;
  },
);

k.forEach((i) => console.log(i));

let seq = Enumerable.range(0, 10);
for (let chunk of seq.chunk(3)) {
  // [0] => [0, 1, 2]
  // [1] => [3, 4, 5]
  // [2] => [6, 7, 8]
  // [3] => [9]
  const ARR = chunk.toArray();
  if (ARR) {
  }
}
