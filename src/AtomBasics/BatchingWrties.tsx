// Rund with Bun

import * as Array from "effect/Array";
import { Atom, AtomRegistry } from "effect/unstable/reactivity";

const firstNameAtom = Atom.make("Ada");
const lastNameAtom = Atom.make("Lovelace");

const fullNameAtom = Atom.make(
  (get) => `${get(firstNameAtom)} ${get(lastNameAtom)}`
);

const registry = AtomRegistry.make();
const notifications = Array.empty<string>();

const release = registry.subscribe(
  fullNameAtom,
  (fullName) => notifications.push(fullName),
  {
    immediate: true,
  }
);

// registry.set(firstNameAtom, "Grace");
// registry.set(lastNameAtom, "Hopper");

Atom.batch(() => {
  registry.set(firstNameAtom, "Grace");
  registry.set(lastNameAtom, "Hopper");
});

// in single set setting the same valie in the atom will result in no update
// due to use of Object.is comparation
registry.set(firstNameAtom, "Grace");

// An atom can carry its own equality for that case.
const initialAtoms = Atom.make((get) => ({
  first: get(firstNameAtom).charAt(0),
  last: get(lastNameAtom).charAt(0),
})).pipe(Atom.withEquality((a, b) => a.first === b.first && a.last === b.last));

console.log(notifications);
