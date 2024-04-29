import { BaseObject } from "../core/BaseObject";
import { ArmatureData } from "./ArmatureData";
import { UserData } from "./UserData";
import { Map } from "../core/DragonBones";

/**
 * - The DragonBones data.
 * A DragonBones data contains multiple armature data.
 * @see dragonBones.ArmatureData
 * @version DragonBones 3.0
 * @language en_US
 */
export class DragonBonesData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.DragonBonesData]";
  }
  /**
   * @private
   */
  public autoSearch: boolean;
  /**
   * - The animation frame rate.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - 动画帧频。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public frameRate: number;
  /**
   * - The data version.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - 数据版本。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public version: string;
  /**
   * - The DragonBones data name.
   * The name is consistent with the DragonBones project name.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - 龙骨数据名称。
   * 该名称与龙骨项目名保持一致。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public name: string;
  /**
   * @private
   */
  public stage: ArmatureData | null;
  /**
   * @internal
   */
  public readonly frameIndices: Array<number> = [];
  /**
   * @internal
   */
  public readonly cachedFrames: Array<number> = [];
  /**
   * - All armature data names.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - 所有的骨架数据名称。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public readonly armatureNames: Array<string> = [];
  /**
   * @private
   */
  public readonly armatures: Map<ArmatureData> = {};
  /**
   * @internal
   */
  public binary: ArrayBuffer;
  /**
   * @internal
   */
  public intArray: Uint16Array;
  /**
   * @internal
   */
  public floatArray: Float32Array;
  /**
   * @internal
   */
  public frameIntArray: Int16Array;
  /**
   * @internal
   */
  public frameFloatArray: Float32Array;
  /**
   * @internal
   */
  public frameArray: Int16Array;
  /**
   * @internal
   */
  public timelineArray: Uint16Array;
  /**
   * @internal
   */
  public colorArray: Uint16Array;
  /**
   * @private
   */
  public userData: UserData | null = null; // Initial value.

  protected _onClear(): void {
    for (let k in this.armatures) {
      this.armatures[k].returnToPool();
      delete this.armatures[k];
    }

    if (this.userData !== null) {
      this.userData.returnToPool();
    }

    this.autoSearch = false;
    this.frameRate = 0;
    this.version = "";
    this.name = "";
    this.stage = null;
    this.frameIndices.length = 0;
    this.cachedFrames.length = 0;
    this.armatureNames.length = 0;
    //this.armatures.clear();
    this.binary = null as any; //
    this.intArray = null as any; //
    this.floatArray = null as any; //
    this.frameIntArray = null as any; //
    this.frameFloatArray = null as any; //
    this.frameArray = null as any; //
    this.timelineArray = null as any; //
    this.colorArray = null as any; //
    this.userData = null;
  }
  /**
   * @internal
   */
  public addArmature(value: ArmatureData): void {
    if (value.name in this.armatures) {
      console.warn("Same armature: " + value.name);
      return;
    }

    value.parent = this;
    this.armatures[value.name] = value;
    this.armatureNames.push(value.name);
  }
  /**
   * - Get a specific armature data.
   * @param armatureName - The armature data name.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - 获取特定的骨架数据。
   * @param armatureName - 骨架数据名称。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public getArmature(armatureName: string): ArmatureData | null {
    return armatureName in this.armatures ? this.armatures[armatureName] : null;
  }
}
