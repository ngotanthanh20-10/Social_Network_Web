import { 
    ExpandMore, Favorite, MoreVert, Delete, Edit 
} from '@material-ui/icons';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Card, CardActions, 
    CardContent, CardHeader, 
    Collapse, Divider, IconButton, 
    List, ListItem, ListItemText, Typography} from '@material-ui/core';
import { CircularProgress, TextField } from '@mui/material';
import { Comment } from '@mui/icons-material';
import Emojify from 'react-emojione';
    
    
import useStyles from './styles';
import { addComment, deletePost, likePost } from '../../actions/post';
import { deleteImage } from '../../actions/images';
import ImagesList from '../imageList/ImagesList';
import CommentComponent from '../comment/CommentComponent';
import { dateFormat } from '../../actions/format';
import { getComments, getUser } from '../../api';
import { Link, useHistory } from 'react-router-dom';

export default function Post({post}) {
    const user = JSON.parse(localStorage.getItem('profile'));
    const [currentPost, setCurrentPost] = useState(post);
    const [userPost,setUserPost] = useState({});
    
    const [liked, setLiked] = useState(post.likes.length);
    const [commented, setCommented] = useState(0);
    const [comment, setComment] = useState('');
    const [comments,setComments] = useState([]);
    const [isLiked, setIsLiked] = useState(currentPost.likes.includes(user.result._id));
    const [isMoreBox,setIsMoreBox] = useState(false);
    const dispatch = useDispatch();
    const {deleting} = useSelector(state => state.posts);
    const classes = useStyles();
    const history = useHistory();

    const [expanded, setExpanded] = React.useState(false);

    const {posts} = useSelector((state) => state.posts);
    
    useEffect(() => {
        const getUserPost = async () => {
            try {
                const user = await getUser(post.userId);
                setUserPost(user.data)
            } catch (error) {
                console.log(error);
            }
        }
        getUserPost();
        return () => {
            setUserPost({});
        }
    }, [post.userId]);

    useEffect(() => {
        posts.forEach(post => {
            if(post._id === currentPost._id) {
                setCurrentPost(post);
            }
        });
        setCommented(comments.length);
    }, [posts,currentPost,comments]);

    useEffect(() => {
        const getCmt = async() => {
            try {
                const comments = await getComments(post._id);
                setComments(comments.data);
            } catch (error) {
                console.log(error);
            }
        }
        getCmt();
    }, [post._id]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const likeHandler = () => {
        setLiked(isLiked ? liked-1 : liked+1);
        setIsLiked(!isLiked);
        dispatch(likePost(currentPost._id));
    };

    const deleteHandler = async() => {
        if(currentPost?.img) {
            for (let i = 0; i < currentPost.imgName.length; i++) {
                try {
                    await deleteImage(currentPost.imgName[i]);
                } catch (error) {
                    console.log(error);
                }
            }
            dispatch(deletePost(currentPost._id));
            setIsMoreBox(false);
        } else {
            dispatch(deletePost(currentPost._id));
        }
    };

    const upCmt = (newComment) => {
        dispatch(addComment(newComment));
    }


    const handleComment = () => {
        const commentForm = {
            postId: currentPost._id,
            img: user.result?.profilePicture,
            name: user.result.name,
            message: comment,
            likes: [],
            root: '1',
            createdAt: Date.now()
        }
        setComment('');
        comments.unshift(commentForm);
        setCommented(commented+1);
        upCmt(commentForm);
    }


    return (

        <Card className={classes.root} raised>
            <CardHeader
                avatar={
                    <Avatar aria-label="recipe" className={classes.avatar} src={userPost?.profilePicture}>
                        {/* { userPost?.name.charAt(0).toUpperCase() } */}
                    </Avatar>
                }
                title={
                    <>{
                    post?.feeling ?
                        <Link to={`/profile/${userPost?._id}`} style={{textDecoration: 'none', color: 'black'}}>
                            <div className={classes.name}>
                                {userPost?.name} đang cảm thấy <Emojify>{post.feeling}</Emojify>
                            </div>
                        </Link>
                    :
                        <Link to={`/profile/${userPost?._id}`} style={{textDecoration: 'none', color: 'black'}}>
                            <div className={classes.name}>
                                {userPost?.name}
                            </div>
                        </Link>
                    }
                    {post?.tag?.length > 0 && (
                        <div>
                            <span>cùng với {
                                post.tag.slice(0,2).map((tag,index) => (
                                    <strong 
                                        style={{color: '#2e81f4', fontSize: 15 , cursor: 'pointer'}}
                                        key={index}
                                        onClick={() => history.push(`/profile/${tag.key}`)}
                                    >
                                        @{tag.label}  
                                    </strong>))
                            }
                            </span>
                            <br/>
                            <span>{
                                post.tag.slice(2,post.tag.length).map((tag,index) => (
                                    <strong 
                                        style={{color: '#2e81f4', fontSize: 15 , cursor: 'pointer' }}
                                        key={index}
                                        onClick={() => history.push(`/profile/${tag.key}`)}
                                    >
                                    @{tag.label}  
                                    </strong>))
                            }</span>
                        </div>
                    )}
                    </>
                }
                subheader={dateFormat(currentPost.createdAt)}
                action={ user.result._id === userPost?._id &&
                    <IconButton aria-label="settings" className={classes.postTopRight} onClick={() => setIsMoreBox(!isMoreBox)}>
                        { deleting ? <CircularProgress size={22} /> : <MoreVert />}
                        {
                            isMoreBox &&
                            <div className={classes.postTopRight_morevert}>
                                <List component="nav" aria-label="secondary action">
                                    <ListItem
                                        button
                                    >
                                        <Edit fontSize="large"/>
                                        <ListItemText primary="Chỉnh sửa bài viết" className={classes.actionText} />
                                    </ListItem>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={deleteHandler}
                                    >
                                        <Delete fontSize="large"/>
                                        <ListItemText primary="Xóa bài viết" className={classes.actionText} />
                                    </ListItem>
                                </List>
                            </div>
                        }
                    </IconButton>
                }
            />
            {/* <CardMedia
                className={classes.media}
                image={`${post.img}`}
                title={post.imgName}
            /> */}
            {
                currentPost.img.length > 1 ? <ImagesList arrObj={currentPost.img}  /> : currentPost.img.length !== 0 &&
                <img src={currentPost.img} alt={currentPost.imgName} className={classes.media} />
            }
            <CardContent>
                <Typography variant="body2" color="textPrimary" component="p" className={classes.description}>
                    {currentPost.desc}
                </Typography>
            </CardContent>
            <CardActions disableSpacing>
                <IconButton aria-label="like" onClick={likeHandler}>
                    {isLiked ? <Favorite color="secondary" className={classes.favorite} /> : <Favorite />}
                </IconButton>
                <Typography color="textSecondary">{liked}</Typography>
                
                <Comment className={classes.cmtButton} color="primary" onClick={handleExpandClick} style={{ cursor: 'pointer' }} />
                
                <Typography color="textSecondary">{commented}</Typography>
                <IconButton
                className={clsx(classes.expand, {
                    [classes.expandOpen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
                >
                <ExpandMore />
                </IconButton>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <TextField 
                        label="Viết bình luận..." 
                        variant="standard" 
                        fullWidth 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleComment() }}
                    />
                    {
                        comments.length > 0 && 
                        comments.filter(comment => comment.root === '1').map((comment,index) => (
                            <CommentComponent 
                                comment={comment} 
                                user={user} 
                                upCmt={upCmt} 
                                postId={currentPost._id}
                                key={index} 
                            />
                        ))
                    }
                    
                </CardContent>
            </Collapse>
            </Card>
    )
}
