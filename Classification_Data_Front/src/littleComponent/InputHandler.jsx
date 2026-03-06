import { useState } from "react";
export function Inputhandler() {
  const [input, setInput] = useState("");
  const handlechange = (e) => {
    setInput(e.target.value);
  };

  return [input, setInput, handlechange];
}
