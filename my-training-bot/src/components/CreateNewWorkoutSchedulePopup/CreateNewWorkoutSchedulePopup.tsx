import React, { useState } from 'react';
import styles from './CreateNewWorkoutSchedulePopup.module.css';

interface CreateNewWorkoutSchedulePopupProps {
    onClose: () => void;
    onSave: (name: string, description: string) => void;
}

const CreateNewWorkoutSchedulePopup: React.FC<CreateNewWorkoutSchedulePopupProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        onSave(name, description);
        onClose();
    };

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <h1>Create New Workout Schedule</h1>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <label>Description:</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default CreateNewWorkoutSchedulePopup;


