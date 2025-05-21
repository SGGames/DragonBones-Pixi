import { BaseObject } from "../core/BaseObject";
import { ArmatureType, BoneType, BlendMode, Map } from "../core/DragonBones";
import { ColorTransform } from "../geom/ColorTransform";
import { Matrix } from "../geom/Matrix";
import { Rectangle } from "../geom/Rectangle";
import { Transform } from "../geom/Transform";
import { AnimationData } from "./AnimationData";
import { CanvasData } from "./CanvasData";
import { ConstraintData } from "./ConstraintData";
import { MeshDisplayData, GeometryData } from "./DisplayData";
import { DragonBonesData } from "./DragonBonesData";
import { SkinData } from "./SkinData";
import { ActionData, UserData } from "./UserData";

/**
 * - The armature data.
 * @version DragonBones 3.0
 * @language en_US
 */
export class ArmatureData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.ArmatureData]";
  }
  /**
   * @private
   */
  public type: ArmatureType;
  /**
   * - The animation frame rate.
   * @version DragonBones 3.0
   * @language en_US
   */
  public frameRate: number;
  /**
   * @private
   */
  public cacheFrameRate: number;
  /**
   * @private
   */
  public scale: number;
  /**
   * - The armature name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public name: string;
  /**
   * @private
   */
  public readonly aabb: Rectangle = new Rectangle();
  /**
   * - The names of all the animation data.
   * @version DragonBones 3.0
   * @language en_US
   */
  public readonly animationNames: Array<string> = [];
  /**
   * @private
   */
  public readonly sortedBones: Array<BoneData> = [];
  /**
   * @private
   */
  public readonly sortedSlots: Array<SlotData> = [];
  /**
   * @private
   */
  public readonly defaultActions: Array<ActionData> = [];
  /**
   * @private
   */
  public readonly actions: Array<ActionData> = [];
  /**
   * @private
   */
  public readonly bones: Map<BoneData> = {};
  /**
   * @private
   */
  public readonly slots: Map<SlotData> = {};
  /**
   * @private
   */
  public readonly constraints: Map<ConstraintData> = {};
  /**
   * @private
   */
  public readonly skins: Map<SkinData> = {};
  /**
   * @private
   */
  public readonly animations: Map<AnimationData> = {};
  /**
   * - The default skin data.
   * @version DragonBones 4.5
   * @language en_US
   */
  public defaultSkin: SkinData | null;
  /**
   * - The default animation data.
   * @version DragonBones 4.5
   * @language en_US
   */
  public defaultAnimation: AnimationData | null;
  /**
   * @private
   */
  public canvas: CanvasData | null = null; // Initial value.
  /**
   * @private
   */
  public userData: UserData | null = null; // Initial value.
  /**
   * @private
   */
  public parent: DragonBonesData;

  protected _onClear(): void {
    for (const action of this.defaultActions) {
      action.returnToPool();
    }

    for (const action of this.actions) {
      action.returnToPool();
    }

    for (let k in this.bones) {
      this.bones[k].returnToPool();
      delete this.bones[k];
    }

    for (let k in this.slots) {
      this.slots[k].returnToPool();
      delete this.slots[k];
    }

    for (let k in this.constraints) {
      this.constraints[k].returnToPool();
      delete this.constraints[k];
    }

    for (let k in this.skins) {
      this.skins[k].returnToPool();
      delete this.skins[k];
    }

    for (let k in this.animations) {
      this.animations[k].returnToPool();
      delete this.animations[k];
    }

    if (this.canvas !== null) {
      this.canvas.returnToPool();
    }

    if (this.userData !== null) {
      this.userData.returnToPool();
    }

    this.type = ArmatureType.Armature;
    this.frameRate = 0;
    this.cacheFrameRate = 0;
    this.scale = 1.0;
    this.name = "";
    this.aabb.clear();
    this.animationNames.length = 0;
    this.sortedBones.length = 0;
    this.sortedSlots.length = 0;
    this.defaultActions.length = 0;
    this.actions.length = 0;
    // this.bones.clear();
    // this.slots.clear();
    // this.constraints.clear();
    // this.skins.clear();
    // this.animations.clear();
    this.defaultSkin = null;
    this.defaultAnimation = null;
    this.canvas = null;
    this.userData = null;
    this.parent = null as any; //
  }
  /**
   * @internal
   */
  public sortBones(): void {
    const total = this.sortedBones.length;
    if (total <= 0) {
      return;
    }

    const sortHelper = this.sortedBones.concat();
    let index = 0;
    let count = 0;
    this.sortedBones.length = 0;
    while (count < total) {
      const bone = sortHelper[index++];
      if (index >= total) {
        index = 0;
      }

      if (this.sortedBones.indexOf(bone) >= 0) {
        continue;
      }

      let flag = false;
      for (let k in this.constraints) {
        // Wait constraint.
        const constraint = this.constraints[k];
        if (
          constraint.root === bone &&
          this.sortedBones.indexOf(constraint.target) < 0
        ) {
          flag = true;
          break;
        }
      }

      if (flag) {
        continue;
      }

      if (bone.parent !== null && this.sortedBones.indexOf(bone.parent) < 0) {
        // Wait parent.
        continue;
      }

      this.sortedBones.push(bone);
      count++;
    }
  }
  /**
   * @internal
   */
  public cacheFrames(frameRate: number): void {
    if (this.cacheFrameRate > 0) {
      // TODO clear cache.
      return;
    }

    this.cacheFrameRate = frameRate;
    for (let k in this.animations) {
      this.animations[k].cacheFrames(this.cacheFrameRate);
    }
  }
  /**
   * @internal
   */
  public setCacheFrame(
    globalTransformMatrix: Matrix,
    transform: Transform
  ): number {
    const dataArray = this.parent.cachedFrames;
    let arrayOffset = dataArray.length;

    dataArray.length += 10;
    dataArray[arrayOffset] = globalTransformMatrix.a;
    dataArray[arrayOffset + 1] = globalTransformMatrix.b;
    dataArray[arrayOffset + 2] = globalTransformMatrix.c;
    dataArray[arrayOffset + 3] = globalTransformMatrix.d;
    dataArray[arrayOffset + 4] = globalTransformMatrix.tx;
    dataArray[arrayOffset + 5] = globalTransformMatrix.ty;
    dataArray[arrayOffset + 6] = transform.rotation;
    dataArray[arrayOffset + 7] = transform.skew;
    dataArray[arrayOffset + 8] = transform.scaleX;
    dataArray[arrayOffset + 9] = transform.scaleY;

    return arrayOffset;
  }
  /**
   * @internal
   */
  public getCacheFrame(
    globalTransformMatrix: Matrix,
    transform: Transform,
    arrayOffset: number
  ): void {
    const dataArray = this.parent.cachedFrames;
    globalTransformMatrix.a = dataArray[arrayOffset];
    globalTransformMatrix.b = dataArray[arrayOffset + 1];
    globalTransformMatrix.c = dataArray[arrayOffset + 2];
    globalTransformMatrix.d = dataArray[arrayOffset + 3];
    globalTransformMatrix.tx = dataArray[arrayOffset + 4];
    globalTransformMatrix.ty = dataArray[arrayOffset + 5];
    transform.rotation = dataArray[arrayOffset + 6];
    transform.skew = dataArray[arrayOffset + 7];
    transform.scaleX = dataArray[arrayOffset + 8];
    transform.scaleY = dataArray[arrayOffset + 9];
    transform.x = globalTransformMatrix.tx;
    transform.y = globalTransformMatrix.ty;
  }
  /**
   * @internal
   */
  public addBone(value: BoneData): void {
    if (value.name in this.bones) {
      console.warn("Same bone: " + value.name);
      return;
    }

    this.bones[value.name] = value;
    this.sortedBones.push(value);
  }
  /**
   * @internal
   */
  public addSlot(value: SlotData): void {
    if (value.name in this.slots) {
      console.warn("Same slot: " + value.name);
      return;
    }

    this.slots[value.name] = value;
    this.sortedSlots.push(value);
  }
  /**
   * @internal
   */
  public addConstraint(value: ConstraintData): void {
    if (value.name in this.constraints) {
      console.warn("Same constraint: " + value.name);
      return;
    }

    this.constraints[value.name] = value;
  }
  /**
   * @internal
   */
  public addSkin(value: SkinData): void {
    if (value.name in this.skins) {
      console.warn("Same skin: " + value.name);
      return;
    }

    value.parent = this;
    this.skins[value.name] = value;
    if (this.defaultSkin === null) {
      this.defaultSkin = value;
    }

    if (value.name === "default") {
      this.defaultSkin = value;
    }
  }
  /**
   * @internal
   */
  public addAnimation(value: AnimationData): void {
    if (value.name in this.animations) {
      console.warn("Same animation: " + value.name);
      return;
    }

    value.parent = this;
    this.animations[value.name] = value;
    this.animationNames.push(value.name);
    if (this.defaultAnimation === null) {
      this.defaultAnimation = value;
    }
  }
  /**
   * @internal
   */
  public addAction(value: ActionData, isDefault: boolean): void {
    if (isDefault) {
      this.defaultActions.push(value);
    } else {
      this.actions.push(value);
    }
  }
  /**
   * - Get a specific done data.
   * @param boneName - The bone name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public getBone(boneName: string): BoneData | null {
    return boneName in this.bones ? this.bones[boneName] : null;
  }
  /**
   * - Get a specific slot data.
   * @param slotName - The slot name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public getSlot(slotName: string): SlotData | null {
    return slotName in this.slots ? this.slots[slotName] : null;
  }
  /**
   * @private
   */
  public getConstraint(constraintName: string): ConstraintData | null {
    return constraintName in this.constraints
      ? this.constraints[constraintName]
      : null;
  }
  /**
   * - Get a specific skin data.
   * @param skinName - The skin name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public getSkin(skinName: string): SkinData | null {
    return skinName in this.skins ? this.skins[skinName] : null;
  }
  /**
   * @private
   */
  public getMesh(
    skinName: string,
    slotName: string,
    meshName: string
  ): MeshDisplayData | null {
    const skin = this.getSkin(skinName);
    if (skin === null) {
      return null;
    }

    return skin.getDisplay(slotName, meshName) as MeshDisplayData | null;
  }
  /**
   * - Get a specific animation data.
   * @param animationName - The animation animationName.
   * @version DragonBones 3.0
   * @language en_US
   */
  public getAnimation(animationName: string): AnimationData | null {
    return animationName in this.animations
      ? this.animations[animationName]
      : null;
  }
}
/**
 * - The bone data.
 * @version DragonBones 3.0
 * @language en_US
 */
export class BoneData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.BoneData]";
  }
  /**
   * @private
   */
  public inheritTranslation: boolean;
  /**
   * @private
   */
  public inheritRotation: boolean;
  /**
   * @private
   */
  public inheritScale: boolean;
  /**
   * @private
   */
  public inheritReflection: boolean;
  /**
   * @private
   */
  public type: BoneType;
  /**
   * - The bone length.
   * @version DragonBones 3.0
   * @language en_US
   */
  public length: number;
  /**
   * @private
   */
  public alpha: number;
  /**
   * - The bone name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public name: string;
  /**
   * @private
   */
  public readonly transform: Transform = new Transform();
  /**
   * @private
   */
  public userData: UserData | null = null; // Initial value.
  /**
   * - The parent bone data.
   * @version DragonBones 3.0
   * @language en_US
   */
  public parent: BoneData | null;

  protected _onClear(): void {
    if (this.userData !== null) {
      this.userData.returnToPool();
    }

    this.inheritTranslation = false;
    this.inheritRotation = false;
    this.inheritScale = false;
    this.inheritReflection = false;
    this.type = BoneType.Bone;
    this.length = 0.0;
    this.alpha = 1.0;
    this.name = "";
    this.transform.identity();
    this.userData = null;
    this.parent = null;
  }
}
/**
 * @internal
 */
export class SurfaceData extends BoneData {
  public static toString(): string {
    return "[class dragonBones.SurfaceData]";
  }

  public segmentX: number;
  public segmentY: number;
  public readonly geometry: GeometryData = new GeometryData();

  protected _onClear(): void {
    super._onClear();

    this.type = BoneType.Surface;
    this.segmentX = 0;
    this.segmentY = 0;
    this.geometry.clear();
  }
}
/**
 * - The slot data.
 * @version DragonBones 3.0
 * @language en_US
 */
export class SlotData extends BaseObject {
  /**
   * @internal
   */
  public static readonly DEFAULT_COLOR: ColorTransform = new ColorTransform();
  /**
   * @internal
   */
  public static createColor(): ColorTransform {
    return new ColorTransform();
  }

  public static toString(): string {
    return "[class dragonBones.SlotData]";
  }
  /**
   * @private
   */
  public blendMode: BlendMode;
  /**
   * @private
   */
  public displayIndex: number;
  /**
   * @private
   */
  public zOrder: number;
  /**
   * @private
   */
  public zIndex: number;
  /**
   * @private
   */
  public alpha: number;
  /**
   * - The slot name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public name: string;
  /**
   * @private
   */
  public color: ColorTransform = null as any; // Initial value.
  /**
   * @private
   */
  public userData: UserData | null = null; // Initial value.
  /**
   * - The parent bone data.
   * @version DragonBones 3.0
   * @language en_US
   */
  public parent: BoneData;

  protected _onClear(): void {
    if (this.userData !== null) {
      this.userData.returnToPool();
    }

    this.blendMode = BlendMode.Normal;
    this.displayIndex = 0;
    this.zOrder = 0;
    this.zIndex = 0;
    this.alpha = 1.0;
    this.name = "";
    this.color = null as any; //
    this.userData = null;
    this.parent = null as any; //
  }
}
