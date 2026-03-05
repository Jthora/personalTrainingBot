import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const combatDecks = createShardLoaders(
    "combat",
    [
        "combat_close_quarters_combat_ground_fighting",
        "combat_close_quarters_combat_striking_and_counterattacks",
        "combat_close_quarters_combat_weapon_disarm_tactics",
        "combat_combat_scenario_simulation_high_stress_drills",
        "combat_combat_scenario_simulation_live_fire_simulations",
        "combat_combat_scenario_simulation_mission_based_training",
        "combat_firearms_training_close_range_shooting",
        "combat_firearms_training_pistol_shooting_drills",
        "combat_firearms_training_rifle_tactics",
        "combat_melee_weapons_training_baton_defensive_moves",
        "combat_melee_weapons_training_knife_fighting_tactics",
        "combat_melee_weapons_training_weapon_retention_drills",
        "combat_stealth_and_escape_tactics_camouflage_and_blending",
        "combat_stealth_and_escape_tactics_hostile_escape_tactics",
        "combat_stealth_and_escape_tactics_silent_movement_training",
        "combat_tactical_movement_cover_usage_tactics",
        "combat_tactical_movement_fire_and_maneuver",
        "combat_tactical_movement_urban_combat_movement"
    ] as const
);

export default combatDecks as CardDeckPathMap;
