﻿import { Transition, AndroidTransitionType } from "./transition";
import { start } from "../../profiling/profiling";

// http://developer.android.com/training/animation/cardflip.html
export class FlipTransition extends Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
        ensureRotate3dAnimationClass();

        let animation: android.view.animation.Animation;
        const animationSet = new android.view.animation.AnimationSet(false /* shareInterpolator */);
        const fullDuration = this.getDuration() || 300;
        const interpolator = this.getCurve();
        const rotationY = this._direction === "right" ? 180 : -180;

        switch (transitionType) {
            case AndroidTransitionType.enter: // card_flip_right_in
                // animation = new android.view.animation.AlphaAnimation(1.0, 0.0);
                // animation.setDuration(0);
                // animationSet.addAnimation(animation);

                animation = new Rotate3dAnimationClass(rotationY, 0.0, 0.5, 0.5);
                animation.setInterpolator(interpolator);
                animation.setDuration(fullDuration);
                animationSet.addAnimation(animation);

                // animation = new android.view.animation.AlphaAnimation(0.0, 1.0);
                // animation.setStartOffset(fullDuration / 2);
                // animation.setDuration(1);
                // animationSet.addAnimation(animation);
                break;
            case AndroidTransitionType.exit: // card_flip_right_out
                animation = new Rotate3dAnimationClass(0.0, -rotationY, 0.5, 0.5);
                animation.setInterpolator(interpolator);
                animation.setDuration(fullDuration);
                animationSet.addAnimation(animation);

                // animation = new android.view.animation.AlphaAnimation(1.0, 0.0);
                // animation.setStartOffset(fullDuration / 2);
                // animation.setDuration(1);
                // animationSet.addAnimation(animation);

                break;
            case AndroidTransitionType.popEnter: // card_flip_left_in
                // animation = new android.view.animation.AlphaAnimation(1.0, 0.0);
                // animation.setDuration(0);
                // animationSet.addAnimation(animation);

                animation = new Rotate3dAnimationClass(-rotationY, 0.0, 0.5, 0.5);
                animation.setInterpolator(interpolator);
                animation.setDuration(fullDuration);
                animationSet.addAnimation(animation);

                // animation = new android.view.animation.AlphaAnimation(0.0, 1.0);
                // animation.setStartOffset(fullDuration / 2);
                // animation.setDuration(1);
                // animationSet.addAnimation(animation);
                break;
            case AndroidTransitionType.popExit: // card_flip_left_out
                animation = new Rotate3dAnimationClass(0.0, rotationY, 0.5, 0.5);
                animation.setInterpolator(interpolator);
                animation.setDuration(fullDuration);
                animationSet.addAnimation(animation);

                // animation = new android.view.animation.AlphaAnimation(1.0, 0.0);
                // animation.setStartOffset(fullDuration / 2);
                // animation.setDuration(1);
                // animationSet.addAnimation(animation);
                break;
        }

        return animationSet;
    }
}

let Rotate3dAnimationClass;
function ensureRotate3dAnimationClass() {
    if (Rotate3dAnimationClass) {
        return;
    }

    /**
     * Creates a new 3D rotation on the Y axis. The rotation is defined by its
     * start angle and its end angle. Both angles are in degrees. The rotation
     * is performed around a center point on the 2D space, definied by a pair
     * of X and Y coordinates, called centerX and centerY. When the animation
     * starts, a translation on the Z axis (depth) is performed. The length
     * of the translation can be specified, as well as whether the translation
     * should be reversed in time.
     *
     * @param fromDegrees the start angle of the 3D rotation
     * @param toDegrees the end angle of the 3D rotation
     * @param centerX the X center of the 3D rotation (relative to self)
     * @param centerY the Y center of the 3D rotation (relative to self)
     */
    class Rotate3dAnimation extends android.view.animation.Animation {
        private _camera: android.graphics.Camera;
        private _pivotX: number;
        private _pivotY: number;

        constructor(
            private _fromDegrees: number,
            private _toDegrees: number,
            private _centerX: number,
            private _centerY: number) {
            super();
            return global.__native(this);
        }

        public initialize(width: number, height: number, parentWidth: number, parentHeight: number) {
            super.initialize(width, height, parentWidth, parentHeight);
            this._pivotX = this.resolveSize(android.view.animation.Animation.RELATIVE_TO_SELF, this._centerX, width, parentWidth);
            this._pivotY = this.resolveSize(android.view.animation.Animation.RELATIVE_TO_SELF, this._centerY, height, parentHeight);
            this._camera = new android.graphics.Camera();
        }

        public applyTransformation(interpolatedTime: number, t: android.view.animation.Transformation) {
            const fromDegrees = this._fromDegrees;
            const degrees = fromDegrees + ((this._toDegrees - fromDegrees) * interpolatedTime);

            const pivotX = this._pivotX;
            const pivotY = this._pivotY;
            const camera = this._camera;

            const matrix: android.graphics.Matrix = t.getMatrix();

            camera.save();
            camera.rotateY(degrees);
            camera.getMatrix(matrix);
            camera.restore();

            matrix.preTranslate(-pivotX, -pivotY);
            matrix.postTranslate(pivotX, pivotY);
        }
    }

    Rotate3dAnimationClass = Rotate3dAnimation;
}