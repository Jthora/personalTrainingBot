import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const espionageDecks = createShardLoaders(
    "espionage",
    [
        "espionage_clandestine_surveillance_shadowing_techniques",
        "espionage_clandestine_surveillance_signal_interception",
        "espionage_clandestine_surveillance_vehicle_tailing",
        "espionage_counterintelligence_disinformation_strategies",
        "espionage_counterintelligence_double_agent_management",
        "espionage_counterintelligence_spy_identification",
        "espionage_covert_operations_covert_sabotage",
        "espionage_covert_operations_escape_and_evasion",
        "espionage_covert_operations_undercover_roles",
        "espionage_disguise_and_identity_costume_and_makeup",
        "espionage_disguise_and_identity_identity_forging",
        "espionage_disguise_and_identity_social_deception",
        "espionage_psychological_manipulation_coercion_methods",
        "espionage_psychological_manipulation_emotional_exploitation",
        "espionage_psychological_manipulation_persuasion_and_influence",
        "espionage_tradecraft_dead_drop_methods",
        "espionage_tradecraft_encryption_and_decryption",
        "espionage_tradecraft_secure_messaging"
    ] as const
);

export default espionageDecks as CardDeckPathMap;
