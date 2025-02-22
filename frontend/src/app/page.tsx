"use client";

import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import TextInput from "./components/text-input";
import Chat from "./components/chat";

export default function HomePage() {
  return (
    <>
      <ReactFlowProvider>
        <Chat></Chat>
        <TextInput></TextInput>

        {/* <ReactFlow /> */}
      </ReactFlowProvider>
    </>
  );
}
