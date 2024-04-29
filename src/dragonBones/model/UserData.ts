import { BaseObject } from "../core/BaseObject";
import { ActionType } from "../core/DragonBones";
import { BoneData, SlotData } from "./ArmatureData";

/**
 * - The user custom data.
 * @version DragonBones 5.0
 * @language en_US
 */
export class UserData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.UserData]";
  }
  /**
   * - The custom int numbers.
   * @version DragonBones 5.0
   * @language en_US
   */
  public readonly ints: Array<number> = [];
  /**
   * - The custom float numbers.
   * @version DragonBones 5.0
   * @language en_US
   */
  public readonly floats: Array<number> = [];
  /**
   * - The custom strings.
   * @version DragonBones 5.0
   * @language en_US
   */
  public readonly strings: Array<string> = [];

  protected _onClear(): void {
    this.ints.length = 0;
    this.floats.length = 0;
    this.strings.length = 0;
  }
  /**
   * @internal
   */
  public addInt(value: number): void {
    this.ints.push(value);
  }
  /**
   * @internal
   */
  public addFloat(value: number): void {
    this.floats.push(value);
  }
  /**
   * @internal
   */
  public addString(value: string): void {
    this.strings.push(value);
  }
  /**
   * - Get the custom int number.
   * @version DragonBones 5.0
   * @language en_US
   */
  public getInt(index: number = 0): number {
    return index >= 0 && index < this.ints.length ? this.ints[index] : 0;
  }
  /**
   * - Get the custom float number.
   * @version DragonBones 5.0
   * @language en_US
   */
  public getFloat(index: number = 0): number {
    return index >= 0 && index < this.floats.length ? this.floats[index] : 0.0;
  }
  /**
   * - Get the custom string.
   * @version DragonBones 5.0
   * @language en_US
   */
  public getString(index: number = 0): string {
    return index >= 0 && index < this.strings.length ? this.strings[index] : "";
  }
}
/**
 * @private
 */
export class ActionData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.ActionData]";
  }

  public type: ActionType;
  public name: string; // Frame event name | Sound event name | Animation name
  public bone: BoneData | null;
  public slot: SlotData | null;
  public data: UserData | null = null; //

  protected _onClear(): void {
    if (this.data !== null) {
      this.data.returnToPool();
    }

    this.type = ActionType.Play;
    this.name = "";
    this.bone = null;
    this.slot = null;
    this.data = null;
  }
}
