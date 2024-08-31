import React from 'react';

const Header = () => {
    return (
        <header style={styles.header}>
            <a href="https://www.xfkenzify.com:4329/" style={styles.link} target="_blank" rel="noopener noreferrer">
                <h1 style={styles.title}>枫城城市问题反馈系统-开发者端</h1>
            </a>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: '#6200ee',
        color: '#ffffff',
        padding: '10px 20px',
        textAlign: 'left',
    },
    title: {
        margin: 0,
        fontSize: '24px',
        textDecoration: 'none',
        color: '#ffffff', // Ensure the text color remains white
    },
    link: {
        textDecoration: 'none',
        color: 'inherit', // Inherit color from parent
    }
};

export default Header;
