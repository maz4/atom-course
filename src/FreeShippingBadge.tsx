import { useAtomValue } from "@effect/atom-react";
import "./App.css";
import { Atom } from "effect/unstable/reactivity";

const quantityAtom = Atom.make(1);
const unitPriceAtom = Atom.make(1_250);

// Derived atom
const lineTotalAtom = Atom.make(
  (get) => get(quantityAtom) * get(unitPriceAtom)
);

const taxAtom = Atom.make((get) => Math.round(get(lineTotalAtom) * 0.19));
const grandTotalAtom = Atom.make((get) => get(lineTotalAtom) + get(taxAtom));

Atom.make((registry) => {
  const lineTotal = registry.get(lineTotalAtom);
  registry.set(quantityAtom, 3);
  registry.get(lineTotalAtom);
});

// this is stable fucntion for the useAtomValue
// without it the ifFree would be refreshed on every render
const isFreeShipping = (total: number) => total >= 5_000;
const FreeShippingBadge = () => {
  // const isFree = useAtomValue(grandTotalAtom, (total) => total >= 5_000);
  const isFree = useAtomValue(grandTotalAtom, isFreeShipping);
  return <span>{isFree ? "free shipping" : "Add more"}</span>;
};

export default FreeShippingBadge;
