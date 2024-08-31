import React, { useState } from 'react';
import axios from 'axios';

function DevTicketEdit({ ticket, onUpdate }) {
    const [status, setStatus] = useState(ticket.status);
    const [reply, setReply] = useState('');

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleReplyChange = (e) => {
        setReply(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.patch(`https://www.xfkenzify.com:5000/tickets/${ticket._id}`, { status })
            .then((response) => {
                onUpdate(response.data);
            })
            .catch((error) => {
                console.error('Error updating ticket:', error);
            });

        axios.post(`https://www.xfkenzify.com:5000/tickets/${ticket._id}/replies`, {
            message: reply,
            author: 'developer'
        })
            .then((response) => {
                onUpdate(response.data);
            })
            .catch((error) => {
                console.error('Error adding reply:', error);
            });
    };

    const handleDelete = () => {
        axios.delete(`https://www.xfkenzify.com:5000/tickets/${ticket._id}`)
            .then(() => {
                onUpdate(null);
            })
            .catch((error) => {
                console.error('Error deleting ticket:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Status:
                <select value={status} onChange={handleStatusChange}>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                </select>
            </label>
            <br />
            <label>
                Reply:
                <textarea value={reply} onChange={handleReplyChange}></textarea>
            </label>
            <br />
            <button type="submit">Update</button>
            <button type="button" onClick={handleDelete}>Delete</button>
        </form>
    );
}

export default DevTicketEdit;
