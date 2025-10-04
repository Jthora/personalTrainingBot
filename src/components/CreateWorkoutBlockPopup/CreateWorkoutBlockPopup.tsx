import React, { useState } from 'react';
import { WorkoutBlock } from '../../types/WorkoutSchedule';
import styles from './CreateWorkoutBlockPopup.module.css';

interface CreateWorkoutBlockPopupProps {
    onClose: () => void;
    onSave: (workoutBlock: WorkoutBlock) => void;
}

const CreateWorkoutBlockPopup: React.FC<CreateWorkoutBlockPopupProps> = ({ onClose, onSave }) => {
    const [blockName, setBlockName] = useState('');
    const [blockDescription, setBlockDescription] = useState('');
    const [blockDuration, setBlockDuration] = useState(30);
    const [blockIntervalDetails, setBlockIntervalDetails] = useState('');

    const handleSave = () => {
        const workoutBlock = new WorkoutBlock(blockName, blockDescription, blockDuration, blockIntervalDetails);
        onSave(workoutBlock);
        onClose();
    };

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <h1>Create Workout Block</h1>
                <label>Name:</label>
                <input type="text" value={blockName} onChange={(e) => setBlockName(e.target.value)} />
                <label>Description:</label>
                <input type="text" value={blockDescription} onChange={(e) => setBlockDescription(e.target.value)} />
                <label>Duration (minutes):</label>
                <input type="number" value={blockDuration} onChange={(e) => setBlockDuration(Number(e.target.value))} />
                <label>Interval Details:</label>
                <input type="text" value={blockIntervalDetails} onChange={(e) => setBlockIntervalDetails(e.target.value)} />
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default CreateWorkoutBlockPopup;
