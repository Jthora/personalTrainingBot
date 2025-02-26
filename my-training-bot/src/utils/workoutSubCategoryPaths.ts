export const workoutSubCategoryPaths: { [key: string]: () => Promise<any> } = {
    aegis_fang_combat_system_ambidextrous_weapon_training: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/ambidextrous_weapon_training.json"),
    aegis_fang_combat_system_blade_transitions: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/blade_transitions.json"),
    aegis_fang_combat_system_buckler_defense_tactics: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/buckler_defense_tactics.json"),
    aegis_fang_combat_system_combat_positioning: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/combat_positioning.json"),
    aegis_fang_combat_system_dual_weapon_fundamentals: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/dual_weapon_fundamentals.json"),
    aegis_fang_combat_system_flow_drills: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/flow_drills.json"),
    aegis_fang_combat_system_offensive_defensive_synergy: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/offensive_defensive_synergy.json"),
    aegis_fang_combat_system_pistol_and_grenade_incorporation: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/pistol_and_grenade_incorporation.json"),
    aegis_fang_combat_system_reaction_training: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/reaction_training.json"),
    aegis_fang_combat_system_tactical_application: () => import("../data/training_coach_data/workouts/subcategories/aegis_fang_combat_system/tactical_application.json"),
    agility_change_of_direction: () => import("../data/training_coach_data/workouts/subcategories/agility/change_of_direction.json"),
    agility_footwork: () => import("../data/training_coach_data/workouts/subcategories/agility/footwork.json"),
    agility_jo_staff_agility: () => import("../data/training_coach_data/workouts/subcategories/agility/jo_staff_agility.json"),
    agility_jumping: () => import("../data/training_coach_data/workouts/subcategories/agility/jumping.json"),
    agility_quickness: () => import("../data/training_coach_data/workouts/subcategories/agility/quickness.json"),
    agility_reaction: () => import("../data/training_coach_data/workouts/subcategories/agility/reaction.json"),
    agility_weapon_handling: () => import("../data/training_coach_data/workouts/subcategories/agility/weapon_handling.json"),
    balance_core_control: () => import("../data/training_coach_data/workouts/subcategories/balance/core_control.json"),
    balance_dynamic_balance: () => import("../data/training_coach_data/workouts/subcategories/balance/dynamic_balance.json"),
    balance_single_leg: () => import("../data/training_coach_data/workouts/subcategories/balance/single_leg.json"),
    balance_stability: () => import("../data/training_coach_data/workouts/subcategories/balance/stability.json"),
    cardio_breathing: () => import("../data/training_coach_data/workouts/subcategories/cardio/breathing.json"),
    cardio_endurance: () => import("../data/training_coach_data/workouts/subcategories/cardio/endurance.json"),
    cardio_speed: () => import("../data/training_coach_data/workouts/subcategories/cardio/speed.json"),
    combat_grappling: () => import("../data/training_coach_data/workouts/subcategories/combat/grappling.json"),
    combat_gun_draw: () => import("../data/training_coach_data/workouts/subcategories/combat/gun_draw.json"),
    combat_jo_staff_fighting: () => import("../data/training_coach_data/workouts/subcategories/combat/jo_staff_fighting.json"),
    combat_striking: () => import("../data/training_coach_data/workouts/subcategories/combat/striking.json"),
    coordination_balance: () => import("../data/training_coach_data/workouts/subcategories/coordination/balance.json"),
    coordination_foot_eye: () => import("../data/training_coach_data/workouts/subcategories/coordination/foot_eye.json"),
    coordination_hand_eye: () => import("../data/training_coach_data/workouts/subcategories/coordination/hand_eye.json"),
    coordination_jo_staff_spins: () => import("../data/training_coach_data/workouts/subcategories/coordination/jo_staff_spins.json"),
    coordination_reaction_time: () => import("../data/training_coach_data/workouts/subcategories/coordination/reaction_time.json"),
    endurance_cardiovascular: () => import("../data/training_coach_data/workouts/subcategories/endurance/cardiovascular.json"),
    endurance_mental: () => import("../data/training_coach_data/workouts/subcategories/endurance/mental.json"),
    endurance_muscular: () => import("../data/training_coach_data/workouts/subcategories/endurance/muscular.json"),
    jono_thora_agility_mobility_and_acrobatics: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/agility_mobility_and_acrobatics.json"),
    jono_thora_combat_readiness_conditioning: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/combat_readiness_conditioning.json"),
    jono_thora_raver_super_hero_dance_combat: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/raver_super_hero_dance_combat.json"),
    jono_thora_recovery_flexibility_and_injury_prevention: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/recovery_flexibility_and_injury_prevention.json"),
    jono_thora_strength_and_endurance: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/strength_and_endurance.json"),
    jono_thora_tactical_conditioning_and_situation_awareness: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/tactical_conditioning_and_situation_awareness.json"),
    jono_thora_warrior_core_and_mental_resilience: () => import("../data/training_coach_data/workouts/subcategories/jono_thora/warrior_core_and_mental_resilience.json"),
    mental_breathing: () => import("../data/training_coach_data/workouts/subcategories/mental/breathing.json"),
    mental_focus: () => import("../data/training_coach_data/workouts/subcategories/mental/focus.json"),
    mental_meditation: () => import("../data/training_coach_data/workouts/subcategories/mental/meditation.json"),
    mental_mindset: () => import("../data/training_coach_data/workouts/subcategories/mental/mindset.json"),
    mental_visualization: () => import("../data/training_coach_data/workouts/subcategories/mental/visualization.json"),
    mobility_dynamic_stretching: () => import("../data/training_coach_data/workouts/subcategories/mobility/dynamic_stretching.json"),
    mobility_foam_rolling: () => import("../data/training_coach_data/workouts/subcategories/mobility/foam_rolling.json"),
    mobility_joint_mobility: () => import("../data/training_coach_data/workouts/subcategories/mobility/joint_mobility.json"),
    mobility_static_stretching: () => import("../data/training_coach_data/workouts/subcategories/mobility/static_stretching.json"),
    strength_bodybuilding: () => import("../data/training_coach_data/workouts/subcategories/strength/bodybuilding.json"),
    strength_core: () => import("../data/training_coach_data/workouts/subcategories/strength/core.json"),
    strength_flexibility: () => import("../data/training_coach_data/workouts/subcategories/strength/flexibility.json"),
    strength_grip: () => import("../data/training_coach_data/workouts/subcategories/strength/grip.json"),
    strength_lower_body: () => import("../data/training_coach_data/workouts/subcategories/strength/lower_body.json"),
    strength_powerlifting: () => import("../data/training_coach_data/workouts/subcategories/strength/powerlifting.json"),
    strength_upper_body: () => import("../data/training_coach_data/workouts/subcategories/strength/upper_body.json"),
    superhero_agility_and_reflex: () => import("../data/training_coach_data/workouts/subcategories/superhero/agility_and_reflex.json"),
    superhero_combat_and_survival: () => import("../data/training_coach_data/workouts/subcategories/superhero/combat_and_survival.json"),
    superhero_endurance_and_survival: () => import("../data/training_coach_data/workouts/subcategories/superhero/endurance_and_survival.json"),
    superhero_psionic_and_sensory: () => import("../data/training_coach_data/workouts/subcategories/superhero/psionic_and_sensory.json"),
    superhero_strength_and_power: () => import("../data/training_coach_data/workouts/subcategories/superhero/strength_and_power.json"),
    superhero_super_and_hyper: () => import("../data/training_coach_data/workouts/subcategories/superhero/super_and_hyper.json")
};

export const totalWorkoutSubCategories = Object.keys(workoutSubCategoryPaths).length;
