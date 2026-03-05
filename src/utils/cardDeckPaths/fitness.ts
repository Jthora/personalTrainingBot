import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const fitnessDecks = createShardLoaders(
    "fitness",
    [
        "fitness_athletic_performance_olympic_lifting_basics",
        "fitness_athletic_performance_reaction_time_drills",
        "fitness_athletic_performance_speed_endurance_training",
        "fitness_balance_and_stability_bosu_ball_exercises",
        "fitness_balance_and_stability_dynamic_balance_training",
        "fitness_balance_and_stability_single_leg_stability_drills",
        "fitness_calisthenics_bodyweight_leg_workouts",
        "fitness_calisthenics_pullup_and_dip_training",
        "fitness_calisthenics_pushup_variations",
        "fitness_cardiovascular_endurance_cycling_endurance",
        "fitness_cardiovascular_endurance_interval_running",
        "fitness_cardiovascular_endurance_steady_state_cardio",
        "fitness_core_strengthening_dynamic_core_workouts",
        "fitness_core_strengthening_planks_and_static_holds",
        "fitness_core_strengthening_rotational_core_exercises",
        "fitness_flexibility_and_mobility_dynamic_warmups",
        "fitness_flexibility_and_mobility_foam_rolling_and_massage",
        "fitness_flexibility_and_mobility_static_stretching",
        "fitness_functional_fitness_kettlebell_workouts",
        "fitness_functional_fitness_resistance_band_exercises",
        "fitness_functional_fitness_sandbag_training",
        "fitness_high_intensity_interval_training_circuit_training",
        "fitness_high_intensity_interval_training_sprint_intervals",
        "fitness_high_intensity_interval_training_tabata_protocol",
        "fitness_mind_body_fitness_breathwork_and_meditation",
        "fitness_mind_body_fitness_tai_chi_sequences",
        "fitness_mind_body_fitness_yoga_flows",
        "fitness_recovery_and_injury_prevention_mobility_routines",
        "fitness_recovery_and_injury_prevention_rehabilitative_exercises",
        "fitness_recovery_and_injury_prevention_self_myofascial_release",
        "fitness_speed_and_agility_ladder_drills",
        "fitness_speed_and_agility_plyometric_workouts",
        "fitness_speed_and_agility_sprint_training",
        "fitness_strength_training_compound_lifts",
        "fitness_strength_training_isolation_exercises",
        "fitness_strength_training_strength_periodization"
    ] as const
);

export default fitnessDecks as CardDeckPathMap;
