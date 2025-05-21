/**
     * - The Point object represents a location in a two-dimensional coordinate system.
     * @version DragonBones 3.0
     * @language en_US
     */
    export class Point {
        /**
         * - The horizontal coordinate.
         * @default 0.0
         * @version DragonBones 3.0
         * @language en_US
         */
        public x: number;
        /**
         * - The vertical coordinate.
         * @default 0.0
         * @version DragonBones 3.0
         * @language en_US
         */
        public y: number;
        /**
         * - Creates a new point. If you pass no parameters to this method, a point is created at (0,0).
         * @param x - The horizontal coordinate.
         * @param y - The vertical coordinate.
         * @version DragonBones 3.0
         * @language en_US
         */
        public constructor(x: number = 0.0, y: number = 0.0) {
            this.x = x;
            this.y = y;
        }
        /**
         * @private
         */
        public copyFrom(value: Point): void {
            this.x = value.x;
            this.y = value.y;
        }
        /**
         * @private
         */
        public clear(): void {
            this.x = this.y = 0.0;
        }
    }
