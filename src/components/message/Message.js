import { dateFormat } from '../../actions/format';
import React from 'react'
import './Message.css';
import { useSelector } from 'react-redux';

export default function Message({message, own, userData}) {
    const { users } = useSelector((state) => state.conversation);
    const currentUser = users.find((user) => user._id === message.sender);

    console.log(users);
    return (
        own ? (
            <div className="message own">
                <div className="messageTop">
                    <p className="messageTopText">
                        {message.text}
                    </p>
                    <img
                        className="messageTopImg"
                        src={userData?.profilePicture}
                        alt=""
                    />
                </div>
                <div className="messageBottom">{dateFormat(message.createdAt)}</div>
            </div>
        ) : (
            <div className="message">
                <div className="messageTop">
                    <img
                        className="messageTopImg"
                        src={currentUser?.profilePicture}
                        alt=""
                    />
                    <p className="messageTopText">
                        {message.text}
                    </p>
                </div>
                <div className="messageBottom">{dateFormat(message.createdAt)}</div>
            </div>
        )
    )
}
