import { ObjectCategory, ZIndexes } from "@common/constants";
import { type ThrowableDefinition } from "@common/definitions/items/throwables";
import { CircleHitbox } from "@common/utils/hitbox";
import { getEffectiveZIndex } from "@common/utils/layer";
import { Numeric, PI } from "@common/utils/math";
import { type ObjectsNetData } from "@common/utils/objectsSerializations";
import { randomBoolean, randomFloat } from "@common/utils/random";
import { FloorNames, FloorTypes } from "@common/utils/terrain";
import { Vec, type Vector } from "@common/utils/vector";
import { Game } from "../game";
import { SoundManager, type GameSound } from "../managers/soundManager";
import { DIFF_LAYER_HITBOX_OPACITY, HITBOX_COLORS, TEAMMATE_COLORS } from "../utils/constants";
import { SuroiSprite, toPixiCoords } from "../utils/pixi";
import { type Tween } from "../utils/tween";
import { GameObject } from "./gameObject";
import { DebugRenderer } from "../utils/debugRenderer";
import { MapManager } from "../managers/mapManager";
import { GameConsole } from "../console/gameConsole";
import { ParticleManager } from "../managers/particleManager";

export class ThrowableProjectile extends GameObject.derive(ObjectCategory.ThrowableProjectile) {
    readonly image = new SuroiSprite();
    readonly waterOverlay = new SuroiSprite("water_overlay").setVisible(false).setScale(0.75);

    private _definition!: ThrowableDefinition;
    get definition(): ThrowableDefinition { return this._definition; }

    private _waterAnim?: Tween<SuroiSprite>;

    halloweenSkin = false;

    radius?: number;
    hitbox: CircleHitbox;
    hitSound?: GameSound;

    floorType: FloorNames = FloorNames.Grass;

    constructor(id: number, data: ObjectsNetData[ObjectCategory.ThrowableProjectile]) {
        super(id);

        this.hitbox = new CircleHitbox(1, this.position);

        this.waterOverlay.setTint(Game.colors.water);
        this.container.addChild(this.image, this.waterOverlay);
        this.layer = data.layer;
        this.updateFromData(data, true);
    }

    override updateFromData(data: ObjectsNetData[ObjectCategory.ThrowableProjectile], isNew = false): void {
        if (data.full) {
            const def = this._definition ??= data.full.definition;

            this.radius = this._definition.hitboxRadius;

            this.halloweenSkin = data.full.halloweenSkin;

            this.image.setFrame(`${def.animation.liveImage}${this.halloweenSkin && !def.noSkin ? "_halloween" : ""}`);

            const throwerTeamID = data.throwerTeamID;
            const tintIndex = data.full.tintIndex;

            // Tint the C4 if it's a teammate's one, based on their position color on the team.
            if (Game.teamMode && Game.teamID === throwerTeamID && this.definition.c4) {
                this.image.setTint(TEAMMATE_COLORS[tintIndex]);
            }
        }

        if (data.activated && this._definition?.animation.activatedImage) {
            let frame = this._definition.animation.activatedImage;

            if (this.halloweenSkin) {
                frame += "_halloween";
            }

            this.image.setFrame(frame);
        }

        this.position = data.position;
        this.rotation = data.rotation;
        this.hitbox.radius = this.radius ?? 1;
        this.hitbox.position = this.position;
        this.layer = data.layer;

        if (data.airborne) {
            this.container.zIndex = getEffectiveZIndex(ZIndexes.AirborneThrowables, this.layer, Game.layer);
        } else {
            const floorType = MapManager.terrain.getFloor(this.position, this.layer);
            const doOverlay = FloorTypes[floorType].overlay;

            this.container.zIndex = getEffectiveZIndex(doOverlay ? ZIndexes.UnderwaterGroundedThrowables : ZIndexes.GroundedThrowables, this.layer, Game.layer);

            if (floorType !== this.floorType) {
                if (doOverlay) this.waterOverlay.setVisible(true);

                this._waterAnim?.kill();
                this._waterAnim = Game.addTween({
                    target: this.waterOverlay,
                    to: {
                        alpha: doOverlay ? 1 : 0
                    },
                    duration: 200,
                    onComplete: () => {
                        if (!doOverlay) this.waterOverlay.setVisible(false);
                        this._waterAnim = undefined;
                    }
                });
            }
            this.floorType = floorType;
        }

        if (!GameConsole.getBuiltInCVar("cv_movement_smoothing") || isNew) {
            this.container.position = toPixiCoords(this.position);
            this.container.rotation = this.rotation;
        }
    }

    override updateZIndex(): void {
        this.container.zIndex = getEffectiveZIndex(this.doOverlay() ? ZIndexes.UnderwaterGroundedThrowables : ZIndexes.GroundedThrowables, this.layer, Game.layer);
    }

    override updateDebugGraphics(): void {
        if (!DEBUG_CLIENT) return;
        if (!this.radius) return;
        DebugRenderer.addHitbox(
            this.hitbox,
            HITBOX_COLORS.projectiles,
            this.layer === Game.layer ? 1 : DIFF_LAYER_HITBOX_OPACITY
        );
    }

    override update(): void { /* bleh */ }

    override updateInterpolation(): void {
        this.updateContainerPosition();
        this.updateContainerRotation();
    }

    hitEffect(position: Vector, angle: number): void {
        if (!this.definition.c4) return;

        this.hitSound?.stop();
        this.hitSound = SoundManager.play(
            `stone_hit_${randomBoolean() ? "1" : "2"}`,
            {
                position,
                falloff: 0.2,
                maxRange: 96
            }
        );

        ParticleManager.spawnParticles(4, () => {
            return {
                frames: this.halloweenSkin ? "plumpkin_particle" : "metal_particle",
                position,
                layer: this.layer,
                zIndex: Numeric.max(ZIndexes.Players + 1, 4),
                lifetime: 600,
                scale: { start: 0.9, end: 0.2 },
                alpha: { start: 1, end: 0.65 },
                speed: Vec.fromPolar((angle + randomFloat(0, 2 * PI)), randomFloat(2.5, 4.5))
            };
        });
    }

    override destroy(): void {
        super.destroy();
        this.image.destroy();
    }
}
