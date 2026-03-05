import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const spaceForceDecks = createShardLoaders(
    "space_force",
    [
        "space_force_cyber_defense_cyber_threat_response",
        "space_force_cyber_defense_network_security",
        "space_force_cyber_defense_zero_trust",
        "space_force_fleet_coordination_protocols_formation_link_management",
        "space_force_intelligence_and_analysis_intel_fusion_cell_ops",
        "space_force_intelligence_and_analysis_joint_multi_domain_ops",
        "space_force_intelligence_and_analysis_space_isr",
        "space_force_joint_space_operations_joint_c2_rehearsal",
        "space_force_leadership_and_professionalism_emotional_intelligence",
        "space_force_leadership_and_professionalism_ethical_decision_making",
        "space_force_microgravity_readiness_vestibular_adaptation_drills",
        "space_force_nebula_siege_resilience_siege_resilience_leadership",
        "space_force_orbital_operations_planning_rapid_orbit_planning",
        "space_force_orbital_tactics_command_orbital_strike_packages",
        "space_force_physical_and_resilience_mental_toughness",
        "space_force_physical_and_resilience_ussf_fitness_standards",
        "space_force_space_contingency_resilience_contingency_anomaly_response",
        "space_force_space_operations_orbital_mechanics",
        "space_force_space_operations_satellite_systems",
        "space_force_space_operations_space_domain_awareness",
        "space_force_zero_gravity_conditioning_zero_g_strength_block"
    ] as const
);

export default spaceForceDecks as CardDeckPathMap;
