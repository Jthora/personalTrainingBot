import React, { useState } from 'react';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import { WorkoutSet } from '../../types/WorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';
import styles from './CreateWorkoutSetPopup.module.css';

interface CreateWorkoutSetPopupProps {
    onClose: () => void;
    onSave: (workoutSet: WorkoutSet) => void;
}

const CreateWorkoutSetPopup: React.FC<CreateWorkoutSetPopupProps> = ({ onClose, onSave }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);

    const cache = WorkoutCategoryCache.getInstance();
    const categories = cache.getWorkoutCategories();

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedSubCategory(null);
        setSelectedGroup(null);
    };

    const handleSubCategoryChange = (subCategoryId: string) => {
        setSelectedSubCategory(subCategoryId);
        setSelectedGroup(null);
    };

    const handleGroupChange = (groupId: string) => {
        setSelectedGroup(groupId);
    };

    const handleWorkoutToggle = (workout: Workout) => {
        setSelectedWorkouts(prev => {
            if (prev.includes(workout)) {
                return prev.filter(w => w !== workout);
            } else {
                return [...prev, workout];
            }
        });
    };

    const handleSave = () => {
        const workoutSet = new WorkoutSet(selectedWorkouts.map(workout => [workout, false]));
        onSave(workoutSet);
        onClose();
    };

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <h1>Create Workout Set</h1>
                <div className={styles.divisionContainer}>
                    <div className={styles.leftDivision}>
                        <div className={styles.selector}>
                            <label>Category:</label>
                            <select onChange={(e) => handleCategoryChange(e.target.value)} value={selectedCategory || ''}>
                                <option value="" disabled>Select Category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.selector}>
                            <label>SubCategory:</label>
                            <select onChange={(e) => handleSubCategoryChange(e.target.value)} value={selectedSubCategory || ''} disabled={!selectedCategory}>
                                <option value="" disabled>Select SubCategory</option>
                                {selectedCategory && cache.getWorkoutCategory(selectedCategory)?.subCategories.map(subCategory => (
                                    <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.selector}>
                            <label>Group:</label>
                            <select onChange={(e) => handleGroupChange(e.target.value)} value={selectedGroup || ''} disabled={!selectedSubCategory}>
                                <option value="" disabled>Select Group</option>
                                {selectedCategory && selectedSubCategory && cache.getWorkoutCategory(selectedCategory)?.subCategories.find(sub => sub.id === selectedSubCategory)?.workoutGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.workoutList}>
                            <label>Workouts:</label>
                            {selectedCategory && selectedSubCategory && selectedGroup && cache.getWorkoutCategory(selectedCategory)?.subCategories.find(sub => sub.id === selectedSubCategory)?.workoutGroups.find(group => group.id === selectedGroup)?.workouts.map(workout => (
                                <div key={workout.id}>
                                    <input type="checkbox" checked={selectedWorkouts.includes(workout)} onChange={() => handleWorkoutToggle(workout)} />
                                    <span>{workout.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.rightDivision}>
                        <div className={styles.selectedWorkouts}>
                            <h4>Selected Workouts:</h4>
                            <ul>
                                {selectedWorkouts.map((workout, index) => (
                                    <li key={index}>{workout.name}</li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={handleSave} disabled={selectedWorkouts.length === 0}>Save</button>
                        <button onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkoutSetPopup;
