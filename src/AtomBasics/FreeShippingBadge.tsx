import { useAtom, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/unstable/reactivity";

const quantityAtom = Atom.make(1);
const unitPriceAtom = Atom.make(1_250);

// Derived atom
const lineTotalAtom = Atom.make(
  (get) => get(quantityAtom) * get(unitPriceAtom)
);

const taxAtom = Atom.make((get) => Math.round(get(lineTotalAtom) * 0.19));
const grandTotalAtom = Atom.make((get) => get(lineTotalAtom) + get(taxAtom));

const unitPriceDollarsAtom = Atom.writable(
  (get) => get(unitPriceAtom) / 100,
  (context, dollars: number) => {
    context.set(unitPriceAtom, Math.round(dollars * 100));
  }
);

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
  return (
    <div>
      <span>{isFree ? "free shipping" : "Add more"}</span>
    </div>
  );
};

export const PriceInput = () => {
  const [dollars, setDollars] = useAtom(unitPriceDollarsAtom);
  const taxValue = useAtomValue(taxAtom);
  const lineTotal = useAtomValue(lineTotalAtom);
  const grandTotal = useAtomValue(grandTotalAtom);

  return (
    <div>
      <input
        type="number"
        value={dollars}
        onChange={(e) => setDollars(e.target.valueAsNumber)}
      />
      <p>taxAtom: {taxValue}</p>
      <p>lineTotalAtom: {lineTotal}</p>
      <p>grandTotalAtom {grandTotal}</p>
    </div>
  );
};
export default FreeShippingBadge;
