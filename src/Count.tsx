import { useAtomSet, useAtomValue } from "@effect/atom-react";
import "./App.css";
import { Atom } from "effect/unstable/reactivity";
import React from "react";

const countAtom = Atom.make(0);

const CountDisplay = () => {
  const renderRef = React.useRef(0);
  renderRef.current++;
  const count = useAtomValue(countAtom);
  return (
    <p>
      {count} (render {renderRef.current})
    </p>
  );
};

const Write = (props: { type: "inc" | "dec" }) => {
  const renderRef = React.useRef(0);
  renderRef.current++;
  console.log("Write", renderRef.current);
  const setCount = useAtomSet(countAtom);

  return (
    <button
      type="button"
      onClick={() =>
        setCount((prev) => (props.type === "inc" ? prev + 1 : prev - 1))
      }
    >
      {props.type === "dec" ? "-" : "+"}
    </button>
  );
};

const Count = () => {
  return (
    <div>
      <Write type="dec" />
      <CountDisplay />
      <Write type="inc" />
    </div>
  );
};

export default Count;
