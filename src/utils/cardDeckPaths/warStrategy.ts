import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const warStrategyDecks = createShardLoaders(
    "war_strategy",
    [
        "war_strategy_asymmetric_warfare_counter_terrorism_operations",
        "war_strategy_asymmetric_warfare_insurgency_tactics",
        "war_strategy_asymmetric_warfare_urban_warfare_strategies",
        "war_strategy_cyber_warfare_strategy_cyber_intelligence_operations",
        "war_strategy_cyber_warfare_strategy_defensive_network_security",
        "war_strategy_cyber_warfare_strategy_offensive_cyber_tactics",
        "war_strategy_geopolitical_analysis_economic_sanctions_tactics",
        "war_strategy_geopolitical_analysis_global_conflict_trends",
        "war_strategy_geopolitical_analysis_political_warfare_analysis",
        "war_strategy_military_strategy_combined_arms_operations",
        "war_strategy_military_strategy_force_maneuvering",
        "war_strategy_military_strategy_supply_chain_tactics",
        "war_strategy_psychological_operations_tactics_counter_psyops_strategies",
        "war_strategy_psychological_operations_tactics_covert_psychological_warfare",
        "war_strategy_psychological_operations_tactics_influence_campaigns",
        "war_strategy_special_operations_planning_covert_infiltration_methods",
        "war_strategy_special_operations_planning_extraction_and_escape_tactics",
        "war_strategy_special_operations_planning_mission_planning_and_execution"
    ] as const
);

export default warStrategyDecks as CardDeckPathMap;
