import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DevAllTickets from './components/DevAllTickets';
import DevTicketDetail from './components/DevTicketDetail';
import DevTicketEdit from './components/DevTicketEdit';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DevAllTickets />} />
                <Route path="/dev-tickets/:id" element={<DevTicketDetail />} />
                <Route path="/dev-tickets/:id/edit" element={<DevTicketEdit />} />
            </Routes>
        </Router>
    );
}

export default App;
