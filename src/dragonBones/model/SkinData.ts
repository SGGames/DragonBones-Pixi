import { BaseObject } from "../core/BaseObject";
import { ArmatureData } from "./ArmatureData";
import { DisplayData } from "./DisplayData";
import { Map } from "../core/DragonBones";

/**
 * - The skin data, typically a armature data instance contains at least one skinData.
 * @version DragonBones 3.0
 * @language en_US
 */
export class SkinData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.SkinData]";
  }
  /**
   * - The skin name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public name: string;
  /**
   * @private
   */
  public readonly displays: Map<Array<DisplayData | null>> = {};
  /**
   * @private
   */
  public parent: ArmatureData;

  protected _onClear(): void {
    for (let k in this.displays) {
      const slotDisplays = this.displays[k];
      for (const display of slotDisplays) {
        if (display !== null) {
          display.returnToPool();
        }
      }

      delete this.displays[k];
    }

    this.name = "";
    // this.displays.clear();
    this.parent = null as any; //
  }
  /**
   * @internal
   */
  public addDisplay(slotName: string, value: DisplayData | null): void {
    if (!(slotName in this.displays)) {
      this.displays[slotName] = [];
    }

    if (value !== null) {
      value.parent = this;
    }

    const slotDisplays = this.displays[slotName]; // TODO clear prev
    slotDisplays.push(value);
  }
  /**
   * @private
   */
  public getDisplay(slotName: string, displayName: string): DisplayData | null {
    const slotDisplays = this.getDisplays(slotName);
    if (slotDisplays !== null) {
      for (const display of slotDisplays) {
        if (display !== null && display.name === displayName) {
          return display;
        }
      }
    }

    return null;
  }
  /**
   * @private
   */
  public getDisplays(slotName: string): Array<DisplayData | null> | null {
    if (!(slotName in this.displays)) {
      return null;
    }

    return this.displays[slotName];
  }
}
