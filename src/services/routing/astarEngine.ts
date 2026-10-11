import {
  StationNavigationGraph,
  StationNode,
  StationEdge,
  RouteProfile,
  NavigationStep,
  ActiveRoute,
  StationPOI,
} from '../../types';

interface AStarNodeRecord {
  nodeId: string;
  gScore: number; // Cost from start
  fScore: number; // Estimated total cost
  parentEdge?: StationEdge;
  parentNodeId?: string;
}

export class AStarRoutingEngine {
  private graph: StationNavigationGraph;
  private nodeMap: Map<string, StationNode>;
  private adjacencyList: Map<string, Array<{ edge: StationEdge; targetId: string }>>;

  constructor(graph: StationNavigationGraph) {
    this.graph = graph;
    this.nodeMap = new Map();
    this.adjacencyList = new Map();

    for (const node of graph.nodes) {
      this.nodeMap.set(node.id, node);
      this.adjacencyList.set(node.id, []);
    }

    for (const edge of graph.edges) {
      // Bi-directional pedestrian movement
      this.adjacencyList.get(edge.from)?.push({ edge, targetId: edge.to });
      this.adjacencyList.get(edge.to)?.push({ edge, targetId: edge.from });
    }
  }

  public findRoute(
    originNodeId: string,
    targetNodeId: string,
    profile: RouteProfile = 'FASTEST'
  ): {
    success: boolean;
    nodes: StationNode[];
    steps: NavigationStep[];
    distanceMeters: number;
    durationMinutes: number;
    stairsCount: number;
    liftsCount: number;
    isAccessible: boolean;
    pathPoints: Array<{ x: number; y: number; z?: number; floor: 'L2' | 'G' | 'L1' }>;
  } | null {
    const startNode = this.nodeMap.get(originNodeId);
    const endNode = this.nodeMap.get(targetNodeId);

    if (!startNode || !endNode) {
      return null;
    }

    const openSet = new Set<string>([originNodeId]);
    const closedSet = new Set<string>();
    const nodeRecords = new Map<string, AStarNodeRecord>();

    nodeRecords.set(originNodeId, {
      nodeId: originNodeId,
      gScore: 0,
      fScore: this.heuristic(startNode, endNode),
    });

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let currentId = '';
      let lowestF = Infinity;

      for (const id of openSet) {
        const rec = nodeRecords.get(id);
        if (rec && rec.fScore < lowestF) {
          lowestF = rec.fScore;
          currentId = id;
        }
      }

      if (!currentId) break;

      if (currentId === targetNodeId) {
        // Path reconstructed
        return this.reconstructPath(nodeRecords, originNodeId, targetNodeId, profile);
      }

      openSet.delete(currentId);
      closedSet.add(currentId);

      const currentNode = this.nodeMap.get(currentId)!;
      const neighbors = this.adjacencyList.get(currentId) || [];

      for (const { edge, targetId } of neighbors) {
        if (closedSet.has(targetId)) continue;

        const neighborNode = this.nodeMap.get(targetId);
        if (!neighborNode) continue;

        // Accessibility checks
        if ((profile === 'ACCESSIBLE' || profile === 'NO_STAIRS') && edge.stairs) {
          continue; // Strictly forbidden
        }
        if (profile === 'ACCESSIBLE' && (!neighborNode.accessible || !edge.accessible)) {
          continue; // Step-free only
        }

        // Calculate edge traversal cost based on profile
        const edgeCost = this.calculateEdgeCost(edge, profile);
        const currentRecord = nodeRecords.get(currentId)!;
        const tentativeG = currentRecord.gScore + edgeCost;

        let neighborRecord = nodeRecords.get(targetId);
        if (!neighborRecord) {
          neighborRecord = {
            nodeId: targetId,
            gScore: Infinity,
            fScore: Infinity,
          };
          nodeRecords.set(targetId, neighborRecord);
        }

        if (tentativeG < neighborRecord.gScore) {
          neighborRecord.parentNodeId = currentId;
          neighborRecord.parentEdge = edge;
          neighborRecord.gScore = tentativeG;
          neighborRecord.fScore = tentativeG + this.heuristic(neighborNode, endNode);
          openSet.add(targetId);
        }
      }
    }

    return null; // No path found under constraints
  }

  private heuristic(a: StationNode, b: StationNode): number {
    // 3D Euclidean distance approximation with floor penalty
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z - b.z) * 5; // Floor transition weight
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private calculateEdgeCost(edge: StationEdge, profile: RouteProfile): number {
    let cost = edge.distance;

    const crowd = edge.crowdFactor ?? 1.0;

    switch (profile) {
      case 'SHORTEST':
        return edge.distance;

      case 'FASTEST':
        // Escalator / lift / stairs vs flat
        cost = edge.distance * (edge.stairs ? 1.4 : edge.lift ? 1.1 : 1.0);
        return cost;

      case 'ACCESSIBLE':
        // Favor lifts & ramps heavily
        if (edge.lift) return edge.distance * 0.8;
        return edge.distance;

      case 'NO_STAIRS':
        if (edge.stairs) return Infinity;
        return edge.distance;

      case 'PREFER_LIFT':
        if (edge.stairs) return edge.distance * 3.0;
        if (edge.lift) return edge.distance * 0.6;
        return edge.distance;

      case 'LOW_CROWD':
        // Penalize crowded corridors heavily
        return edge.distance * Math.pow(crowd, 2);

      default:
        return edge.distance;
    }
  }

  private reconstructPath(
    nodeRecords: Map<string, AStarNodeRecord>,
    startId: string,
    targetId: string,
    profile: RouteProfile
  ) {
    const pathNodes: StationNode[] = [];
    const pathEdges: StationEdge[] = [];
    let currId: string | undefined = targetId;

    while (currId) {
      const node = this.nodeMap.get(currId);
      if (node) pathNodes.unshift(node);

      const record = nodeRecords.get(currId);
      if (record?.parentEdge) {
        pathEdges.unshift(record.parentEdge);
      }
      currId = record?.parentNodeId;
    }

    let totalDist = 0;
    let stairsCount = 0;
    let liftsCount = 0;
    let isAccessible = true;

    for (const edge of pathEdges) {
      totalDist += edge.distance;
      if (edge.stairs) stairsCount++;
      if (edge.lift) liftsCount++;
      if (!edge.accessible) isAccessible = false;
    }

    const durationMinutes = Math.max(1, Math.round(totalDist / 60)); // ~1 m/s walking speed

    // Generate Turn-by-Turn Steps
    const steps: NavigationStep[] = [];
    for (let i = 0; i < pathNodes.length; i++) {
      const node = pathNodes[i];
      const nextNode = pathNodes[i + 1];
      const edge = pathEdges[i];

      if (i === pathNodes.length - 1) {
        steps.push({
          id: `step-${i}`,
          instruction: `Arrive at ${node.name}`,
          distanceMeters: Math.round(pathEdges[i - 1]?.distance || 5),
          icon: 'place',
          floor: node.floor,
          actionType: 'arrive',
          arHint: `Destination reached at Level ${node.floor}`,
        });
      } else if (edge?.lift) {
        steps.push({
          id: `step-${i}`,
          instruction: `Take Glass Elevator from ${node.name} to Level ${nextNode.floor}`,
          distanceMeters: Math.round(edge.distance),
          icon: 'elevator',
          floor: node.floor,
          isElevator: true,
          actionType: 'elevator',
          arHint: `Enter Glass Elevator Bank and select Level ${nextNode.floor}`,
        });
      } else if (edge?.stairs) {
        steps.push({
          id: `step-${i}`,
          instruction: `Use stairs to Level ${nextNode.floor} (${edge.description || 'FOB access'})`,
          distanceMeters: Math.round(edge.distance),
          icon: 'stairs',
          floor: node.floor,
          isStair: true,
          actionType: 'stairs',
          arHint: `Take stairway to Level ${nextNode.floor}`,
        });
      } else {
        const actionType = i === 0 ? 'straight' : i % 2 === 1 ? 'turn_right' : 'turn_left';
        steps.push({
          id: `step-${i}`,
          instruction:
            i === 0
              ? `Proceed from ${node.name} towards ${nextNode.name}`
              : `Continue along corridor towards ${nextNode.name}`,
          distanceMeters: Math.round(edge?.distance || 15),
          icon: actionType === 'turn_right' ? 'turn_right' : actionType === 'turn_left' ? 'turn_left' : 'straight',
          floor: node.floor,
          actionType,
          arHint: `Follow tactile guiding path on Level ${node.floor}`,
        });
      }
    }

    const pathPoints = pathNodes.map((n) => ({
      x: n.x,
      y: n.y,
      z: n.z,
      floor: n.floor,
    }));

    return {
      success: true,
      nodes: pathNodes,
      steps,
      distanceMeters: Math.round(totalDist),
      durationMinutes,
      stairsCount,
      liftsCount,
      isAccessible,
      pathPoints,
    };
  }

  // Find nearest node by POI or coords
  public findClosestNode(x: number, y: number, floor: 'L2' | 'G' | 'L1'): StationNode | null {
    let closest: StationNode | null = null;
    let minDist = Infinity;

    for (const node of this.graph.nodes) {
      if (node.floor !== floor) continue;
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }

    return closest;
  }

  public findNodeByPoiId(poiId: string): StationNode | null {
    return this.graph.nodes.find((n) => n.poiId === poiId) || null;
  }

  public findNodeByQrCode(qrCode: string): StationNode | null {
    return this.graph.nodes.find((n) => n.qrCode === qrCode) || null;
  }
}
