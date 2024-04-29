
import * as PIXI from "pixi.js";
import { PixiArmatureDisplay } from "./PixiArmatureDisplay";
import { PixiSlot } from "./PixiSlot";
import { PixiTextureAtlasData, PixiTextureData } from "./PixiTextureAtlasData";
import { MeshSimple, Sprite, Texture } from "pixi.js";
import { Armature } from "../../dragonBones/armature/Armature";
import { Slot } from "../../dragonBones/armature/Slot";
import { BaseObject } from "../../dragonBones/core/BaseObject";
import { DragonBones } from "../../dragonBones/core/DragonBones";
import { SlotData } from "../../dragonBones/model/ArmatureData";
import { BaseFactory, BuildArmaturePackage } from "../../dragonBones/factory/BaseFactory";
import { DataParser } from "../../dragonBones/parser/DataParser";
import { Ticker } from "pixi.js";

/**
 * - The PixiJS factory.
 * @version DragonBones 3.0
 * @language en_US
 */
export class PixiFactory extends BaseFactory {
  private static _dragonBonesInstance: DragonBones = null as any;
  private static _factory: PixiFactory = null as any;

  private static _clockHandler(ticker: Ticker): void {
    const passedTimeMs: number = ticker.elapsedMS;
    //const passedTimeSec = (passedTimeMs / Ticker.targetFPMS) * 0.001;
    const passedTimeSec = passedTimeMs * 0.001;
    // console.log(passedTimeMs, passedTimeSec, ticker.elapsedMS, Ticker.targetFPMS);
    this._dragonBonesInstance.advanceTime(passedTimeSec);
  }

  /*
   * `passedTime` is elapsed time, specified in seconds.
   */
  public static advanceTime(passedTime: number): void {
    this._dragonBonesInstance.advanceTime(passedTime);
  }

  /*
   * whether use `Ticker.shared`
   */
  public static useSharedTicker: boolean = true;

  /**
   * - A global factory instance that can be used directly.
   * @version DragonBones 4.7
   * @language en_US
   */
  public static get factory(): PixiFactory {
    if (PixiFactory._factory === null) {
      PixiFactory._factory = new PixiFactory(null, PixiFactory.useSharedTicker);
    }

    return PixiFactory._factory;
  }

  /**
   * - A method to obtain a global factory instance (single case). 
   * Compared with get factory, the advantage is that parameters can be passed.
   * @version DragonBones 4.7
   * @language en_US
   */
  public static newInstance(useSharedTicker = true): PixiFactory {
    if (PixiFactory._factory === null) {
      PixiFactory._factory = new PixiFactory(null, useSharedTicker);
    }

    return PixiFactory._factory;
  }
  /**
   * @inheritDoc
   */
  public constructor(
    dataParser: DataParser | null = null,
    useSharedTicker = true
  ) {
    super(dataParser);

    if (PixiFactory._dragonBonesInstance === null) {
      const eventManager = new PixiArmatureDisplay(PIXI.Texture.EMPTY);
      PixiFactory._dragonBonesInstance = new DragonBones(eventManager);
      if (useSharedTicker) {
        Ticker.shared.add(PixiFactory._clockHandler, PixiFactory);
      }
    }

    this._dragonBones = PixiFactory._dragonBonesInstance;
  }

  protected _buildTextureAtlasData(
    textureAtlasData: PixiTextureAtlasData | null,
    textureAtlas: Texture | null
  ): PixiTextureAtlasData {
    if (textureAtlasData) {
      textureAtlasData.renderTexture = textureAtlas;
    } else {
      textureAtlasData = BaseObject.borrowObject(PixiTextureAtlasData);
    }

    return textureAtlasData;
  }

  protected _buildArmature(dataPackage: BuildArmaturePackage): Armature {
    const armature = BaseObject.borrowObject(Armature);
    const armatureDisplay = new PixiArmatureDisplay(PIXI.Texture.EMPTY);

    armature.init(
      dataPackage.armature,
      armatureDisplay,
      armatureDisplay,
      this._dragonBones
    );

    return armature;
  }

  protected _buildSlot(
    _dataPackage: BuildArmaturePackage,
    slotData: SlotData,
    armature: Armature
  ): Slot {
    const slot = BaseObject.borrowObject(PixiSlot);
    slot.init(
      slotData,
      armature,
      new PIXI.Sprite(Texture.EMPTY),
      new MeshSimple({
        texture: Texture.EMPTY,
      })
    );

    return slot;
  }
  /**
   * - Create a armature from cached DragonBonesData instances and TextureAtlasData instances, then use the {@link #clock} to update it.
   * The difference is that the armature created by {@link #buildArmature} is not WorldClock instance update.
   * @param armatureName - The armature data name.
   * @param dragonBonesName - The cached name of the DragonBonesData instance. (If not set, all DragonBonesData instances are retrieved, and when multiple DragonBonesData instances contain a the same name armature data, it may not be possible to accurately create a specific armature)
   * @param skinName - The skin name, you can set a different ArmatureData name to share it's skin data. (If not set, use the default skin data)
   * @returns The armature display container.
   * @see dragonBones.IArmatureProxy
   * @see dragonBones.BaseFactory#buildArmature
   * @version DragonBones 4.5
   * @example
   * <pre>
   *     let armatureDisplay = factory.buildArmatureDisplay("armatureName", "dragonBonesName");
   * </pre>
   * @language en_US
   */
  public buildArmatureDisplay(
    armatureName: string,
    dragonBonesName: string = "",
    skinName: string | null = "",
    textureAtlasName: string = ""
  ): PixiArmatureDisplay | null {
    const armature = this.buildArmature(
      armatureName,
      dragonBonesName || "",
      skinName || "",
      textureAtlasName || ""
    );
    if (armature !== null) {
      this._dragonBones.clock.add(armature);

      return armature.display as PixiArmatureDisplay;
    } else {
      console.warn("Non-existent armature: ", armatureName, dragonBonesName);
    }

    return null;
  }
  /**
   * - Create the display object with the specified texture.
   * @param textureName - The texture data name.
   * @param textureAtlasName - The texture atlas data name (Of not set, all texture atlas data will be searched)
   * @version DragonBones 3.0
   * @language en_US
   */
  public getTextureDisplay(
    textureName: string,
    textureAtlasName: string | null = null
  ): Sprite | null {
    const textureData = this._getTextureData(
      textureAtlasName !== null ? textureAtlasName : "",
      textureName
    ) as PixiTextureData;
    if (textureData !== null && textureData.renderTexture !== null) {
      return new Sprite(textureData.renderTexture);
    }

    return null;
  }
  /**
   * - A global sound event manager.
   * Sound events can be listened to uniformly from the manager.
   * @version DragonBones 4.5
   * @language en_US
   */
  /**
   * - 全局声音事件管理器。
   * 声音事件可以从该管理器统一侦听。
   * @version DragonBones 4.5
   * @language zh_CN
   */
  public get soundEventManager(): PixiArmatureDisplay {
    return this._dragonBones.eventManager as PixiArmatureDisplay;
  }
}
