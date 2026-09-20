import { useAtomValue } from "@effect/atom-react";
import "./App.css";
import { Atom } from "effect/unstable/reactivity";
import Count from "./Count";
import FreeShippingBadge, { PriceInput } from "./FreeShippingBadge";
import TitleWithDraft from "./Title";

const messageAtom = Atom.make("Effect Atom is ready");

function App() {
  const message = useAtomValue(messageAtom);
  return (
    <div>
      <p>{message}</p>
      <Count />
      <PriceInput />
      <FreeShippingBadge />
      <TitleWithDraft />
    </div>
  );
}

export default App;

/***/
