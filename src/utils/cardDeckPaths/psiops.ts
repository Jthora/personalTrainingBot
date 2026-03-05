import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const psiopsDecks = createShardLoaders(
    "psiops",
    [
        "psiops_clairvoyance_and_telepathy_clairvoyant_perception",
        "psiops_clairvoyance_and_telepathy_mind_to_mind_communication",
        "psiops_clairvoyance_and_telepathy_prophetic_dreams",
        "psiops_energy_manipulation_aura_sensing_and_control",
        "psiops_energy_manipulation_energy_channeling",
        "psiops_energy_manipulation_psionic_deflection",
        "psiops_psi_fields_psi_energy_and_field_theoretical_concepts",
        "psiops_psi_fields_psi_field_equations_advanced",
        "psiops_psi_fields_psi_field_equations_basic",
        "psiops_psi_fields_psi_field_fundamentals",
        "psiops_psi_fields_psi_field_interaction_models",
        "psiops_psi_fields_psi_field_symbol_and_equation_breakdown",
        "psiops_psionic_training_mental_energy_control",
        "psiops_psionic_training_psi_exercises",
        "psiops_psionic_training_psionic_meditation",
        "psiops_psionic_weaponry_energy_weapons_training",
        "psiops_psionic_weaponry_psi_blade_techniques",
        "psiops_psionic_weaponry_telekinetic_strikes",
        "psiops_psychic_shielding_anti_psychic_countermeasures",
        "psiops_psychic_shielding_energy_barriers",
        "psiops_psychic_shielding_mental_fortress_building",
        "psiops_remote_viewing_controlled_viewing_methods",
        "psiops_remote_viewing_psychic_perception",
        "psiops_remote_viewing_target_acquisition"
    ] as const
);

export default psiopsDecks as CardDeckPathMap;
