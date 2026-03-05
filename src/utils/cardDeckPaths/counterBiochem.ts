import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const counterBiochemDecks = createShardLoaders(
    "counter_biochem",
    [
        "counter_biochem_biochem_defense_protocols_airborne_pathogen_defense",
        "counter_biochem_biochem_defense_protocols_chemical_shielding_tactics",
        "counter_biochem_biochem_defense_protocols_hazmat_safety_training",
        "counter_biochem_biochem_survival_medicine_emergency_first_aid_for_biochem_exposure",
        "counter_biochem_biochem_survival_medicine_holistic_and_herbal_remedies",
        "counter_biochem_biochem_survival_medicine_survival_treatment_in_hostile_environments",
        "counter_biochem_contagion_containment_strategies_emergency_containment_protocols",
        "counter_biochem_contagion_containment_strategies_infection_control_tactics",
        "counter_biochem_contagion_containment_strategies_quarantine_zone_management",
        "counter_biochem_food_water_supply_protection_detecting_tainted_food_sources",
        "counter_biochem_food_water_supply_protection_supply_chain_protection_tactics",
        "counter_biochem_food_water_supply_protection_water_supply_purification_methods",
        "counter_biochem_medical_psyops_resistance_combatting_psyops_in_healthcare",
        "counter_biochem_medical_psyops_resistance_detecting_medical_disinformation",
        "counter_biochem_medical_psyops_resistance_verifying_legitimate_treatments",
        "counter_biochem_toxin_neutralization_tactics_antidote_and_detox_methods",
        "counter_biochem_toxin_neutralization_tactics_biochem_emergency_treatment",
        "counter_biochem_toxin_neutralization_tactics_toxin_detection_and_testing"
    ] as const
);

export default counterBiochemDecks as CardDeckPathMap;
