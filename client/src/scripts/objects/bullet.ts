import { BloomFilter } from "pixi-filters";
import { Color, Graphics } from "pixi.js";
import { Layer, ObjectCategory, ZIndexes } from "../../../../common/src/constants";
import { BaseBullet, type BulletOptions } from "../../../../common/src/utils/baseBullet";
import { getEffectiveZIndex, isVisibleFromLayer } from "../../../../common/src/utils/layer";
import { Geometry } from "../../../../common/src/utils/math";
import { random, randomFloat, randomRotation } from "../../../../common/src/utils/random";
import { Vec } from "../../../../common/src/utils/vector";
import { type Game } from "../game";
import { MODE, PIXI_SCALE } from "../utils/constants";
import { SuroiSprite, toPixiCoords } from "../utils/pixi";
import type { Building } from "./building";
import { type Obstacle } from "./obstacle";
import { type Player } from "./player";

export class Bullet extends BaseBullet {
    readonly game: Game;
    private readonly _image: SuroiSprite;
    readonly maxLength: number;
    readonly tracerLength: number;

    private _originLayer: Layer;

    private _trailReachedMaxLength = false;
    private _trailTicks = 0;

    private _lastParticleTrail = Date.now();

    constructor(game: Game, options: BulletOptions) {
        super(options);

        this.game = game;

        const tracerStats = this.definition.tracer;

        this._image = new SuroiSprite(tracerStats.image)
            .setRotation(this.rotation - Math.PI / 2)
            .setVPos(toPixiCoords(this.position));

        this.tracerLength = tracerStats.length;
        this.maxLength = this._image.width * this.tracerLength;
        this._image.scale.y = tracerStats.width;
        this._image.alpha = tracerStats.opacity / (this.reflectionCount + 1);
        if (this.game.console.getBuiltInCVar("cv_cooler_graphics")) {
            this._image.filters = new BloomFilter({
                strength: 5
            });
        }

        if (!tracerStats.particle) this._image.anchor.set(1, 0.5);

        const white = 0xFFFFFF;
        const color = new Color(
            tracerStats.color === -1
                ? random(0, white)
                : tracerStats.color ?? white
        );
        if (MODE.bulletTrailAdjust) color.multiply(MODE.bulletTrailAdjust);

        this._image.tint = new Color(color);
        this._originLayer = this.layer;
        this.setLayer(this.layer);

        this.game.camera.addObject(this._image);
    }

    update(delta: number): void {
        const oldLayer = this.layer;
        if (!this.dead) {
            for (const collision of this.updateAndGetCollisions(delta, this.game.objects)) {
                const object = collision.object;

                if (object.isObstacle && object.definition.isStair) {
                    (object as Obstacle).handleStairInteraction(this);
                    continue;
                }

                const { point, normal } = collision.intersection;

                (object as Player | Obstacle | Building).hitEffect(point, Math.atan2(normal.y, normal.x));

                this.damagedIDs.add(object.id);
                this.position = point;
                this.dead = true;
                break;
            }
        }

        if (!this.dead && !this._trailReachedMaxLength) {
            this._trailTicks += delta;
        } else if (this.dead || this.definition.tracer.particle) {
            this._trailTicks -= delta;
        }

        const traveledDistance = Geometry.distance(this.initialPosition, this.position);

        if (this.definition.tracer.particle) {
            this._image.scale.set(1 + (traveledDistance / this.maxDistance));
            this._image.alpha = 2 * this.definition.speed * this._trailTicks / this.maxDistance;

            this._trailReachedMaxLength ||= this._image.alpha >= 1;
        } else {
            const length = Math.min(
                Math.min(
                    this.definition.speed * this._trailTicks,
                    traveledDistance
                ) * PIXI_SCALE,
                this.maxLength
            );
            this._image.width = length;

            this._trailReachedMaxLength ||= length >= this.maxLength;
        }

        this._image.setVPos(toPixiCoords(this.position));

        if (this._originLayer < Layer.Ground && this.layer !== this._originLayer) {
            this.updateMask();
        }

        this.particleTrail();

        if (this._trailTicks <= 0 && this.dead) {
            this.destroy();
        } else if (this.layer === oldLayer) {
            this.updateVisibility();
        }
    }

    particleTrail(): void {
        if (!this.definition.trail) return;
        if (!this.game.console.getBuiltInCVar("cv_cooler_graphics")) return;
        if (Date.now() - this._lastParticleTrail < this.definition.trail.interval) return;

        const trail = this.definition.trail;
        this.game.particleManager.spawnParticles(
            trail.amount ?? 1,
            () => ({
                frames: trail.frame,
                speed: Vec.fromPolar(
                    randomRotation(),
                    randomFloat(trail.spreadSpeed.min, trail.spreadSpeed.max)
                ),
                position: this.position,
                lifetime: random(trail.lifetime.min, trail.lifetime.max),
                zIndex: getEffectiveZIndex(ZIndexes.Bullets - 1, this.layer, this.game.layer),
                scale: randomFloat(trail.scale.min, trail.scale.max),
                alpha: {
                    start: randomFloat(trail.alpha.min, trail.alpha.max),
                    end: 0
                },
                layer: this.layer,
                tint: trail.tint === -1
                    ? new Color({ h: random(0, 6) * 60, s: 60, l: 70 }).toNumber()
                    : trail.tint
            })
        );

        this._lastParticleTrail = Date.now();
    }

    // TODO Make this more efficient
    updateMask(): void {
        const graphics = new Graphics();
        let hasMask = false;
        for (const building of this.game.objects.getCategory(ObjectCategory.Building)) {
            if (!building.definition.bulletMask) continue;
            const hitbox = building.definition.bulletMask.transform(building.position, 1, building.orientation);
            if (!hitbox.isPointInside(this.position)) continue;
            hasMask = true;
            const { min, max } = hitbox;
            graphics
                .beginPath()
                .rect(
                    min.x * PIXI_SCALE,
                    min.y * PIXI_SCALE,
                    (max.x - min.x) * PIXI_SCALE,
                    (max.y - min.y) * PIXI_SCALE
                )
                .closePath()
                .fill(0xffffff);
            graphics.alpha = 0;
            this.game.camera.container.addChild(graphics);
        }
        this._image.mask = hasMask ? graphics : null;
    }

    private setLayer(layer: number): void {
        this.layer = layer;
        this.updateVisibility();
        this._image.zIndex = getEffectiveZIndex(this.definition.tracer.zIndex, this.layer, this.game.layer);
    }

    private updateVisibility(): void {
        if (!this.game.activePlayer) return;

        this._image.visible = isVisibleFromLayer(
            this.game.activePlayer.layer,
            this,
            [...this.game.objects],
            hitbox => hitbox.intersectsLine(this._oldPosition, this.position) !== null
        );
    }

    destroy(): void {
        this._image.destroy();
        this.game.bullets.delete(this);
    }
}
