import { WorldClock } from "../animation/WorldClock";
import { Armature } from "../armature/Armature";
import { Bone } from "../armature/Bone";
import { IKConstraint, PathConstraint } from "../armature/Constraint";
import { Slot } from "../armature/Slot";
import { Surface } from "../armature/Surface";
import { BaseObject } from "../core/BaseObject";
import { BoneType, ConstraintType, DisplayType, DragonBones, Map } from "../core/DragonBones";
import { EventObject } from "../event/EventObject";
import { AnimationData } from "../model/AnimationData";
import { ArmatureData, SlotData } from "../model/ArmatureData";
import { DisplayData, ArmatureDisplayData, ImageDisplayData, MeshDisplayData } from "../model/DisplayData";
import { DragonBonesData } from "../model/DragonBonesData";
import { SkinData } from "../model/SkinData";
import { TextureAtlasData, TextureData } from "../model/TextureAtlasData";
import { BinaryDataParser } from "../parser/BinaryDataParser";
import { DataParser } from "../parser/DataParser";
import { ObjectDataParser } from "../parser/ObjectDataParser";


/**
 * - Base class for the factory that create the armatures. (Typically only one global factory instance is required)
 * The factory instance create armatures by parsed and added DragonBonesData instances and TextureAtlasData instances.
 * Once the data has been parsed, it has been cached in the factory instance and does not need to be parsed again until it is cleared by the factory instance.
 * @see dragonBones.DragonBonesData
 * @see dragonBones.TextureAtlasData
 * @see dragonBones.ArmatureData
 * @see dragonBones.Armature
 * @version DragonBones 3.0
 * @language en_US
 */
export abstract class BaseFactory {
  protected static _objectParser: ObjectDataParser = null as any;
  protected static _binaryParser: BinaryDataParser = null as any;
  /**
   * @private
   */
  public autoSearch: boolean = false;

  protected readonly _dragonBonesDataMap: Map<DragonBonesData> = {};
  protected readonly _textureAtlasDataMap: Map<Array<TextureAtlasData>> = {};
  protected _dragonBones: DragonBones = null as any;
  protected _dataParser: DataParser = null as any;
  /**
   * - Create a factory instance. (typically only one global factory instance is required)
   * @version DragonBones 3.0
   * @language en_US
   */
  public constructor(dataParser: DataParser | null = null) {
    if (BaseFactory._objectParser === null) {
      BaseFactory._objectParser = new ObjectDataParser();
    }

    if (BaseFactory._binaryParser === null) {
      BaseFactory._binaryParser = new BinaryDataParser();
    }

    this._dataParser =
      dataParser !== null ? dataParser : BaseFactory._objectParser;
  }

  protected _isSupportMesh(): boolean {
    return true;
  }

  protected _getTextureData(
    textureAtlasName: string,
    textureName: string
  ): TextureData | null {
    if (textureAtlasName in this._textureAtlasDataMap) {
      for (const textureAtlasData of this._textureAtlasDataMap[
        textureAtlasName
      ]) {
        const textureData = textureAtlasData.getTexture(textureName);
        if (textureData !== null) {
          return textureData;
        }
      }
    }

    if (this.autoSearch) {
      // Will be search all data, if the autoSearch is true.
      for (let k in this._textureAtlasDataMap) {
        for (const textureAtlasData of this._textureAtlasDataMap[k]) {
          if (textureAtlasData.autoSearch) {
            const textureData = textureAtlasData.getTexture(textureName);
            if (textureData !== null) {
              return textureData;
            }
          }
        }
      }
    }

    return null;
  }

  protected _fillBuildArmaturePackage(
    dataPackage: BuildArmaturePackage,
    dragonBonesName: string,
    armatureName: string,
    skinName: string,
    textureAtlasName: string
  ): boolean {
    let dragonBonesData: DragonBonesData | null = null;
    let armatureData: ArmatureData | null = null;

    if (dragonBonesName.length > 0) {
      if (dragonBonesName in this._dragonBonesDataMap) {
        dragonBonesData = this._dragonBonesDataMap[dragonBonesName];
        armatureData = dragonBonesData.getArmature(armatureName);
      }
    }

    if (
      armatureData === null &&
      (dragonBonesName.length === 0 || this.autoSearch)
    ) {
      // Will be search all data, if do not give a data name or the autoSearch is true.
      for (let k in this._dragonBonesDataMap) {
        dragonBonesData = this._dragonBonesDataMap[k];
        if (dragonBonesName.length === 0 || dragonBonesData.autoSearch) {
          armatureData = dragonBonesData.getArmature(armatureName);
          if (armatureData !== null) {
            dragonBonesName = k;
            break;
          }
        }
      }
    }

    if (armatureData !== null) {
      dataPackage.dataName = dragonBonesName;
      dataPackage.textureAtlasName = textureAtlasName;
      dataPackage.data = dragonBonesData as any;
      dataPackage.armature = armatureData;
      dataPackage.skin = null;

      if (skinName.length > 0) {
        dataPackage.skin = armatureData.getSkin(skinName);
        if (dataPackage.skin === null && this.autoSearch) {
          for (let k in this._dragonBonesDataMap) {
            const skinDragonBonesData = this._dragonBonesDataMap[k];
            const skinArmatureData = skinDragonBonesData.getArmature(skinName);
            if (skinArmatureData !== null) {
              dataPackage.skin = skinArmatureData.defaultSkin;
              break;
            }
          }
        }
      }

      if (dataPackage.skin === null) {
        dataPackage.skin = armatureData.defaultSkin;
      }

      return true;
    }

    return false;
  }

  protected _buildBones(
    dataPackage: BuildArmaturePackage,
    armature: Armature
  ): void {
    for (const boneData of dataPackage.armature.sortedBones) {
      const bone = BaseObject.borrowObject(
        boneData.type === BoneType.Bone ? Bone : Surface
      );
      bone.init(boneData, armature);
    }
  }
  /**
   * @private
   */
  protected _buildSlots(
    dataPackage: BuildArmaturePackage,
    armature: Armature
  ): void {
    const currentSkin = dataPackage.skin;
    const defaultSkin = dataPackage.armature.defaultSkin;
    if (currentSkin === null || defaultSkin === null) {
      return;
    }

    const skinSlots: Map<Array<DisplayData | null>> = {};
    for (let k in defaultSkin.displays) {
      const displays = defaultSkin.getDisplays(k) as any;
      skinSlots[k] = displays;
    }

    if (currentSkin !== defaultSkin) {
      for (let k in currentSkin.displays) {
        const displays = currentSkin.getDisplays(k) as any;
        skinSlots[k] = displays;
      }
    }

    for (const slotData of dataPackage.armature.sortedSlots) {
      const displayDatas =
        slotData.name in skinSlots ? skinSlots[slotData.name] : null;
      const slot = this._buildSlot(dataPackage, slotData, armature);

      if (displayDatas !== null) {
        slot.displayFrameCount = displayDatas.length;
        for (let i = 0, l = slot.displayFrameCount; i < l; ++i) {
          const displayData = displayDatas[i];
          slot.replaceRawDisplayData(displayData, i);

          if (displayData !== null) {
            if (dataPackage.textureAtlasName.length > 0) {
              const textureData = this._getTextureData(
                dataPackage.textureAtlasName,
                displayData.path
              );
              slot.replaceTextureData(textureData, i);
            }

            const display = this._getSlotDisplay(
              dataPackage,
              displayData,
              slot
            );
            slot.replaceDisplay(display, i);
          } else {
            slot.replaceDisplay(null);
          }
        }
      }

      slot._setDisplayIndex(slotData.displayIndex, true);
    }
  }

  protected _buildConstraints(
    dataPackage: BuildArmaturePackage,
    armature: Armature
  ): void {
    const constraints = dataPackage.armature.constraints;
    for (let k in constraints) {
      const constraintData = constraints[k];
      // TODO more constraint type.
      switch (constraintData.type) {
        case ConstraintType.IK:
          const ikConstraint = BaseObject.borrowObject(IKConstraint);
          ikConstraint.init(constraintData, armature);
          armature._addConstraint(ikConstraint);
          break;

        case ConstraintType.Path:
          const pathConstraint = BaseObject.borrowObject(PathConstraint);
          pathConstraint.init(constraintData, armature);
          armature._addConstraint(pathConstraint);
          break;

        default:
          const constraint = BaseObject.borrowObject(IKConstraint);
          constraint.init(constraintData, armature);
          armature._addConstraint(constraint);
          break;
      }
    }
  }

  protected _buildChildArmature(
    dataPackage: BuildArmaturePackage | null,
    _slot: Slot,
    displayData: ArmatureDisplayData
  ): Armature | null {
    return this.buildArmature(
      displayData.path,
      dataPackage !== null ? dataPackage.dataName : "",
      "",
      dataPackage !== null ? dataPackage.textureAtlasName : ""
    );
  }

  protected _getSlotDisplay(
    dataPackage: BuildArmaturePackage | null,
    displayData: DisplayData,
    slot: Slot
  ): any {
    const dataName =
      dataPackage !== null
        ? dataPackage.dataName
        : displayData.parent.parent.parent.name;
    let display: any = null;
    switch (displayData.type) {
      case DisplayType.Image: {
        const imageDisplayData = displayData as ImageDisplayData;
        if (imageDisplayData.texture === null) {
          imageDisplayData.texture = this._getTextureData(
            dataName,
            displayData.path
          );
        }

        display = slot.rawDisplay;
        break;
      }

      case DisplayType.Mesh: {
        const meshDisplayData = displayData as MeshDisplayData;
        if (meshDisplayData.texture === null) {
          meshDisplayData.texture = this._getTextureData(
            dataName,
            meshDisplayData.path
          );
        }

        if (this._isSupportMesh()) {
          display = slot.meshDisplay;
        } else {
          display = slot.rawDisplay;
        }
        break;
      }

      case DisplayType.Armature: {
        const armatureDisplayData = displayData as ArmatureDisplayData;
        const childArmature = this._buildChildArmature(
          dataPackage,
          slot,
          armatureDisplayData
        );
        if (childArmature !== null) {
          childArmature.inheritAnimation = armatureDisplayData.inheritAnimation;
          if (!childArmature.inheritAnimation) {
            const actions =
              armatureDisplayData.actions.length > 0
                ? armatureDisplayData.actions
                : childArmature.armatureData.defaultActions;
            if (actions.length > 0) {
              for (const action of actions) {
                const eventObject = BaseObject.borrowObject(EventObject);
                EventObject.actionDataToInstance(
                  action,
                  eventObject,
                  slot.armature
                );
                eventObject.slot = slot;
                slot.armature._bufferAction(eventObject, false);
              }
            } else {
              childArmature.animation.play();
            }
          }

          armatureDisplayData.armature = childArmature.armatureData; //
        }

        display = childArmature;
        break;
      }

      case DisplayType.BoundingBox:
        break;

      default:
        break;
    }

    return display;
  }

  protected abstract _buildTextureAtlasData(
    textureAtlasData: TextureAtlasData | null,
    textureAtlas: any
  ): TextureAtlasData;
  protected abstract _buildArmature(
    dataPackage: BuildArmaturePackage
  ): Armature;
  protected abstract _buildSlot(
    dataPackage: BuildArmaturePackage,
    slotData: SlotData,
    armature: Armature
  ): Slot;
  /**
   * - Parse the raw data to a DragonBonesData instance and cache it to the factory.
   * @param rawData - The raw data.
   * @param name - Specify a cache name for the instance so that the instance can be obtained through this name. (If not set, use the instance name instead)
   * @param scale - Specify a scaling value for all armatures. (Default: 1.0)
   * @returns DragonBonesData instance
   * @see #getDragonBonesData()
   * @see #addDragonBonesData()
   * @see #removeDragonBonesData()
   * @see dragonBones.DragonBonesData
   * @version DragonBones 4.5
   * @language en_US
   */
  public parseDragonBonesData(
    rawData: any,
    name: string | null = null,
    scale: number = 1.0
  ): DragonBonesData | null {
    const dataParser =
      rawData instanceof ArrayBuffer
        ? BaseFactory._binaryParser
        : this._dataParser;
    const dragonBonesData = dataParser.parseDragonBonesData(rawData, scale);

    while (true) {
      const textureAtlasData = this._buildTextureAtlasData(null, null);
      if (dataParser.parseTextureAtlasData(null, textureAtlasData, scale)) {
        this.addTextureAtlasData(textureAtlasData, name);
      } else {
        textureAtlasData.returnToPool();
        break;
      }
    }

    if (dragonBonesData !== null) {
      this.addDragonBonesData(dragonBonesData, name);
    }

    return dragonBonesData;
  }
  /**
   * - Parse the raw texture atlas data and the texture atlas object to a TextureAtlasData instance and cache it to the factory.
   * @param rawData - The raw texture atlas data.
   * @param textureAtlas - The texture atlas object.
   * @param name - Specify a cache name for the instance so that the instance can be obtained through this name. (If not set, use the instance name instead)
   * @param scale - Specify a scaling value for the map set. (Default: 1.0)
   * @returns TextureAtlasData instance
   * @see #getTextureAtlasData()
   * @see #addTextureAtlasData()
   * @see #removeTextureAtlasData()
   * @see dragonBones.TextureAtlasData
   * @version DragonBones 4.5
   * @language en_US
   */
  public parseTextureAtlasData(
    rawData: any,
    textureAtlas: any,
    name: string | null = null,
    scale: number = 1.0
  ): TextureAtlasData {
    const textureAtlasData = this._buildTextureAtlasData(null, null);
    this._dataParser.parseTextureAtlasData(rawData, textureAtlasData, scale);
    this._buildTextureAtlasData(textureAtlasData, textureAtlas || null);
    this.addTextureAtlasData(textureAtlasData, name);

    return textureAtlasData;
  }
  /**
   * - Update texture atlases.
   * @param textureAtlases - The texture atlas objects.
   * @param name - The texture atlas name.
   * @version DragonBones 5.7
   * @language en_US
   */
  public updateTextureAtlases(textureAtlases: Array<any>, name: string): void {
    const textureAtlasDatas = this.getTextureAtlasData(name);
    if (textureAtlasDatas !== null) {
      for (let i = 0, l = textureAtlasDatas.length; i < l; ++i) {
        if (i < textureAtlases.length) {
          this._buildTextureAtlasData(textureAtlasDatas[i], textureAtlases[i]);
        }
      }
    }
  }
  /**
   * - Get a specific DragonBonesData instance.
   * @param name - The DragonBonesData instance cache name.
   * @returns DragonBonesData instance
   * @see #parseDragonBonesData()
   * @see #addDragonBonesData()
   * @see #removeDragonBonesData()
   * @see dragonBones.DragonBonesData
   * @version DragonBones 3.0
   * @language en_US
   */
  public getDragonBonesData(name: string): DragonBonesData | null {
    return name in this._dragonBonesDataMap
      ? this._dragonBonesDataMap[name]
      : null;
  }
  /**
   * - Cache a DragonBonesData instance to the factory.
   * @param data - The DragonBonesData instance.
   * @param name - Specify a cache name for the instance so that the instance can be obtained through this name. (if not set, use the instance name instead)
   * @see #parseDragonBonesData()
   * @see #getDragonBonesData()
   * @see #removeDragonBonesData()
   * @see dragonBones.DragonBonesData
   * @version DragonBones 3.0
   * @language en_US
   */
  public addDragonBonesData(
    data: DragonBonesData,
    name: string | null = null
  ): void {
    name = name !== null ? name : data.name;
    if (name in this._dragonBonesDataMap) {
      if (this._dragonBonesDataMap[name] === data) {
        return;
      }

      console.warn("Can not add same name data: " + name);
      return;
    }

    this._dragonBonesDataMap[name] = data;
  }
  /**
   * - Remove a DragonBonesData instance.
   * @param name - The DragonBonesData instance cache name.
   * @param disposeData - Whether to dispose data. (Default: true)
   * @see #parseDragonBonesData()
   * @see #getDragonBonesData()
   * @see #addDragonBonesData()
   * @see dragonBones.DragonBonesData
   * @version DragonBones 3.0
   * @language en_US
   */
  public removeDragonBonesData(
    name: string,
    disposeData: boolean = true
  ): void {
    if (name in this._dragonBonesDataMap) {
      if (disposeData) {
        this._dragonBones.bufferObject(this._dragonBonesDataMap[name]);
      }

      delete this._dragonBonesDataMap[name];
    }
  }
  /**
   * - Get a list of specific TextureAtlasData instances.
   * @param name - The TextureAtlasData cahce name.
   * @see #parseTextureAtlasData()
   * @see #addTextureAtlasData()
   * @see #removeTextureAtlasData()
   * @see dragonBones.TextureAtlasData
   * @version DragonBones 3.0
   * @language en_US
   */
  public getTextureAtlasData(name: string): Array<TextureAtlasData> | null {
    return name in this._textureAtlasDataMap
      ? this._textureAtlasDataMap[name]
      : null;
  }
  /**
   * - Cache a TextureAtlasData instance to the factory.
   * @param data - The TextureAtlasData instance.
   * @param name - Specify a cache name for the instance so that the instance can be obtained through this name. (if not set, use the instance name instead)
   * @see #parseTextureAtlasData()
   * @see #getTextureAtlasData()
   * @see #removeTextureAtlasData()
   * @see dragonBones.TextureAtlasData
   * @version DragonBones 3.0
   * @language en_US
   */
  public addTextureAtlasData(
    data: TextureAtlasData,
    name: string | null = null
  ): void {
    name = name !== null ? name : data.name;
    const textureAtlasList =
      name in this._textureAtlasDataMap
        ? this._textureAtlasDataMap[name]
        : (this._textureAtlasDataMap[name] = []);
    if (textureAtlasList.indexOf(data) < 0) {
      textureAtlasList.push(data);
    }
  }
  /**
   * - Remove a TextureAtlasData instance.
   * @param name - The TextureAtlasData instance cache name.
   * @param disposeData - Whether to dispose data.
   * @see #parseTextureAtlasData()
   * @see #getTextureAtlasData()
   * @see #addTextureAtlasData()
   * @see dragonBones.TextureAtlasData
   * @version DragonBones 3.0
   * @language en_US
   */
  public removeTextureAtlasData(
    name: string,
    disposeData: boolean = true
  ): void {
    if (name in this._textureAtlasDataMap) {
      const textureAtlasDataList = this._textureAtlasDataMap[name];
      if (disposeData) {
        for (const textureAtlasData of textureAtlasDataList) {
          this._dragonBones.bufferObject(textureAtlasData);
        }
      }

      delete this._textureAtlasDataMap[name];
    }
  }
  /**
   * - Get a specific armature data.
   * @param name - The armature data name.
   * @param dragonBonesName - The cached name for DragonbonesData instance.
   * @see dragonBones.ArmatureData
   * @version DragonBones 5.1
   * @language en_US
   */
  public getArmatureData(
    name: string,
    dragonBonesName: string = ""
  ): ArmatureData | null {
    const dataPackage: BuildArmaturePackage = new BuildArmaturePackage();
    if (
      !this._fillBuildArmaturePackage(
        dataPackage,
        dragonBonesName,
        name,
        "",
        ""
      )
    ) {
      return null;
    }

    return dataPackage.armature;
  }
  /**
   * - Clear all cached DragonBonesData instances and TextureAtlasData instances.
   * @param disposeData - Whether to dispose data.
   * @version DragonBones 4.5
   * @language en_US
   */
  public clear(disposeData: boolean = true): void {
    for (let k in this._dragonBonesDataMap) {
      if (disposeData) {
        this._dragonBones.bufferObject(this._dragonBonesDataMap[k]);
      }

      delete this._dragonBonesDataMap[k];
    }

    for (let k in this._textureAtlasDataMap) {
      if (disposeData) {
        const textureAtlasDataList = this._textureAtlasDataMap[k];
        for (const textureAtlasData of textureAtlasDataList) {
          this._dragonBones.bufferObject(textureAtlasData);
        }
      }

      delete this._textureAtlasDataMap[k];
    }
  }
  /**
   * - Create a armature from cached DragonBonesData instances and TextureAtlasData instances.
   * Note that when the created armature that is no longer in use, you need to explicitly dispose {@link #dragonBones.Armature#dispose()}.
   * @param armatureName - The armature data name.
   * @param dragonBonesName - The cached name of the DragonBonesData instance. (If not set, all DragonBonesData instances are retrieved, and when multiple DragonBonesData instances contain a the same name armature data, it may not be possible to accurately create a specific armature)
   * @param skinName - The skin name, you can set a different ArmatureData name to share it's skin data. (If not set, use the default skin data)
   * @returns The armature.
   * @example
   * <pre>
   *     let armature = factory.buildArmature("armatureName", "dragonBonesName");
   *     armature.clock = factory.clock;
   * </pre>
   * @see dragonBones.DragonBonesData
   * @see dragonBones.ArmatureData
   * @version DragonBones 3.0
   * @language en_US
   */
  public buildArmature(
    armatureName: string,
    dragonBonesName: string = "",
    skinName: string = "",
    textureAtlasName: string = ""
  ): Armature | null {
    const dataPackage: BuildArmaturePackage = new BuildArmaturePackage();
    if (
      !this._fillBuildArmaturePackage(
        dataPackage,
        dragonBonesName || "",
        armatureName,
        skinName || "",
        textureAtlasName || ""
      )
    ) {
      console.warn(
        "No armature data: " +
          armatureName +
          ", " +
          (dragonBonesName !== null ? dragonBonesName : "")
      );
      return null;
    }

    const armature = this._buildArmature(dataPackage);
    this._buildBones(dataPackage, armature);
    this._buildSlots(dataPackage, armature);
    this._buildConstraints(dataPackage, armature);
    armature.invalidUpdate(null, true);
    armature.advanceTime(0.0); // Update armature pose.

    return armature;
  }
  /**
   * @private
   */
  public replaceDisplay(
    slot: Slot,
    displayData: DisplayData | null,
    displayIndex: number = -1
  ): void {
    if (displayIndex < 0) {
      displayIndex = slot.displayIndex;
    }

    if (displayIndex < 0) {
      displayIndex = 0;
    }

    slot.replaceDisplayData(displayData, displayIndex);

    if (displayData !== null) {
      let display = this._getSlotDisplay(null, displayData, slot);
      if (displayData.type === DisplayType.Image) {
        const rawDisplayData =
          slot.getDisplayFrameAt(displayIndex).rawDisplayData;
        if (
          rawDisplayData !== null &&
          rawDisplayData.type === DisplayType.Mesh
        ) {
          display = slot.meshDisplay;
        }
      }

      slot.replaceDisplay(display, displayIndex);
    } else {
      slot.replaceDisplay(null, displayIndex);
    }
  }
  /**
   * - Replaces the current display data for a particular slot with a specific display data.
   * Specify display data with "dragonBonesName/armatureName/slotName/displayName".
   * @param dragonBonesName - The DragonBonesData instance cache name.
   * @param armatureName - The armature data name.
   * @param slotName - The slot data name.
   * @param displayName - The display data name.
   * @param slot - The slot.
   * @param displayIndex - The index of the display data that is replaced. (If it is not set, replaces the current display data)
   * @example
   * <pre>
   *     let slot = armature.getSlot("weapon");
   *     factory.replaceSlotDisplay("dragonBonesName", "armatureName", "slotName", "displayName", slot);
   * </pre>
   * @version DragonBones 4.5
   * @language en_US
   */
  public replaceSlotDisplay(
    dragonBonesName: string,
    armatureName: string,
    slotName: string,
    displayName: string,
    slot: Slot,
    displayIndex: number = -1
  ): boolean {
    const armatureData = this.getArmatureData(
      armatureName,
      dragonBonesName || ""
    );
    if (armatureData === null || armatureData.defaultSkin === null) {
      return false;
    }

    const displayData = armatureData.defaultSkin.getDisplay(
      slotName,
      displayName
    );
    this.replaceDisplay(slot, displayData, displayIndex);

    return true;
  }
  /**
   * @private
   */
  public replaceSlotDisplayList(
    dragonBonesName: string | null,
    armatureName: string,
    slotName: string,
    slot: Slot
  ): boolean {
    const armatureData = this.getArmatureData(
      armatureName,
      dragonBonesName || ""
    );
    if (!armatureData || !armatureData.defaultSkin) {
      return false;
    }

    const displayDatas = armatureData.defaultSkin.getDisplays(slotName);
    if (!displayDatas) {
      return false;
    }

    slot.displayFrameCount = displayDatas.length;
    for (let i = 0, l = slot.displayFrameCount; i < l; ++i) {
      const displayData = displayDatas[i];
      this.replaceDisplay(slot, displayData, i);
    }

    return true;
  }
  /**
   * - Share specific skin data with specific armature.
   * @param armature - The armature.
   * @param skin - The skin data.
   * @param isOverride - Whether it completely override the original skin. (Default: false)
   * @param exclude - A list of slot names that do not need to be replace.
   * @example
   * <pre>
   *     let armatureA = factory.buildArmature("armatureA", "dragonBonesA");
   *     let armatureDataB = factory.getArmatureData("armatureB", "dragonBonesB");
   *     if (armatureDataB && armatureDataB.defaultSkin) {
   *     factory.replaceSkin(armatureA, armatureDataB.defaultSkin, false, ["arm_l", "weapon_l"]);
   *     }
   * </pre>
   * @see dragonBones.Armature
   * @see dragonBones.SkinData
   * @version DragonBones 5.6
   * @language en_US
   */
  public replaceSkin(
    armature: Armature,
    skin: SkinData,
    isOverride: boolean = false,
    exclude: Array<string> | null = null
  ): boolean {
    let success = false;
    const defaultSkin = skin.parent.defaultSkin;

    for (const slot of armature.getSlots()) {
      if (exclude !== null && exclude.indexOf(slot.name) >= 0) {
        continue;
      }

      let displayDatas = skin.getDisplays(slot.name);
      if (displayDatas === null) {
        if (defaultSkin !== null && skin !== defaultSkin) {
          displayDatas = defaultSkin.getDisplays(slot.name);
        }

        if (displayDatas === null) {
          if (isOverride) {
            slot.displayFrameCount = 0;
          }
          continue;
        }
      }

      slot.displayFrameCount = displayDatas.length;
      for (let i = 0, l = slot.displayFrameCount; i < l; ++i) {
        const displayData = displayDatas[i];
        slot.replaceRawDisplayData(displayData, i);

        if (displayData !== null) {
          slot.replaceDisplay(this._getSlotDisplay(null, displayData, slot), i);
        } else {
          slot.replaceDisplay(null, i);
        }
      }

      success = true;
    }

    return success;
  }
  /**
   * - Replaces the existing animation data for a specific armature with the animation data for the specific armature data.
   * This enables you to make a armature template so that other armature without animations can share it's animations.
   * @param armature - The armtaure.
   * @param armatureData - The armature data.
   * @param isOverride - Whether to completely overwrite the original animation. (Default: false)
   * @example
   * <pre>
   *     let armatureA = factory.buildArmature("armatureA", "dragonBonesA");
   *     let armatureDataB = factory.getArmatureData("armatureB", "dragonBonesB");
   *     if (armatureDataB) {
   *     factory.replaceAnimation(armatureA, armatureDataB);
   *     }
   * </pre>
   * @see dragonBones.Armature
   * @see dragonBones.ArmatureData
   * @version DragonBones 5.6
   * @language en_US
   */
  public replaceAnimation(
    armature: Armature,
    armatureData: ArmatureData,
    isOverride: boolean = true
  ): boolean {
    const skinData = armatureData.defaultSkin;
    if (skinData === null) {
      return false;
    }

    if (isOverride) {
      armature.animation.animations = armatureData.animations;
    } else {
      const rawAnimations = armature.animation.animations;
      const animations: Map<AnimationData> = {};

      for (let k in rawAnimations) {
        animations[k] = rawAnimations[k];
      }

      for (let k in armatureData.animations) {
        animations[k] = armatureData.animations[k];
      }

      armature.animation.animations = animations;
    }

    for (const slot of armature.getSlots()) {
      let index = 0;
      for (const display of slot.displayList) {
        if (display instanceof Armature) {
          const displayDatas = skinData.getDisplays(slot.name);
          if (displayDatas !== null && index < displayDatas.length) {
            const displayData = displayDatas[index];
            if (
              displayData !== null &&
              displayData.type === DisplayType.Armature
            ) {
              const childArmatureData = this.getArmatureData(
                displayData.path,
                displayData.parent.parent.parent.name
              );
              if (childArmatureData) {
                this.replaceAnimation(display, childArmatureData, isOverride);
              }
            }
          }
        }

        index++;
      }
    }

    return true;
  }
  /**
   * @private
   */
  public getAllDragonBonesData(): Map<DragonBonesData> {
    return this._dragonBonesDataMap;
  }
  /**
   * @private
   */
  public getAllTextureAtlasData(): Map<Array<TextureAtlasData>> {
    return this._textureAtlasDataMap;
  }
  /**
   * - An Worldclock instance updated by engine.
   * @version DragonBones 5.7
   * @language en_US
   */
  public get clock(): WorldClock {
    return this._dragonBones.clock;
  }
  /**
   * @private
   */
  public get dragonBones(): DragonBones {
    return this._dragonBones;
  }
}
/**
 * @private
 */
export class BuildArmaturePackage {
  public dataName: string = "";
  public textureAtlasName: string = "";
  public data: DragonBonesData;
  public armature: ArmatureData;
  public skin: SkinData | null = null;
}
