import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const martialArtsDecks = createShardLoaders(
    "martial_arts",
    [
        "martial_arts_baguazhang_circle_walking",
        "martial_arts_baguazhang_evasive_movement",
        "martial_arts_baguazhang_palm_strikes",
        "martial_arts_capoeira_acrobatics_and_flips",
        "martial_arts_capoeira_ginga_and_fluidity",
        "martial_arts_capoeira_kicks_and_sweeps",
        "martial_arts_hapkido_joint_locks",
        "martial_arts_hapkido_pressure_points",
        "martial_arts_hapkido_throws_and_takedowns",
        "martial_arts_jeet_kune_do_footwork_and_speed",
        "martial_arts_jeet_kune_do_intercepting_fist",
        "martial_arts_jeet_kune_do_trapping_hands",
        "martial_arts_muay_thai_clinch_and_control",
        "martial_arts_muay_thai_elbow_and_knee_strikes",
        "martial_arts_muay_thai_power_kicks",
        "martial_arts_shaolin_kung_fu_animal_styles",
        "martial_arts_shaolin_kung_fu_iron_body_training",
        "martial_arts_shaolin_kung_fu_staff_and_weaponry",
        "martial_arts_silat_bladed_weapon_techniques",
        "martial_arts_silat_low_stance_combat",
        "martial_arts_silat_rapid_striking",
        "martial_arts_taekwondo_breaking_techniques",
        "martial_arts_taekwondo_explosive_kicking",
        "martial_arts_taekwondo_spinning_and_aerial_kicks",
        "martial_arts_tai_chi_internal_energy",
        "martial_arts_tai_chi_push_hands",
        "martial_arts_tai_chi_slow_form_training",
        "martial_arts_wing_chun_centerline_striking",
        "martial_arts_wing_chun_chi_sao_sensitivity",
        "martial_arts_wing_chun_wooden_dummy_drills",
        "martial_arts_wushu_aerial_movements",
        "martial_arts_wushu_dynamic_forms",
        "martial_arts_wushu_long_fist_and_southern_fist",
        "martial_arts_xing_yi_quan_animal_forms",
        "martial_arts_xing_yi_quan_explosive_power",
        "martial_arts_xing_yi_quan_five_element_strikes"
    ] as const
);

export default martialArtsDecks as CardDeckPathMap;
