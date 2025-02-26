import React, { useState, useEffect } from 'react';
import { WorkoutSet, WorkoutBlock, CustomWorkoutSchedule, WorkoutSchedule } from '../../types/WorkoutSchedule';
import CustomWorkoutSchedulesStore from '../../store/CustomWorkoutSchedulesStore';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import CreateWorkoutSetPopup from '../CreateWorkoutSetPopup/CreateWorkoutSetPopup';
import CreateWorkoutBlockPopup from '../CreateWorkoutBlockPopup/CreateWorkoutBlockPopup';
import CreateNewWorkoutSchedulePopup from '../CreateNewWorkoutSchedulePopup/CreateNewWorkoutSchedulePopup';
import DeleteExistingWorkoutSchedulePopup from '../DeleteExistingWorkoutSchedulePopup/DeleteExistingWorkoutSchedulePopup';
import styles from './CustomScheduleCreatorView.module.css';

const CustomScheduleCreatorView: React.FC<{ onScheduleUpdate: () => void }> = ({ onScheduleUpdate }) => {
    const [customSchedules, setCustomSchedules] = useState<CustomWorkoutSchedule[]>([]);
    const [selectedCustomSchedule, setSelectedCustomSchedule] = useState<CustomWorkoutSchedule | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<(WorkoutSet | WorkoutBlock)[]>([]);
    const [isWorkoutSetPopupOpen, setIsWorkoutSetPopupOpen] = useState(false);
    const [isWorkoutBlockPopupOpen, setIsWorkoutBlockPopupOpen] = useState(false);
    const [isCreateNewSchedulePopupOpen, setIsCreateNewSchedulePopupOpen] = useState(false);
    const [isDeleteSchedulePopupOpen, setIsDeleteSchedulePopupOpen] = useState(false);

    useEffect(() => {
        setCustomSchedules(CustomWorkoutSchedulesStore.getCustomSchedules());
    }, []);

    const handleAddWorkoutSet = (workoutSet: WorkoutSet) => {
        if (selectedCustomSchedule) {
            const newWorkoutSet = new WorkoutSet(workoutSet.workouts);
            selectedCustomSchedule.workoutSchedule.scheduleItems.push(newWorkoutSet);
            CustomWorkoutSchedulesStore.updateCustomSchedule(selectedCustomSchedule);
            setCustomSchedules([...customSchedules]);
        }
    };

    const handleAddWorkoutBlock = (workoutBlock: WorkoutBlock) => {
        if (selectedCustomSchedule) {
            const newWorkoutBlock = new WorkoutBlock(workoutBlock.name, workoutBlock.description, workoutBlock.duration, workoutBlock.intervalDetails);
            selectedCustomSchedule.workoutSchedule.scheduleItems.push(newWorkoutBlock);
            CustomWorkoutSchedulesStore.updateCustomSchedule(selectedCustomSchedule);
            setCustomSchedules([...customSchedules]);
        }
    };

    const handleRemoveItem = (index: number) => {
        if (selectedCustomSchedule) {
            selectedCustomSchedule.workoutSchedule.scheduleItems.splice(index, 1);
            CustomWorkoutSchedulesStore.updateCustomSchedule(selectedCustomSchedule);
            setCustomSchedules([...customSchedules]);
        }
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        if (selectedCustomSchedule) {
            const items = selectedCustomSchedule.workoutSchedule.scheduleItems;
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex >= 0 && newIndex < items.length) {
                const [movedItem] = items.splice(index, 1);
                items.splice(newIndex, 0, movedItem);
                CustomWorkoutSchedulesStore.updateCustomSchedule(selectedCustomSchedule);
                setCustomSchedules([...customSchedules]);
            }
        }
    };

    const handleScheduleSelect = (scheduleId: string) => {
        const customSchedule = customSchedules.find(s => s.id === scheduleId) || null;
        setSelectedCustomSchedule(customSchedule);
        setSelectedSchedule(customSchedule ? customSchedule.workoutSchedule.scheduleItems : []);
    };

    const handleSetAsCurrentSchedule = () => {
        if (selectedCustomSchedule) {
            WorkoutScheduleStore.saveSchedule(selectedCustomSchedule.workoutSchedule);
            onScheduleUpdate();
        }
    };

    const handleCreateNewSchedule = (name: string, description: string) => {
        const newSchedule = new CustomWorkoutSchedule(name, description, new WorkoutSchedule(new Date().toISOString().split('T')[0], [], {}));
        CustomWorkoutSchedulesStore.saveCustomSchedule(newSchedule);
        setCustomSchedules([...customSchedules, newSchedule]);
        setSelectedCustomSchedule(newSchedule);
        setSelectedSchedule(newSchedule.workoutSchedule.scheduleItems);
    };

    const handleDeleteSchedule = (scheduleId: string) => {
        CustomWorkoutSchedulesStore.deleteCustomSchedule(scheduleId);
        const updatedSchedules = customSchedules.filter(schedule => schedule.id !== scheduleId);
        setCustomSchedules(updatedSchedules);
        if (updatedSchedules.length > 0) {
            setSelectedCustomSchedule(updatedSchedules[0]);
            setSelectedSchedule(updatedSchedules[0].workoutSchedule.scheduleItems);
        } else {
            setSelectedCustomSchedule(null);
            setSelectedSchedule([]);
        }
    };

    return (
        <div className={styles.customScheduleCreatorView}>
            <div className={styles.leftDivision}>
                <h1>Edit Custom Workout Schedules</h1>
                <div className={styles.topButtons}>
                    <button onClick={() => setIsCreateNewSchedulePopupOpen(true)}>Create New Workout Schedule</button>
                    <button onClick={() => setIsDeleteSchedulePopupOpen(true)} disabled={customSchedules.length === 0}>Delete Existing Workout Schedule</button>
                </div>
                <button onClick={() => setIsWorkoutSetPopupOpen(true)} disabled={!selectedCustomSchedule}>Add Workout Set</button>
                <button onClick={() => setIsWorkoutBlockPopupOpen(true)} disabled={!selectedCustomSchedule}>Add Workout Block</button>
            </div>
            <div className={styles.rightDivision}>
                <div className={styles.existingSchedules}>
                    <h3>Existing Custom Schedules</h3>
                    <select onChange={(e) => handleScheduleSelect(e.target.value)} value={selectedCustomSchedule?.id || ''}>
                        <option value="" disabled>Select Schedule</option>
                        {customSchedules.map(schedule => (
                            <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleSetAsCurrentSchedule} disabled={!selectedCustomSchedule}>Set as Current Workout Schedule</button>
                <div className={styles.schedulePreview}>
                    <h3>Schedule Editor</h3>
                    <ul>
                        {selectedSchedule.map((item, index) => (
                            <li key={index}>
                                {item instanceof WorkoutSet ? (
                                    <div>
                                        <span>Workout Set</span>
                                        <ul>
                                            {item.workouts.map(([workout], idx) => (
                                                <li key={idx}>{workout.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : item instanceof WorkoutBlock ? (
                                    <div>
                                        <span>Workout Block</span>
                                        <ul>
                                            <li>{item.name}</li>
                                            <li>{item.description}</li>
                                            <li>{item.duration} minutes</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div>
                                        <span>Unknown Item</span>
                                    </div>
                                )}
                                <div className={styles.buttonGroup}>
                                    <button className={styles.moveButton} onClick={() => handleMoveItem(index, 'up')}>▲</button>
                                    <button className={styles.moveButton} onClick={() => handleMoveItem(index, 'down')}>▼</button>
                                    <button className={styles.removeButton} onClick={() => handleRemoveItem(index)}>❌</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isWorkoutSetPopupOpen && (
                <CreateWorkoutSetPopup 
                    onClose={() => setIsWorkoutSetPopupOpen(false)} 
                    onSave={handleAddWorkoutSet} 
                />
            )}
            {isWorkoutBlockPopupOpen && (
                <CreateWorkoutBlockPopup 
                    onClose={() => setIsWorkoutBlockPopupOpen(false)} 
                    onSave={handleAddWorkoutBlock} 
                />
            )}
            {isCreateNewSchedulePopupOpen && (
                <CreateNewWorkoutSchedulePopup 
                    onClose={() => setIsCreateNewSchedulePopupOpen(false)} 
                    onSave={handleCreateNewSchedule} 
                />
            )}
            {isDeleteSchedulePopupOpen && (
                <DeleteExistingWorkoutSchedulePopup 
                    schedules={customSchedules}
                    onClose={() => setIsDeleteSchedulePopupOpen(false)} 
                    onDelete={handleDeleteSchedule} 
                />
            )}
        </div>
    );
};

export default CustomScheduleCreatorView;
