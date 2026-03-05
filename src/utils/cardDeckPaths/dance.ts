import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const danceDecks = createShardLoaders(
    "dance",
    [
        "dance_breakdance_basic_toprock_moves",
        "dance_breakdance_freeze_techniques",
        "dance_contact_staff_flow_advanced_flourishes",
        "dance_contact_staff_flow_spins_and_transitions",
        "dance_cutting_shapes_heel_toe_variations",
        "dance_cutting_shapes_speed_training",
        "dance_dubstep_glitch_bass_drop_isolations",
        "dance_dubstep_glitch_slow_motion_effects",
        "dance_fan_dancing_precision_fan_techniques",
        "dance_fan_dancing_veil_twirls",
        "dance_freestyle_rave_body_bounce_rhythm",
        "dance_freestyle_rave_flow_transitions",
        "dance_gloving_tutting_box_tutting_patterns",
        "dance_gloving_tutting_finger_isolations",
        "dance_industrial_dance_arm_synchronization",
        "dance_industrial_dance_footwork_patterns",
        "dance_jumpstyle_hardstyle_kicking_sequences",
        "dance_jumpstyle_hardstyle_stamina_drills",
        "dance_liquid_dance_hand_glides",
        "dance_liquid_dance_wave_techniques",
        "dance_poi_spinning_butterfly_moves",
        "dance_poi_spinning_weave_patterns"
    ] as const
);

export default danceDecks as CardDeckPathMap;
