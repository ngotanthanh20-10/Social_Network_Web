import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Chat.css';
import Topbar from '../../components/topbar/Topbar';
import Conversation from '../../components/conversations/Conversation';
import Message from '../../components/message/Message';
import { getConvers } from '../../actions/conversation';
import { createConversation, createMessage, getMessages } from '../../api';
import { SET_CONVERSATION } from '../../constants/actionTypes';
import {TextField, TextareaAutosize} from '@mui/material';
import {Send, Image} from '@mui/icons-material';
import 'emoji-mart/css/emoji-mart.css';
import { Picker} from 'emoji-mart';
import Emojify from 'react-emojione';

export default function Chat() {
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    const { userData } = useSelector((state) => state.user);
    const { conversations } = useSelector((state) => state.conversation);
    const { savedSocket } = useSelector((state) => state.socket);
    const query = useQuery();
    const dispatch = useDispatch();
    const id = query.get('id');
    const scrollRef = useRef();
    const [currentConv, setCurrentConv] = useState(null);
    const [convers, setConvers] = useState(conversations);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [openEmoji, setOpenEmoji] = useState(false);
    const [selectEmoji, setSelectEmoji] = useState([]);

    // Create a socket and get messages, clean up function will disconnect socket
    useEffect(() => {
        savedSocket?.current.on('getMessage', (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            })
        })
    },[savedSocket]);

    // Add new messages to the message list
    useEffect(() => {
        arrivalMessage && currentConv?.members.includes(arrivalMessage.sender) &&
        setMessages((prev) => [...prev,arrivalMessage]);
    }, [arrivalMessage,currentConv]);


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
    const handleSubmit = async () => {
        const message = {
            conversationId: currentConv?._id,
            text: newMessage
        };

        const receiverId = currentConv.members.find(member => member !== userData.result._id );

        savedSocket.current.emit('sendMessage', { 
            senderId: userData.result._id,
            receiverId,
            text: newMessage
        });

        savedSocket.current.emit('messageNotify', {
            senderId: userData.result._id,
            receiverId,
        });

        setNewMessage("");
        
        try {
            const res = await createMessage(message);
            setMessages([...messages, res.data ]);
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
                                    <Message message={m} own={m.sender === userData.result._id} userData={userData.result} />
                                </div>
                            ))
                        }
                        </div>
                        <div className="chatBoxBottom" >
                            <div className="chatImage">
                                <Image fontSize="large"/>
                                <div style={{ display: 'none' }}>
                                    <input id="file" type="file" multiple />
                                </div>
                            </div>
                            <div className="chatEmoji">
                                <Emojify onClick={() => setOpenEmoji(!openEmoji)} >🙂</Emojify>
                                {
                                    openEmoji ? (
                                        <Picker
                                            onSelect={(emoji) => {setSelectEmoji(...selectEmoji, emoji.native); setNewMessage(...newMessage, selectEmoji)}}
                                            set='apple'
                                            i18n={{ search: 'Search', categories: { search: 'Kết quả liên quan', recent: 'Gần đây' } }} 
                                            style={{ position: 'absolute', bottom: '60px', left: '70px' , borderRadius: '10px'}}
                                            perLine={8}
                                            color="#ae65c5"
                                            showPreview={false}
                                            showSkinTones={false}
                                        />
                                    ) : <></>
                                }
                                {/* <Emojify>{selectEmoji}</Emojify> */}
                            </div>
                            <TextareaAutosize
                                className="chatBoxInput" 
                                maxRows={4}
                                aria-label="maximum height"
                                placeholder="Soạn tin nhắn..."
                                onChange={(e) => setNewMessage(e.target.value)}
                                value={newMessage}
                                style={{ width: 200 }}
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSubmit()} }}
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
