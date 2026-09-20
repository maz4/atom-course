import { useAtomSet, useAtomValue } from "@effect/atom-react";
import "./App.css";
import { Atom } from "effect/unstable/reactivity";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import Count from "./Count";
import FreeShippingBadge from "./FreeShippingBadge";

const messageAtom = Atom.make("Effect Atom is ready");

function App() {
  const message = useAtomValue(messageAtom);
  return (
    <div>
      <p>{message}</p>
      <Count />
      <FreeShippingBadge />
    </div>
  );
}

export default App;
/***/
