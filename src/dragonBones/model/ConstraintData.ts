import { BaseObject } from "../core/BaseObject";
import { ConstraintType, PositionMode, SpacingMode, RotateMode } from "../core/DragonBones";
import { BoneData, SlotData } from "./ArmatureData";
import { PathDisplayData } from "./DisplayData";

/**
 * @private
 */
export abstract class ConstraintData extends BaseObject {
  public order: number;
  public name: string;
  public type: ConstraintType;
  public target: BoneData;
  public root: BoneData;
  public bone: BoneData | null;

  protected _onClear(): void {
    this.order = 0;
    this.name = "";
    this.type = ConstraintType.IK;
    this.target = null as any; //
    this.root = null as any; //
    this.bone = null;
  }
}
/**
 * @internal
 */
export class IKConstraintData extends ConstraintData {
  public static toString(): string {
    return "[class dragonBones.IKConstraintData]";
  }

  public scaleEnabled: boolean;
  public bendPositive: boolean;
  public weight: number;

  protected _onClear(): void {
    super._onClear();

    this.scaleEnabled = false;
    this.bendPositive = false;
    this.weight = 1.0;
  }
}
/**
 * @internal
 */
export class PathConstraintData extends ConstraintData {
  public static toString(): string {
    return "[class dragonBones.PathConstraintData]";
  }

  public pathSlot: SlotData;
  public pathDisplayData: PathDisplayData;
  public bones: Array<BoneData> = [];

  public positionMode: PositionMode;
  public spacingMode: SpacingMode;
  public rotateMode: RotateMode;

  public position: number;
  public spacing: number;
  public rotateOffset: number;
  public rotateMix: number;
  public translateMix: number;

  protected _onClear(): void {
    super._onClear();

    this.pathSlot = null as any;
    this.pathDisplayData = null as any;
    this.bones.length = 0;

    this.positionMode = PositionMode.Fixed;
    this.spacingMode = SpacingMode.Fixed;
    this.rotateMode = RotateMode.Chain;

    this.position = 0.0;
    this.spacing = 0.0;
    this.rotateOffset = 0.0;
    this.rotateMix = 0.0;
    this.translateMix = 0.0;
  }

  public AddBone(value: BoneData): void {
    this.bones.push(value);
  }
}
