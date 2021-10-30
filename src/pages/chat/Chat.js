import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import './Chat.css';
import Topbar from '../../components/topbar/Topbar';
import Conversation from '../../components/conversations/Conversation';
import Message from '../../components/message/Message';
import { getConvers } from '../../actions/conversation';
import { createConversation, createMessage, getMessages } from '../../api';
import { SET_CONVERSATION } from '../../constants/actionTypes';
import {TextField, TextareaAutosize} from '@mui/material';
import {Send, Image} from '@mui/icons-material';
import { Picker } from 'emoji-mart';
import Emojify from 'react-emojione';

export default function Chat() {
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    const { userData } = useSelector((state) => state.user);
    const { conversations } = useSelector((state) => state.conversation);
    const query = useQuery();
    const dispatch = useDispatch();
    const id = query.get('id');
    const scrollRef = useRef();
    const [currentConv, setCurrentConv] = useState(null);
    const [convers, setConvers] = useState(conversations);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const socket = useRef();
    const [emoji, setEmoji] = useState("");
    // Create a socket and get messages, clean up function will disconnect socket
    useEffect(() => {
        socket.current = io("ws://localhost:8080");
        socket.current.on('getMessage', (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            })
        })
        return () => {
            socket.current.disconnect();
        }
    },[]);

    // Add new messages to the message list
    useEffect(() => {
        arrivalMessage && currentConv?.members.includes(arrivalMessage.sender) &&
        setMessages((prev) => [...prev,arrivalMessage]);
    }, [arrivalMessage,currentConv]);

    // Get user online in socket server
    useEffect(() => {
        socket.current.emit('addUser', userData.result._id);
        socket.current.on('getUsers', (users) => {
            console.log(users);
        })
    }, [userData.result._id]);

    // Get conversations from the user when components mount
    useEffect(() => {
        dispatch(getConvers(userData.result._id));
    }, [dispatch, userData.result._id]);

    // Set conversations in this component when reducers state change
    useEffect(() => {
        setConvers(conversations);
    }, [conversations]);

    // Set current conversation, create new if unexisting
    useEffect(() => {
        if(id) {
            if(convers.length !== 0) {
                const existConv = convers.find((conversation) => {
                    if(conversation.members.includes(id)) 
                        return true;
                    return false;
                });
                if(existConv) {
                    setCurrentConv(existConv);
                } else {
                    const getCurrentConv = async() => {
                        try {
                            const currentChat = await createConversation({ receiverId: id });
                            setCurrentConv(currentChat.data);
                            dispatch({ type: SET_CONVERSATION, payload: [...convers, currentChat.data]});
                            // setConvers((prev) => [...prev, currentChat.data]);
                            
                        } catch (error) {
                            console.log(error);
                        }
                    };
                    getCurrentConv();
                }
            }
        }
    }, [id,convers,dispatch]);

    // Get message of current conversation
    useEffect(() => {
        const getMsgs = async () => {
            try {
                const msgs = await getMessages(currentConv?._id);
                setMessages(msgs.data);
            } catch (error) {
                console.log(error);
            }
        }
        getMsgs();
        return () => {
            setMessages([]);
        }
    }, [currentConv]);

    // Scrolling messages into view
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Submit messages to the servers
    const handleSubmit = async (e) => {
        e.preventDefault();
        const message = {
            conversationId: currentConv?._id,
            text: newMessage
        };

        const receiverId = currentConv.members.find(member => member !== userData.result._id );

        socket.current.emit('sendMessage', { 
            senderId: userData.result._id,
            receiverId,
            text: newMessage
        });
        
        try {
            const res = await createMessage(message);
            setMessages([...messages, res.data ]);
            setNewMessage("");
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
        <Topbar />
        <div className="chat">
            <div className="chatMenu">
                <div className="chatMenuWrapper">
                    <TextField className="chatMenuInput" label="Tìm kiếm bạn bè..." variant="standard" />
                    {convers.length > 0 && convers.map((conv) => (
                        <Link 
                            to={`/chat?id=${conv.members.find((c) => c !== userData.result._id)}`} 
                            key={conv._id} 
                            style={{ textDecoration: 'none', color: 'inherit' }} 
                        >
                            <Conversation currentUser={userData.result} conversation={conv} />
                        </Link>
                    ))}
                </div>
            </div>
            <div className="chatBox">
                <div className="chatBoxWrapper">
                {
                    currentConv ?
                    <>
                        <div className="chatBoxTop" >
                        {
                            messages.length > 0 && messages.map((m,index) => (
                                <div key={index} ref={scrollRef}>
                                    <Message message={m} own={m.sender === userData.result._id} />
                                </div>
                            ))
                        }
                        </div>
                        <div className="chatBoxBottom" >
                            <div>
                                <Image fontSize="large"/>
                            </div>
                            <div>
                                <Emojify><span>🙂</span></Emojify>
                            </div>
                            <TextareaAutosize
                                className="chatBoxInput" 
                                maxRows={4}
                                aria-label="maximum height"
                                placeholder="Soạn tin nhắn..."
                                onChange={(e) => setNewMessage(e.target.value)}
                                value={newMessage}
                                style={{ width: 200 }}
                            />
                            <button className="chatSubmitButton" onClick={handleSubmit}><Send/></button>
                        </div>
                    </> : <span className="noConversationText">Chọn một người bạn để bắt đầu một cuộc trò chuyện đầy thú vị.</span>
                }
                </div>
            </div>
        </div>
        </>
    )
}