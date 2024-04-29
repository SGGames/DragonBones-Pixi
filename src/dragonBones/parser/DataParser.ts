import {
  ActionType,
  AnimationBlendType,
  ArmatureType,
  BlendMode,
  BoneType,
  BoundingBoxType,
  DisplayType,
  PositionMode,
  RotateMode,
  SpacingMode,
} from "../core/DragonBones";
import { DragonBonesData } from "../model/DragonBonesData";
import { TextureAtlasData } from "../model/TextureAtlasData";

/**
 * @private
 */
export abstract class DataParser {
  static readonly DATA_VERSION_2_3: string = "2.3";
  static readonly DATA_VERSION_3_0: string = "3.0";
  static readonly DATA_VERSION_4_0: string = "4.0";
  static readonly DATA_VERSION_4_5: string = "4.5";
  static readonly DATA_VERSION_5_0: string = "5.0";
  static readonly DATA_VERSION_5_5: string = "5.5";
  static readonly DATA_VERSION_5_6: string = "5.6";
  static readonly DATA_VERSION: string = DataParser.DATA_VERSION_5_6;

  static readonly DATA_VERSIONS: Array<string> = [
    DataParser.DATA_VERSION_4_0,
    DataParser.DATA_VERSION_4_5,
    DataParser.DATA_VERSION_5_0,
    DataParser.DATA_VERSION_5_5,
    DataParser.DATA_VERSION_5_6,
  ];

  static readonly TEXTURE_ATLAS: string = "textureAtlas";
  static readonly SUB_TEXTURE: string = "SubTexture";
  static readonly FORMAT: string = "format";
  static readonly IMAGE_PATH: string = "imagePath";
  static readonly WIDTH: string = "width";
  static readonly HEIGHT: string = "height";
  static readonly ROTATED: string = "rotated";
  static readonly FRAME_X: string = "frameX";
  static readonly FRAME_Y: string = "frameY";
  static readonly FRAME_WIDTH: string = "frameWidth";
  static readonly FRAME_HEIGHT: string = "frameHeight";

  static readonly DRADON_BONES: string = "dragonBones";
  static readonly USER_DATA: string = "userData";
  static readonly ARMATURE: string = "armature";
  static readonly CANVAS: string = "canvas";
  static readonly BONE: string = "bone";
  static readonly SURFACE: string = "surface";
  static readonly SLOT: string = "slot";
  static readonly CONSTRAINT: string = "constraint";
  static readonly SKIN: string = "skin";
  static readonly DISPLAY: string = "display";
  static readonly FRAME: string = "frame";
  static readonly IK: string = "ik";
  static readonly PATH_CONSTRAINT: string = "path";

  static readonly ANIMATION: string = "animation";
  static readonly TIMELINE: string = "timeline";
  static readonly FFD: string = "ffd";
  static readonly TRANSLATE_FRAME: string = "translateFrame";
  static readonly ROTATE_FRAME: string = "rotateFrame";
  static readonly SCALE_FRAME: string = "scaleFrame";
  static readonly DISPLAY_FRAME: string = "displayFrame";
  static readonly COLOR_FRAME: string = "colorFrame";
  static readonly DEFAULT_ACTIONS: string = "defaultActions";
  static readonly ACTIONS: string = "actions";
  static readonly EVENTS: string = "events";

  static readonly INTS: string = "ints";
  static readonly FLOATS: string = "floats";
  static readonly STRINGS: string = "strings";

  static readonly TRANSFORM: string = "transform";
  static readonly PIVOT: string = "pivot";
  static readonly AABB: string = "aabb";
  static readonly COLOR: string = "color";

  static readonly VERSION: string = "version";
  static readonly COMPATIBLE_VERSION: string = "compatibleVersion";
  static readonly FRAME_RATE: string = "frameRate";
  static readonly TYPE: string = "type";
  static readonly SUB_TYPE: string = "subType";
  static readonly NAME: string = "name";
  static readonly PARENT: string = "parent";
  static readonly TARGET: string = "target";
  static readonly STAGE: string = "stage";
  static readonly SHARE: string = "share";
  static readonly PATH: string = "path";
  static readonly LENGTH: string = "length";
  static readonly DISPLAY_INDEX: string = "displayIndex";
  static readonly Z_ORDER: string = "zOrder";
  static readonly Z_INDEX: string = "zIndex";
  static readonly BLEND_MODE: string = "blendMode";
  static readonly INHERIT_TRANSLATION: string = "inheritTranslation";
  static readonly INHERIT_ROTATION: string = "inheritRotation";
  static readonly INHERIT_SCALE: string = "inheritScale";
  static readonly INHERIT_REFLECTION: string = "inheritReflection";
  static readonly INHERIT_ANIMATION: string = "inheritAnimation";
  static readonly INHERIT_DEFORM: string = "inheritDeform";
  static readonly SEGMENT_X: string = "segmentX";
  static readonly SEGMENT_Y: string = "segmentY";
  static readonly BEND_POSITIVE: string = "bendPositive";
  static readonly CHAIN: string = "chain";
  static readonly WEIGHT: string = "weight";

  static readonly BLEND_TYPE: string = "blendType";
  static readonly FADE_IN_TIME: string = "fadeInTime";
  static readonly PLAY_TIMES: string = "playTimes";
  static readonly SCALE: string = "scale";
  static readonly OFFSET: string = "offset";
  static readonly POSITION: string = "position";
  static readonly DURATION: string = "duration";
  static readonly TWEEN_EASING: string = "tweenEasing";
  static readonly TWEEN_ROTATE: string = "tweenRotate";
  static readonly TWEEN_SCALE: string = "tweenScale";
  static readonly CLOCK_WISE: string = "clockwise";
  static readonly CURVE: string = "curve";
  static readonly SOUND: string = "sound";
  static readonly EVENT: string = "event";
  static readonly ACTION: string = "action";

  static readonly X: string = "x";
  static readonly Y: string = "y";
  static readonly SKEW_X: string = "skX";
  static readonly SKEW_Y: string = "skY";
  static readonly SCALE_X: string = "scX";
  static readonly SCALE_Y: string = "scY";
  static readonly VALUE: string = "value";
  static readonly ROTATE: string = "rotate";
  static readonly SKEW: string = "skew";
  static readonly ALPHA: string = "alpha";

  static readonly ALPHA_OFFSET: string = "aO";
  static readonly RED_OFFSET: string = "rO";
  static readonly GREEN_OFFSET: string = "gO";
  static readonly BLUE_OFFSET: string = "bO";
  static readonly ALPHA_MULTIPLIER: string = "aM";
  static readonly RED_MULTIPLIER: string = "rM";
  static readonly GREEN_MULTIPLIER: string = "gM";
  static readonly BLUE_MULTIPLIER: string = "bM";

  static readonly UVS: string = "uvs";
  static readonly VERTICES: string = "vertices";
  static readonly TRIANGLES: string = "triangles";
  static readonly WEIGHTS: string = "weights";
  static readonly SLOT_POSE: string = "slotPose";
  static readonly BONE_POSE: string = "bonePose";

  static readonly BONES: string = "bones";
  static readonly POSITION_MODE: string = "positionMode";
  static readonly SPACING_MODE: string = "spacingMode";
  static readonly ROTATE_MODE: string = "rotateMode";
  static readonly SPACING: string = "spacing";
  static readonly ROTATE_OFFSET: string = "rotateOffset";
  static readonly ROTATE_MIX: string = "rotateMix";
  static readonly TRANSLATE_MIX: string = "translateMix";

  static readonly TARGET_DISPLAY: string = "targetDisplay";
  static readonly CLOSED: string = "closed";
  static readonly CONSTANT_SPEED: string = "constantSpeed";
  static readonly VERTEX_COUNT: string = "vertexCount";
  static readonly LENGTHS: string = "lengths";

  static readonly GOTO_AND_PLAY: string = "gotoAndPlay";

  static readonly DEFAULT_NAME: string = "default";

  static _getArmatureType(value: string): ArmatureType {
    switch (value.toLowerCase()) {
      case "stage":
        return ArmatureType.Stage;

      case "armature":
        return ArmatureType.Armature;

      case "movieclip":
        return ArmatureType.MovieClip;

      default:
        return ArmatureType.Armature;
    }
  }

  static _getBoneType(value: string): BoneType {
    switch (value.toLowerCase()) {
      case "bone":
        return BoneType.Bone;

      case "surface":
        return BoneType.Surface;

      default:
        return BoneType.Bone;
    }
  }

  static _getPositionMode(value: string): PositionMode {
    switch (value.toLocaleLowerCase()) {
      case "percent":
        return PositionMode.Percent;

      case "fixed":
        return PositionMode.Fixed;

      default:
        return PositionMode.Percent;
    }
  }

  static _getSpacingMode(value: string): SpacingMode {
    switch (value.toLocaleLowerCase()) {
      case "length":
        return SpacingMode.Length;

      case "percent":
        return SpacingMode.Percent;

      case "fixed":
        return SpacingMode.Fixed;

      default:
        return SpacingMode.Length;
    }
  }

  static _getRotateMode(value: string): RotateMode {
    switch (value.toLocaleLowerCase()) {
      case "tangent":
        return RotateMode.Tangent;

      case "chain":
        return RotateMode.Chain;

      case "chainscale":
        return RotateMode.ChainScale;

      default:
        return RotateMode.Tangent;
    }
  }

  static _getDisplayType(value: string): DisplayType {
    switch (value.toLowerCase()) {
      case "image":
        return DisplayType.Image;

      case "mesh":
        return DisplayType.Mesh;

      case "armature":
        return DisplayType.Armature;

      case "boundingbox":
        return DisplayType.BoundingBox;

      case "path":
        return DisplayType.Path;

      default:
        return DisplayType.Image;
    }
  }

  static _getBoundingBoxType(value: string): BoundingBoxType {
    switch (value.toLowerCase()) {
      case "rectangle":
        return BoundingBoxType.Rectangle;

      case "ellipse":
        return BoundingBoxType.Ellipse;

      case "polygon":
        return BoundingBoxType.Polygon;

      default:
        return BoundingBoxType.Rectangle;
    }
  }

  static _getBlendMode(value: string): BlendMode {
    switch (value.toLowerCase()) {
      case "normal":
        return BlendMode.Normal;

      case "add":
        return BlendMode.Add;

      case "alpha":
        return BlendMode.Alpha;

      case "darken":
        return BlendMode.Darken;

      case "difference":
        return BlendMode.Difference;

      case "erase":
        return BlendMode.Erase;

      case "hardlight":
        return BlendMode.HardLight;

      case "invert":
        return BlendMode.Invert;

      case "layer":
        return BlendMode.Layer;

      case "lighten":
        return BlendMode.Lighten;

      case "multiply":
        return BlendMode.Multiply;

      case "overlay":
        return BlendMode.Overlay;

      case "screen":
        return BlendMode.Screen;

      case "subtract":
        return BlendMode.Subtract;

      default:
        return BlendMode.Normal;
    }
  }

  static _getAnimationBlendType(value: string): AnimationBlendType {
    switch (value.toLowerCase()) {
      case "none":
        return AnimationBlendType.None;

      case "1d":
        return AnimationBlendType.E1D;

      default:
        return AnimationBlendType.None;
    }
  }

  static _getActionType(value: string): ActionType {
    switch (value.toLowerCase()) {
      case "play":
        return ActionType.Play;

      case "frame":
        return ActionType.Frame;

      case "sound":
        return ActionType.Sound;

      default:
        return ActionType.Play;
    }
  }

  public abstract parseDragonBonesData(
    rawData: any,
    scale: number
  ): DragonBonesData | null;
  public abstract parseTextureAtlasData(
    rawData: any,
    textureAtlasData: TextureAtlasData,
    scale: number
  ): boolean;
}
