import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const equationsDecks = createShardLoaders(
    "equations",
    [
        "equations_abstract_mathematical_models_group_theory_and_symmetry",
        "equations_abstract_mathematical_models_mathematical_models_in_physics",
        "equations_abstract_mathematical_models_tensor_notation_and_applications",
        "equations_algebraic_structure_analysis_matrices_and_linear_algebra",
        "equations_algebraic_structure_analysis_polynomials_and_factorization",
        "equations_algebraic_structure_analysis_solving_equations_and_expressions",
        "equations_bioelectric_psionic_tech_electromagnetic_brainwave_interaction",
        "equations_bioelectric_psionic_tech_human_biofield_and_energy_systems",
        "equations_bioelectric_psionic_tech_psionic_neural_network_equations",
        "equations_bioelectric_psionic_tech_psionic_technology_and_consciousness_interfaces",
        "equations_calculus_and_rate_of_change_differential_equations_and_series",
        "equations_calculus_and_rate_of_change_fundamentals_of_derivatives",
        "equations_calculus_and_rate_of_change_integration_methods_and_applications",
        "equations_electrogravitics_and_field_propulsion_anti_gravity_and_lorentz_forces",
        "equations_electrogravitics_and_field_propulsion_high_voltage_field_effects",
        "equations_electrogravitics_and_field_propulsion_zero_point_energy_and_vacuum_fluctuations",
        "equations_hyperdimensional_mathematics_hyperdimensional_topologies",
        "equations_hyperdimensional_mathematics_non_euclidean_geometry_and_manifolds",
        "equations_hyperdimensional_mathematics_vortex_physics_and_energy_flow",
        "equations_mathematical_notation_fundamentals_basic_mathematical_symbols",
        "equations_mathematical_notation_fundamentals_notation_in_different_disciplines",
        "equations_mathematical_notation_fundamentals_operators_and_expressions",
        "equations_neural_network_mathematics_advanced_hadamard_equations",
        "equations_neural_network_mathematics_ai_model_training_and_tuning",
        "equations_neural_network_mathematics_basic_hadamard_equations",
        "equations_neural_network_mathematics_deep_learning_architectures",
        "equations_neural_network_mathematics_fundamentals_of_neural_networks",
        "equations_neural_network_mathematics_neural_network_equations",
        "equations_neural_network_mathematics_neural_network_hadamard_equations",
        "equations_physics_equations_and_applications_electromagnetic_field_equations",
        "equations_physics_equations_and_applications_newtonian_mechanics_equations",
        "equations_physics_equations_and_applications_thermodynamics_and_statistical_mechanics",
        "equations_quantum_psionics_nonlocal_consciousness_effects",
        "equations_quantum_psionics_psi_energy_dynamics",
        "equations_quantum_psionics_psionic_resonance_and_entanglement",
        "equations_symbolic_logic_and_proofs_formal_proof_methods",
        "equations_symbolic_logic_and_proofs_set_theory_and_quantifiers",
        "equations_symbolic_logic_and_proofs_truth_tables_and_logic_gates",
        "equations_temporal_mechanics_reality_modulation_and_psychotronic_fields",
        "equations_temporal_mechanics_time_field_dynamics_and_alteration",
        "equations_temporal_mechanics_wave_function_collapse_and_timeline_selection"
    ] as const
);

export default equationsDecks as CardDeckPathMap;
