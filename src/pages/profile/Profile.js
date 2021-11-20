import React, { useEffect, useState } from 'react';
import './Profile.css';
import Sidebar from '../../components/sidebar/Sidebar';
import Rightbar from '../../components/rightbar/Rightbar';
import Feed from '../../components/feed/Feed';
import Topbar from '../../components/topbar/Topbar';
import { Button, Dialog, Avatar, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { PersonAddRounded, ChatRounded, DoneAllRounded, Edit } from '@mui/icons-material';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../../api';
import { followUser, unfollowuser } from '../../actions/user';
import {Link} from 'react-router-dom';
import { addNotification } from '../../actions/notifications';

export default function Profile() {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER;
    const id = useParams().id;
    const dispatch = useDispatch();

    const { authData } = useSelector((state) => state.auth);
    const { userData } = useSelector((state) => state.user);
    const { savedSocket } = useSelector((state) => state.socket);

    const [user, setUser] = useState({});
    const [followed, setFollowed] = useState(authData.result.followings.includes(id));
    const [isEditable, setIsEditable] = useState(false);
    const [isEditNameDialog, setIsEditNameDialog] = useState(false);

    useEffect(() => {
        setFollowed(userData.result.followings.includes(id));
    }, [userData,id]);
    
    useEffect(() => {
        console.log("fetch user");
        const fetchUsers = async() => {
            try {
                const res = await getUser(id);
                setUser(res.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchUsers();
    },[id]);
    
    // useEffect(() => {
    //     document.title = `SocialBook ${user.name && user.name}`;
    //     return () => {}
    // }, [user]);

    const handleAddFriend = () => {
        if(!followed) {
            dispatch(followUser(id));
            const waitToken = Date.now().toString();
            savedSocket?.current.emit('friendsNotify', { senderId: authData.result._id, receiverId: id, waitToken });
            const model = {
                sender: authData.result._id,
                receiver: id,
                action: 'đã bắt đầu theo dõi bạn 👀',
                type: 'friend',
                waitToken
            }
            dispatch(addNotification(model));
        } else {
            dispatch(unfollowuser(id));
        }
        setFollowed(!followed);
    }

    return (
        <> 
            <Topbar />
            <div className="profile">
                <Sidebar />
                <div className="profileRight">
                    <div className="profileRightTop">
                        <div className="profileCover">
                            <img 
                                className="profileCoverImg"
                                src={`${PF}coverPicture.png`}
                                alt=""
                            />
                            {/* <img 
                                className="profileUserImg" 
                                src={user.result.profilePicture ? user.result.profilePicture : PF+'person/defaultUser.jpg'}
                                alt=""
                            /> */}
                            <Avatar className="profileUserImg" src={user.profilePicture && user.profilePicture}></Avatar>

                        </div>
                        <div className="profileInfo"
                            // onMouseEnter={() => setIsEditable(true)}
                            // onMouseLeave={() => setIsEditable(false)}
                        >
                            <h4 className="profileInfoName">
                                {user.name && user.name}
                            </h4>
                            { isEditable && authData?.result._id === id &&
                                <Edit 
                                    fontSize="small" 
                                    color="action" 
                                    sx={{ position: 'absolute', top: '0', right: '42%', cursor: 'pointer'}} 
                                    onClick={() => setIsEditNameDialog(true)}
                                />
                            }
                        </div>
                        <Dialog open={isEditNameDialog} onClose={() => setIsEditNameDialog((prev) => !prev)}>
                            <DialogTitle>Chỉnh sửa tên của bạn</DialogTitle>
                            <DialogContent>
                                <TextField defaultValue={user.name} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setIsEditNameDialog(false)} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={() => setIsEditNameDialog(false)} color="primary">
                                    Ok
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {
                            authData?.result._id !== id && 
                            <div className="profileAddFriend">
                                {
                                    !followed ?
                                    <Button variant="contained" onClick={handleAddFriend}>
                                        Theo dõi &nbsp;
                                        <PersonAddRounded fontSize="small"/>
                                    </Button>
                                    :
                                    <Button onClick={handleAddFriend}>
                                        Đã theo dõi &nbsp;
                                        <DoneAllRounded fontSize="small" />
                                    </Button>
                                }
                                <Link to={`/chat?id=${id}`} style={{textDecoration: 'none'}}>
                                    <Button variant="outlined">
                                        Nhắn tin &nbsp;
                                        <ChatRounded fontSize="small" />
                                    </Button>
                                </Link>
                            </div>
                        }
                    </div>
                    <div className="profileRightBottom">
                    <Feed user={id} />
                    <Rightbar profile user={user} />
                    {/* <div className="feedComp"></div>
                    <div className="rightBarComp"></div> */}
                        
                    </div>
                </div>
            </div>
            
        
        </>
    )
}
