import { ModelStats } from "../utils/model-stats.js";
import { ModelBounds } from "../utils/model-utils.js";

export class StatsPanel {

    private readonly content:
        HTMLElement | null;

    constructor() {

        this.content =
            document.getElementById(
                "stats-content"
            );
    }

    update(
        stats: ModelStats,
        bounds: ModelBounds
    ): void {

        if (!this.content) {
            return;
        }

        const x =
            bounds.size.x.toFixed(2);

        const y =
            bounds.size.y.toFixed(2);

        const z =
            bounds.size.z.toFixed(2);

        this.content.innerHTML = `
            <div class="stats-title">
                MODEL
            </div>

            <div class="stat-row">
                <span>Meshes</span>
                <strong>
                    ${stats.meshes}
                </strong>
            </div>

            <div class="stat-row">
                <span>Vertices</span>
                <strong>
                    ${formatNumber(stats.vertices)}
                </strong>
            </div>

            <div class="stat-row">
                <span>Triangles</span>
                <strong>
                    ${formatNumber(stats.triangles)}
                </strong>
            </div>

            <div class="stat-row">
                <span>Materials</span>
                <strong>
                    ${stats.materials}
                </strong>
            </div>

            <div class="stat-row">
                <span>Textures</span>
                <strong>
                    ${stats.textures}
                </strong>
            </div>

            <div class="stats-divider"></div>

            <div class="stats-title">
                DIMENSIONS
            </div>

            <div class="stat-row">
                <span>X</span>
                <strong>
                    ${x}
                </strong>
            </div>

            <div class="stat-row">
                <span>Y</span>
                <strong>
                    ${y}
                </strong>
            </div>

            <div class="stat-row">
                <span>Z</span>
                <strong>
                    ${z}
                </strong>
            </div>
        `;
    }

    clear(): void {

        if (this.content) {
            this.content.innerHTML = "";
        }
    }
}

function formatNumber(
    value: number
): string {

    return Math.round(value)
        .toLocaleString();
}