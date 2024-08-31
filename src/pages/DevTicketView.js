import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Header from '../components/Header';

const DevTicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [status, setStatus] = useState('');
    const [prevStatus, setPrevStatus] = useState('');

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                // 更新阅读数
                await axios.patch(`https://www.xfkenzify.com:5000/tickets/${id}/views`);
                
                const res = await axios.get(`https://www.xfkenzify.com:5000/tickets/${id}`);
                setTicket(res.data);
                setStatus(res.data.status);
                setPrevStatus(res.data.status);
            } catch (error) {
                console.error('获取工单时出错:', error);
            }
        };
        fetchTicket();
    }, [id]);

    const verifyPassword = () => {
        const password = prompt('请输入密码以删除');
        return password === '1128';
    };

    const handleReplySubmit = async () => {
        try {
            await axios.post(`https://www.xfkenzify.com:5000/tickets/${id}/replies`, {
                reply,
                user: '开发者',
            });
            const res = await axios.get(`https://www.xfkenzify.com:5000/tickets/${id}`);
            setTicket(res.data);
            setReply('');
        } catch (error) {
            console.error('添加回复时出错:', error);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!verifyPassword()) {
            alert('密码错误，无法删除回复');
            return;
        }

        try {
            await axios.delete(`https://www.xfkenzify.com:5000/tickets/${id}/replies/${replyId}`);
            const res = await axios.get(`https://www.xfkenzify.com:5000/tickets/${id}`);
            setTicket(res.data);
        } catch (error) {
            console.error('删除回复时出错:', error);
        }
    };

    const handleDeleteTicket = async () => {
        if (!verifyPassword()) {
            alert('密码错误，无法删除工单');
            return;
        }

        try {
            await axios.delete(`https://www.xfkenzify.com:5000/tickets/${id}`);
            navigate('/');
        } catch (error) {
            console.error('删除工单时出错:', error);
            console.error(error.response ? error.response.data : error.message);
            alert('删除工单时出错: ' + (error.response ? error.response.data.message : error.message));
        }
    };

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        const statusChangeMessage = `开发者将状态从"${prevStatus}"修改为"${newStatus}"`;
        try {
            await axios.patch(`https://www.xfkenzify.com:5000/tickets/${id}/status`, { status: newStatus });
            await axios.post(`https://www.xfkenzify.com:5000/tickets/${id}/replies`, {
                reply: statusChangeMessage,
                user: '开发者',
                statusChange: true,
            });
            setStatus(newStatus);
            setPrevStatus(newStatus);
            const res = await axios.get(`https://www.xfkenzify.com:5000/tickets/${id}`);
            setTicket(res.data);
        } catch (error) {
            console.error('更新状态时出错:', error);
        }
    };

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['link', 'image'],
            ['clean'],
        ],
    }), []);

    const imageStyle = `
        img {
            max-width: 100%;
            height: auto;
        }
    `;

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

    if (!ticket) {
        return <div>加载中...</div>;
    }

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.ticketDetail}>
                <h2 style={styles.heading}>{ticket.title}</h2>
                <div style={styles.ticketInfo}>
                    <p><strong>类别:</strong> {ticket.category}</p>
                    <p><strong>状态:</strong> <span style={getStatusStyle(ticket.status)}>{ticket.status}</span></p>
                    <p><strong>阅读数:</strong> {Math.floor(ticket.views / 2)}</p> {/* 显示阅读数并除以2 */}
                    <p><strong>创建时间:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                    {ticket.category === '问题反馈' && ticket.coordinates && (
                        <p><strong>坐标:</strong> X: {ticket.coordinates.x} Y: {ticket.coordinates.y} Z: {ticket.coordinates.z}</p>
                    )}
                </div>
                <div style={styles.ticketContent}>
                    <style>{imageStyle}</style>
                    <div
                        dangerouslySetInnerHTML={{ __html: ticket.description }}
                    />
                </div>
                <div style={styles.replies}>
                    <h3>开发者回复</h3>
                    {ticket.replies.filter(reply => reply.user === '开发者').map((reply, index) => (
                        <div key={index} style={styles.developerReply}>
                            <strong>{reply.user}</strong>
                            {reply.statusChange && <p>{reply.reply}</p>}
                            <div dangerouslySetInnerHTML={{ __html: reply.message }} />
                            <p>{new Date(reply.timestamp).toLocaleString()}</p>
                            <button onClick={() => handleDeleteReply(reply._id)} style={styles.deleteButton}>
                                删除回复
                            </button>
                        </div>
                    ))}
                </div>
                <div style={styles.replies}>
                    <h3>用户回复</h3>
                    {ticket.replies.filter(reply => reply.user === '用户').map((reply, index) => (
                        <div key={index} style={styles.userReply}>
                            <strong>{reply.user}</strong>
                            <p>{index + 1}楼</p>
                            <div dangerouslySetInnerHTML={{ __html: reply.message }} />
                            <p>{new Date(reply.timestamp).toLocaleString()}</p>
                            <button onClick={() => handleDeleteReply(reply._id)} style={styles.deleteButton}>
                                删除回复
                            </button>
                        </div>
                    ))}
                </div>
                <div>
                    <ReactQuill value={reply} onChange={setReply} modules={modules} style={styles.quillEditor} />
                    <button onClick={handleReplySubmit} style={{...styles.button, ...styles.submitButton}}>提交回复</button>
                </div>
                <div style={styles.statusUpdate}>
                    <label>
                        更新状态:
                        <select value={status} onChange={handleStatusChange} style={styles.statusSelect}>
                            <option value="已创建">已创建</option>
                            <option value="处理中">处理中</option>
                            <option value="已完成">已完成</option>
                            <option value="暂不修复">暂不修复</option>
                            <option value="违规">违规</option>
                            <option value="置顶">置顶</option>
                        </select>
                    </label>
                </div>
                <button onClick={handleDeleteTicket} style={styles.deleteTicketButton}>删除工单</button>
                <Link to="/dev-tickets" style={styles.backLink}>返回工单列表</Link>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#ffffff',
        color: '#000000',
        minHeight: '100vh',
        paddingTop: '60px' // 为冻结的页眉留出空间
    },
    ticketDetail: {
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
    },
    heading: {
        textAlign: 'left',
    },
    ticketInfo: {
        padding: '20px',
        backgroundColor: '#f1f1f1',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    ticketContent: {
        padding: '20px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    replies: {
        margin: '20px 0',
    },
    developerReply: {
        padding: '10px',
        backgroundColor: '#e0f7fa',
        borderRadius: '8px',
        marginBottom: '10px',
    },
    userReply: {
        padding: '10px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        marginBottom: '10px',
    },
    quillEditor: {
        backgroundColor: '#f9f9f9',
        color: '#000000',
        margin: '10px 0',
    },
    button: {
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'opacity 0.3s',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#6200ee',
        color: '#fff',
    },
    statusUpdate: {
        margin: '20px 0',
    },
    statusSelect: {
        marginLeft: '10px',
        padding: '5px',
    },
    backLink: {
        color: '#6200ee',
        textDecoration: 'none',
        display: 'block',
        marginTop: '20px',
    },
    deleteButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'red',
        color: '#fff',
        cursor: 'pointer',
        marginTop: '10px',
    },
    deleteTicketButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'red',
        color: '#fff',
        cursor: 'pointer',
        marginTop: '20px',
    }
};

export default DevTicketDetail;
