import { type Edge, type Node, type OnNodesChange, type OnEdgesChange, type OnConnect } from '@xyflow/react';

export type AppNode = Node;

export type AppState = {
  nodes: AppNode[];
  edges: Edge[];
  addPromptNode: (id: string) => void;
  getNode: (id: string) => AppNode | undefined;
  getNodes: () => AppNode[];
  getEdges: () => Edge[];
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
};