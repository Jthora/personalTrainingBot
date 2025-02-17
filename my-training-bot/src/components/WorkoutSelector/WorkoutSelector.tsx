import React, { useEffect, useState } from 'react';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import { WorkoutCategory } from '../../types/WorkoutCategory';
import styles from './WorkoutSelector.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

const WorkoutSelector: React.FC = () => {
    const [workoutCategories, setWorkoutCategories] = useState<WorkoutCategory[]>([]);
    const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set());
    const [visibleSubCategories, setVisibleSubCategories] = useState<Set<string>>(new Set());
    const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set());
    const { createNewSchedule } = useWorkoutSchedule();

    useEffect(() => {
        const cache = WorkoutCategoryCache.getInstance();
        setWorkoutCategories(cache.getWorkoutCategories());
    }, []);

    const toggleVisibility = (id: string, setVisible: React.Dispatch<React.SetStateAction<Set<string>>>) => {
        setVisible(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleCategorySelection = (id: string) => {
        const cache = WorkoutCategoryCache.getInstance();
        cache.toggleCategorySelection(id);
        setWorkoutCategories([...workoutCategories]); // Trigger re-render
    };

    const toggleSubCategorySelection = (id: string) => {
        const cache = WorkoutCategoryCache.getInstance();
        cache.toggleSubCategorySelection(id);
        setWorkoutCategories([...workoutCategories]); // Trigger re-render
    };

    const toggleGroupSelection = (id: string) => {
        const cache = WorkoutCategoryCache.getInstance();
        cache.toggleWorkoutGroupSelection(id);
        setWorkoutCategories([...workoutCategories]); // Trigger re-render
    };

    const toggleWorkoutSelection = (id: string) => {
        const cache = WorkoutCategoryCache.getInstance();
        cache.toggleWorkoutSelection(id);
        setWorkoutCategories([...workoutCategories]); // Trigger re-render
    };

    const selectAll = () => {
        const cache = WorkoutCategoryCache.getInstance();
        workoutCategories.forEach(category => {
            cache.selectedCategories.add(category.id);
            category.subCategories.forEach(subCategory => {
                cache.selectedSubCategories.add(subCategory.id);
                subCategory.workoutGroups.forEach(group => {
                    cache.selectedWorkoutGroups.add(group.id);
                    group.workouts.forEach(workout => {
                        cache.selectedWorkouts.add(workout.id);
                    });
                });
            });
        });
        setWorkoutCategories([...workoutCategories]); // Trigger re-render
    };

    const createNewWorkoutSchedule = async () => {
        console.log('Creating a new workout schedule...');
        await createNewSchedule();
    };

    const getStats = () => {
        let subCategoryCount = 0;
        let groupCount = 0;
        let workoutCount = 0;
        let selectedSubCategoryCount = 0;
        let selectedGroupCount = 0;
        let selectedWorkoutCount = 0;

        const cache = WorkoutCategoryCache.getInstance();

        workoutCategories.forEach(category => {
            subCategoryCount += category.subCategories.length;
            category.subCategories.forEach(subCategory => {
                groupCount += subCategory.workoutGroups.length;
                subCategory.workoutGroups.forEach(group => {
                    workoutCount += group.workouts.length;
                });
            });
        });

        cache.selectedSubCategories.forEach(subCategoryId => {
            const subCategory = workoutCategories.flatMap(category => category.subCategories).find(sub => sub.id === subCategoryId);
            if (subCategory) {
                selectedSubCategoryCount++;
            }
        });

        cache.selectedWorkoutGroups.forEach(groupId => {
            const group = workoutCategories.flatMap(category => category.subCategories).flatMap(subCategory => subCategory.workoutGroups).find(group => group.id === groupId);
            if (group) {
                selectedGroupCount++;
            }
        });

        cache.selectedWorkouts.forEach(workoutId => {
            const workout = workoutCategories.flatMap(category => category.subCategories).flatMap(subCategory => subCategory.workoutGroups).flatMap(group => group.workouts).find(workout => workout.id === workoutId);
            if (workout) {
                selectedWorkoutCount++;
            }
        });

        return {
            categoryCount: workoutCategories.length,
            subCategoryCount,
            groupCount,
            workoutCount,
            selectedSubCategoryCount,
            selectedGroupCount,
            selectedWorkoutCount
        };
    };

    const stats = getStats();

    return (
        <div className={styles.workoutSelector}>
            <h1>Workout Selector</h1>
            <div className={styles.workoutControls}>
                <button onClick={createNewWorkoutSchedule} className={styles.createNewScheduleButton}>Generate Random Workout Schedule</button>
                <button onClick={selectAll} className={styles.selectAllButton}>Select All Workouts</button>
                <div className={styles.stats}>
                <h2>Total In Database</h2>
                    <p>Categories: {stats.categoryCount}</p>
                    <p>SubCategories: {stats.subCategoryCount}</p>
                    <p>Groups: {stats.groupCount}</p>
                    <p>Workouts: {stats.workoutCount}</p>
                </div>
            </div>
            <h3>Workout Categories</h3>
            {workoutCategories.map(category => (
                <div key={category.id} className={styles.category}>
                    <input
                        type="checkbox"
                        checked={WorkoutCategoryCache.getInstance().isCategorySelected(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                    />
                    <span>{category.name}</span>
                    <button className={styles.dropdownButton} onClick={() => toggleVisibility(category.id, setVisibleCategories)}>
                        {visibleCategories.has(category.id) ? '▬' : '▼'}
                    </button>
                    {visibleCategories.has(category.id) && (
                        <div className={styles.subCategories}>
                            {category.subCategories.map(subCategory => (
                                <div key={subCategory.id} className={styles.subCategory}>
                                    <input
                                        type="checkbox"
                                        checked={WorkoutCategoryCache.getInstance().isSubCategorySelected(subCategory.id)}
                                        onChange={() => toggleSubCategorySelection(subCategory.id)}
                                    />
                                    <span>{subCategory.name}</span>
                                    <button className={styles.dropdownButton} onClick={() => toggleVisibility(subCategory.id, setVisibleSubCategories)}>
                                        {visibleSubCategories.has(subCategory.id) ? '▬' : '▼'}
                                    </button>
                                    {visibleSubCategories.has(subCategory.id) && (
                                        <div className={styles.groups}>
                                            {subCategory.workoutGroups.map(group => (
                                                <div key={group.id} className={styles.group}>
                                                    <input
                                                        type="checkbox"
                                                        checked={WorkoutCategoryCache.getInstance().isWorkoutGroupSelected(group.id)}
                                                        onChange={() => toggleGroupSelection(group.id)}
                                                    />
                                                    <span>{group.name}</span>
                                                    <button className={styles.dropdownButton} onClick={() => toggleVisibility(group.id, setVisibleGroups)}>
                                                        {visibleGroups.has(group.id) ? '▬' : '▼'}
                                                    </button>
                                                    {visibleGroups.has(group.id) && (
                                                        <div className={styles.workouts}>
                                                            {group.workouts.map(workout => (
                                                                <div key={workout.id} className={styles.workout}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={WorkoutCategoryCache.getInstance().isWorkoutSelected(workout.id)}
                                                                        onChange={() => toggleWorkoutSelection(workout.id)}
                                                                    />
                                                                    <span>{workout.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WorkoutSelector;
