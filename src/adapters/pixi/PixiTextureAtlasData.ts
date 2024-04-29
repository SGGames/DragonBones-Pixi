import * as PIXI from "pixi.js";
import { TextureAtlasData, TextureData } from "../../dragonBones/model/TextureAtlasData";
import { BaseObject } from "../../dragonBones/core/BaseObject";
import { Texture, Rectangle } from "pixi.js";

/**
 * - The PixiJS texture atlas data.
 * @version DragonBones 3.0
 * @language en_US
 */
export class PixiTextureAtlasData extends TextureAtlasData {
  public static toString(): string {
    return "[class dragonBones.PixiTextureAtlasData]";
  }

  private _renderTexture: Texture | null = null; // Initial value.

  protected _onClear(): void {
    super._onClear();

    if (this._renderTexture !== null) {
      // this._renderTexture.dispose();
    }

    this._renderTexture = null;
  }
  /**
   * @inheritDoc
   */
  public createTexture(): TextureData {
    return BaseObject.borrowObject(PixiTextureData);
  }
  /**
   * - The PixiJS texture.
   * @version DragonBones 3.0
   * @language en_US
   */
  /**
   * - PixiJS 贴图。
   * @version DragonBones 3.0
   * @language zh_CN
   */
  public get renderTexture(): Texture | null {
    return this._renderTexture;
  }
  public set renderTexture(value: Texture | null) {
    if (this._renderTexture === value) {
      return;
    }

    this._renderTexture = value;

    if (this._renderTexture !== null) {
      for (let k in this.textures) {
        const textureData = this.textures[k] as PixiTextureData;
        textureData.renderTexture = new Texture({
          source: this._renderTexture.source,
          frame: new Rectangle(
            textureData.region.x,
            textureData.region.y,
            textureData.region.width,
            textureData.region.height
          ),
          orig: new Rectangle(
            textureData.region.x,
            textureData.region.y,
            textureData.region.width,
            textureData.region.height
          ),
          trim: new Rectangle(
            0,
            0,
            textureData.region.width,
            textureData.region.height
          ),
          rotate: textureData.rotated ? 2 : 0,
          });
      }
    } else {
      for (let k in this.textures) {
        const textureData = this.textures[k] as PixiTextureData;
        textureData.renderTexture = null;
      }
    }
  }
}
/**
 * @internal
 */
export class PixiTextureData extends TextureData {
  public static toString(): string {
    return "[class dragonBones.PixiTextureData]";
  }

  public renderTexture: PIXI.Texture | null = null; // Initial value.

  protected _onClear(): void {
    super._onClear();

    if (this.renderTexture !== null) {
      this.renderTexture.destroy(false);
    }

    this.renderTexture = null;
  }
}
