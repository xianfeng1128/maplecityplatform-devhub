import React from 'react';
import DevAllTickets from '../components/DevAllTickets';
import Header from '../components/Header';

function DevDashboard() {
    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.content}>
                <h1 style={styles.heading}>开发者面板</h1>
                <DevAllTickets />
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#ffffff',
        color: '#000000',
        minHeight: '100vh',
        paddingTop: '60px' // 为冻结的页眉留出空间
    },
    content: {
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
    },
    heading: {
        textAlign: 'left',
    }
};

export default DevDashboard;
