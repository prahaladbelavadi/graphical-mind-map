import { useEffect, useRef } from "react";
import { useReactFlow, type Node, type Edge } from "@xyflow/react";
import { stratify, tree } from "d3-hierarchy";
import { timer } from "d3-timer";
import useAppStore from "@/store/node-store";
import { type AppState } from "@/store/types";
// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree<Node>()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([300, 300])
  // this is needed for creating equal space between all nodes
  .separation(() => 1.05);

const options = { duration: 300 };

// the layouting function
// accepts current nodes and edges and returns the layouted nodes with their updated positions
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  // if there are no nodes we can't calculate a layout
  if (nodes.length === 0) {
    return [];
  }
  // convert nodes and edges into a hierarchical object for using it with the layout function
  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // get the id of each node by searching through the edges
    // this only works if every node has one connection
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
    nodes,
  );

  // run the layout algorithm with the hierarchy data structure
  const root = layout(hierarchy);

  // convert the hierarchy back to react flow nodes (the original node is stored as d.data)
  // we only extract the position from the d3 function
  return root
    .descendants()
    .map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

function useLayout() {
  // this ref is used to fit the nodes in the first run
  // after first run, this is set to false
  const initial = useRef(true);

  // we are using nodeCount as the trigger for the re-layouting
  // whenever the nodes length changes, we calculate the new layout

  const { fitView } = useReactFlow();
  const { setNodes, setEdges, getNode, getNodes, getEdges } = useAppStore();
  const nodeCountSelector = (state: AppState) => state.nodes.length;
  const nodeCount = useAppStore(nodeCountSelector);

  useEffect(() => {
    // get the current nodes and edges
    const nodes = getNodes();
    const edges = getEdges();

    // run the layout and get back the nodes with their updated positions
    const targetNodes = layoutNodes(nodes, edges);

    // if you do not want to animate the nodes, you can uncomment the following line
    // return setNodes(targetNodes);

    // to interpolate and animate the new positions, we create objects that contain the current and target position of each node
    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        // this is where the node currently is placed
        from: getNode(node.id)?.position ?? node.position,
        // this is where we want the node to be placed
        to: node.position,
        node,
      };
    });

    // create a timer to animate the nodes to their new positions
    const t = timer((elapsed: number) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          ...node,
          position: {
            // simple linear interpolation
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
        };
      });

      setNodes(currNodes);

      // this is the final step of the animation
      if (elapsed > options.duration) {
        // we are moving the nodes to their destination
        // this needs to happen to avoid glitches
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            ...node,
            position: {
              x: to.x,
              y: to.y,
            },
          };
        });

        setNodes(finalNodes);

        // stop the animation
        t.stop();

        // in the first run, fit the view
        if (!initial.current) {
          void fitView({ duration: 200, padding: 0.2 });
        }
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [nodeCount, getNodes, getEdges, getNode, setNodes, fitView, setEdges]);
}

export default useLayout;
