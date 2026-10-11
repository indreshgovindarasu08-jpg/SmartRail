import { QRCheckpoint, StationNode } from '../../types';
import { COIMBATORE_QR_CHECKPOINTS } from '../../data/coimbatoreNavigationGraph';

export interface SpatialAnchorPosition {
  floor: 'L2' | 'G' | 'L1';
  x: number;
  y: number;
  z: number;
  nodeId: string;
  anchorName: string;
  source: 'QR' | 'MANUAL' | 'GPS_GEOFENCE' | 'BLE_BEACON';
  confidence: number;
  calibratedAt: string;
}

export class SpatialAnchorService {
  private static instance: SpatialAnchorService;
  private currentAnchor: SpatialAnchorPosition | null = null;
  private checkpoints: QRCheckpoint[] = COIMBATORE_QR_CHECKPOINTS;

  public static getInstance(): SpatialAnchorService {
    if (!SpatialAnchorService.instance) {
      SpatialAnchorService.instance = new SpatialAnchorService();
    }
    return SpatialAnchorService.instance;
  }

  public getCheckpoints(): QRCheckpoint[] {
    return this.checkpoints;
  }

  public calibrateWithQR(qrCodeText: string): SpatialAnchorPosition | null {
    const cp = this.checkpoints.find(
      (c) => c.code.toLowerCase() === qrCodeText.trim().toLowerCase() || c.id === qrCodeText.trim().toLowerCase()
    );

    if (!cp) return null;

    const anchor: SpatialAnchorPosition = {
      floor: cp.floor,
      x: cp.x,
      y: cp.y,
      z: cp.z,
      nodeId: cp.nodeId,
      anchorName: cp.name,
      source: 'QR',
      confidence: 0.99,
      calibratedAt: new Date().toISOString(),
    };

    this.currentAnchor = anchor;
    return anchor;
  }

  public setManualPosition(node: StationNode): SpatialAnchorPosition {
    const anchor: SpatialAnchorPosition = {
      floor: node.floor,
      x: node.x,
      y: node.y,
      z: node.z,
      nodeId: node.id,
      anchorName: node.name,
      source: 'MANUAL',
      confidence: 0.95,
      calibratedAt: new Date().toISOString(),
    };

    this.currentAnchor = anchor;
    return anchor;
  }

  public getCurrentAnchor(): SpatialAnchorPosition {
    if (!this.currentAnchor) {
      // Default to Entrance Main on Level G
      const defaultCP = this.checkpoints[0];
      return {
        floor: defaultCP.floor,
        x: defaultCP.x,
        y: defaultCP.y,
        z: defaultCP.z,
        nodeId: defaultCP.nodeId,
        anchorName: defaultCP.name,
        source: 'MANUAL',
        confidence: 0.9,
        calibratedAt: new Date().toISOString(),
      };
    }
    return this.currentAnchor;
  }
}

export const spatialAnchorService = SpatialAnchorService.getInstance();
