import { useState } from "react";

export default function TextInput() {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    console.log("Submitted:", inputValue);
    // send input to service or api

    setInputValue(""); // Clear the input after submission
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter text..."
        className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={handleKeyDown}
      />
      <button
        className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
