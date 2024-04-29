/*
//
if (!console.warn) {
  console.warn = function () {};
}

if (!console.assert) {
  console.assert = function () {};
}
//
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

// Weixin can not support typescript extends.
var __extends: any = function (t: any, e: any) {
  function r(this: any) {
    this.constructor = t;
  }
  for (var i in e) {
    if ((e as any).hasOwnProperty(i)) {
      t[i] = e[i];
    }
  }
  (r.prototype = e.prototype), (t.prototype = new (r as any)());
};
//
if (typeof global === "undefined" && typeof window !== "undefined") {
  var global = window as any;
}
//
declare var exports: any;
declare var module: any;
declare var define: any;
if (typeof exports === "object" && typeof module === "object") {
  module.exports = dragonBones;
} else if (typeof define === "function" && define["amd"]) {
  define(["dragonBones"], function () {
    return dragonBones;
  });
} else if (typeof exports === "object") {
  exports = dragonBones;
} else if (typeof global !== "undefined") {
  global.dragonBones = dragonBones;
}
*/

export * from "./core/DragonBones";