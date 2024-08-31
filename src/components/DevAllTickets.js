import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const ITEMS_PER_PAGE = 30; // 每页显示的工单数量
const ADMIN_PASSWORD = "1128"; // 设置默认密码

function DevAllTickets() {
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isDescending, setIsDescending] = useState(true); // 排序状态，默认为倒序
    const [password, setPassword] = useState(''); // 添加密码状态
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 验证状态
    const [error, setError] = useState('');
    const [jumpPage, setJumpPage] = useState(''); // 页码跳转输入框的值

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedAuthStatus = localStorage.getItem('isAuthenticated');
        if (storedAuthStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const params = new URLSearchParams(location.search);
            const page = parseInt(params.get('page')) || 1;
            const category = params.get('category') || '';
            const status = params.get('status') || '';
            const sort = params.get('sort') === 'asc' ? false : true;

            setCurrentPage(page);
            setSelectedCategory(category);
            setSelectedStatus(status);
            setIsDescending(sort);

            fetchTickets(page, category, status, sort);
        }
    }, [location.search, isAuthenticated]);

    const fetchTickets = (page = currentPage, category = selectedCategory, status = selectedStatus, sort = isDescending) => {
        const sortOrder = sort ? 'desc' : 'asc';
        axios.get('https://www.xfkenzify.com:5000/tickets', {
            params: {
                page,
                limit: ITEMS_PER_PAGE,
                sort: sortOrder,
                category,
                status,
            }
        })
        .then(response => {
            const { tickets, totalPages, categories, statuses } = response.data;
            setTickets(tickets || []);
            setTotalPages(totalPages);
            setCategories(categories || []);
            setStatuses(statuses || []);
        })
        .catch(error => {
            console.error('获取工单时出错:', error);
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
            localStorage.setItem('isAuthenticated', 'true'); // 将认证状态存储在 localStorage 中
        } else {
            setError('密码错误，请重试。');
        }
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // 改变筛选条件时，重置到第一页
        updateURLParams(1, e.target.value, selectedStatus, isDescending);
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(1); // 改变筛选条件时，重置到第一页
        updateURLParams(1, selectedCategory, e.target.value, isDescending);
    };

    const handleSortChange = () => {
        setIsDescending(!isDescending);
        updateURLParams(1, selectedCategory, selectedStatus, !isDescending);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        updateURLParams(page, selectedCategory, selectedStatus, isDescending);
    };

    const handleJumpToPage = () => {
        const page = parseInt(jumpPage, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            handlePageChange(page);
        }
    };

    const updateURLParams = (page, category, status, sort) => {
        const params = new URLSearchParams();
        params.set('page', page);
        if (category) params.set('category', category);
        if (status) params.set('status', status);
        params.set('sort', sort ? 'desc' : 'asc');

        navigate(`?${params.toString()}`);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case '已创建':
                return { backgroundColor: 'blue', color: 'white' };
            case '处理中':
                return { backgroundColor: 'yellow', color: 'black' };
            case '已完成':
                return { backgroundColor: 'green', color: 'white' };
            case '暂不修复':
                return { backgroundColor: 'red', color: 'white' };
            case '违规':
                return { backgroundColor: 'grey', color: 'white' };
            case '置顶':
                return { backgroundColor: 'purple', color: 'white' };
            default:
                return {};
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        const hours = (`0${d.getHours()}`).slice(-2);
        const minutes = (`0${d.getMinutes()}`).slice(-2);
        return `${month}-${day} ${hours}:${minutes}`;
    };

    const renderPagination = () => {
        const pages = [];
        const maxPageButtons = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    style={styles.pageButton}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis-start">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    style={i === currentPage ? styles.activePageButton : styles.pageButton}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis-end">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    style={styles.pageButton}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.content}>
                {!isAuthenticated ? (
                    <div style={styles.authContainer}>
                        <h2>请输入密码</h2>
                        <form onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="输入密码"
                                style={styles.input}
                            />
                            <button type="submit" style={styles.submitButton}>提交</button>
                        </form>
                        {error && <p style={styles.error}>{error}</p>}
                    </div>
                ) : (
                    <>
                        <h1 style={styles.heading}>开发者工单反馈列表</h1>
                        <div style={styles.filters}>
                            <select value={selectedCategory} onChange={handleCategoryChange} style={styles.filterSelect}>
                                <option value="">所有类别</option>
                                {categories.map(({ category, count }) => (
                                    <option key={category} value={category}>{category} ({count})</option>
                                ))}
                            </select>
                            <select value={selectedStatus} onChange={handleStatusChange} style={styles.filterSelect}>
                                <option value="">所有状态</option>
                                {statuses.map(({ status, count }) => (
                                    <option key={status} value={status}>{status} ({count})</option>
                                ))}
                            </select>
                            <button onClick={handleSortChange} style={styles.sortButton}>
                                {isDescending ? '倒序' : '正序'}
                            </button>
                        </div>
                        <ul style={styles.ticketList}>
                            {tickets.map(ticket => (
                                <li key={ticket._id} style={styles.ticketItem}>
                                    <Link to={`/dev-tickets/${ticket._id}`} style={styles.ticketLink}>
                                        <span style={styles.ticketTitle}>{ticket.title}</span>
                                        <span style={styles.ticketDate}>{formatDate(ticket.createdAt)}</span>
                                        <span style={{ ...styles.ticketStatus, ...getStatusStyle(ticket.status) }}>{ticket.status}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div style={styles.pagination}>
                            {renderPagination()}
                        </div>
                        <div style={styles.jumpToPageContainer}>
                            <input
                                type="number"
                                value={jumpPage}
                                onChange={(e) => setJumpPage(e.target.value)}
                                placeholder="跳转到页码"
                                style={styles.jumpInput}
                            />
                            <button onClick={handleJumpToPage} style={styles.jumpButton}>跳转</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#ffffff',
        color: '#000000',
        minHeight: '100vh',
        paddingTop: '60px', // 为冻结的页眉留出空间
    },
    content: {
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
    },
    authContainer: {
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    submitButton: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#6200ee',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginTop: '10px',
    },
    heading: {
        textAlign: 'left',
    },
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    filterSelect: {
        flex: '1',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    sortButton: {
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#d3d3d3',
        color: '#000',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, color 0.3s',
    },
    ticketList: {
        listStyleType: 'none',
        padding: 0,
    },
    ticketItem: {
        padding: '10px',
        marginBottom: '10px',
        borderBottom: '1px solid #ccc',
    },
    ticketLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketTitle: {
        flex: '3',
    },
    ticketDate: {
        flex: '2',
        textAlign: 'right',
        marginRight: '10px',
        color: '#666',
    },
    ticketStatus: {
        flex: '1',
        padding: '5px',
        borderRadius: '4px',
        textAlign: 'center',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
    },
    pageButton: {
        padding: '8px 12px',
        margin: '0 5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
        cursor: 'pointer',
    },
    activePageButton: {
        padding: '8px 12px',
        margin: '0 5px',
        border: '1px solid #6200ee',
        borderRadius: '4px',
        backgroundColor: '#6200ee',
        color: '#fff',
        cursor: 'pointer',
    },
    jumpToPageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
    },
    jumpInput: {
        padding: '5px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '60px',
    },
    jumpButton: {
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#6200ee',
        color: '#fff',
        cursor: 'pointer',
    }
};

export default DevAllTickets;
