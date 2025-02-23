import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
 
import { initialNodes } from './nodes';
import { initialEdges } from './edges';
import { type AppState } from './types';
import { generateId } from 'ai';
 
// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  getNode: (id: string) => get().nodes.find((node) => node.id === id),
  getNodes: () => get().nodes,
  getEdges: () => get().edges,
  addPromptNode: (id: string,) => {
    const newId = generateId();
    const newNode = {
      id: newId,
      type: "prompt",
      data: { prompt: "" },
      position: { x: 0, y: 0 },
      parentId: id,
    };
    const newEdge = {
      id: `${id}-${newId}`,
      source: id,
      target: newId,
    };
    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });
  },
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
}));
 
export default useStore;