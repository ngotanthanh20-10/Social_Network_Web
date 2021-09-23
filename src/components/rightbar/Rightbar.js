import React from 'react';
import './Rightbar.css';
import {Users} from '../../dummyData';
import Online from '../online/Online';
import PropTypes from 'prop-types';
import { makeStyles, AppBar, Tabs, Tab, Typography, Box, ImageList, ImageListItem, Button, useTheme } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import { useSelector } from 'react-redux';
import { Cake, Favorite, Home, Room, Work } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { withStyles } from '@mui/styles';

export default function Rightbar({profile}) {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER;
    const {authData} = useSelector((state)=>state.auth);

    const birthFormat = (birthday) => {
        if(birthday) {
            const splitStr = birthday.split('-');
            return `${splitStr[2]}/${splitStr[1]}/${splitStr[0]}`
        } else return "Chưa cập nhật"
    };

    const relationship = (rela) => {
        if(rela) {
            switch (rela) {
                case 1:
                    return "Độc thân";
            
                case 2:
                    return "Hẹn hò"

                case 3:
                    return "Kết hôn"

                default:
                    break;
            }
        } else return "Chưa cập nhật"
    }

    const echo = (info) => {
        return info ? info : "Chưa cập nhật"
    }

    const HomeRightBar = () => {
        return (
            <>
                <div className="birthContainer">
                    <img className="birthImg" src="/assets/gift.jpg" alt=""/>
                    <span className="birthText">
                        Hôm nay là sinh nhật của
                        <b> Naruto</b> and <b>3 người khác</b>
                    </span>
                </div>
                <hr className="rightbarHr"/>
                <img className="rightbarAd" src="assets/op.png" alt="" />
                <hr className="rightbarHr"/>
                <h4 className="rightbarTitle">Online Friends</h4>
                <ul className="rightbarFriendList">
                    {Users.map(u => (
                        <Online key={u.id} user={u}/>
                    ))}

                    {Users.map(u => (
                        <Online key={u.id} user={u}/>
                    ))}
                </ul>
            </>
        )
    }

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
      
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                <Box p={3}>
                    <Typography component={'div'}>{children}</Typography>
                </Box>
                )}
            </div>
        );
    }
      
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired,
    };
    
    const useStyles = makeStyles((theme) => ({
        friendAndPicture: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.paper,
        },
        
        picture: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
        },
        pictureList: {
            width: 430,
            height: 500,
        },
        indicator: {
            backgroundColor: 'white',
        },
    }));

    const StyledTabs = withStyles({
        indicator: {
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          '& > span': {
            maxWidth: 100,
            width: '100%',
            backgroundColor: '#fff',
          },
        },
    })((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

    const AntTab = withStyles(() => ({
        root: {
            textTransform: 'none',
            width: 80, 
            color: '#fff',
            fontSize: '0.813rem',
            marginRight: '-40px',
            '&:focus': {
              opacity: 5,
            },
        },
    }))((props) => <Tab disableRipple {...props} />);

    const ProfileRightbar = () => {
        const classes = useStyles();
        const theme = useTheme();
        const [value, setValue] = React.useState(0);

        const handleChange = (event, newValue) => {
            setValue(newValue);
        };
        const handleChangeIndex = (index) => {
            setValue(index);
        };
        

        return (
            <div className="rightbarProfile">
                <div className={classes.friendAndPicture}>
                    <AppBar position="static" className="rightbarAppbar">
                        <StyledTabs value={value} onChange={handleChange} aria-label="Tabs Profile" classes={{indicator: classes.indicator}} className="rightbarTabs">
                            <AntTab label="Bạn bè" />
                            <AntTab label="Ảnh" />
                            <AntTab label="Thông tin" />
                        </StyledTabs>
                    </AppBar>
                    <SwipeableViews
                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                        index={value}
                        onChangeIndex={handleChangeIndex}
                    >
                        <TabPanel value={value} index={0} className="rightbarTabPanel">
                            <div className="rightbarFollowings">
                                <div className="rightbarFollowing">
                                    <img src={`${PF}person/nene.jfif`} alt="" className="rightbarFollowingImg" />
                                    <span className="rightbarFollowingName">Nene</span>
                                </div>
                                <div className="rightbarFollowing">
                                    <img src={`${PF}person/berg.jfif`} alt="" className="rightbarFollowingImg" />
                                    <span className="rightbarFollowingName">Mark Zuckerberg</span>
                                </div>
                                <div className="rightbarFollowing">
                                    <img src={`${PF}person/bill.jfif`} alt="" className="rightbarFollowingImg" />
                                    <span className="rightbarFollowingName">Bill Gates</span>
                                </div>
                                <div className="rightbarFollowing">
                                    <img src={`${PF}person/luffy.jfif`} alt="" className="rightbarFollowingImg" />
                                    <span className="rightbarFollowingName">Monkey D Luffy</span>
                                </div>
                                <div className="rightbarFollowing">
                                    <img src={`${PF}person/naruto.jfif`} alt="" className="rightbarFollowingImg" />
                                    <span className="rightbarFollowingName">Uzumaki Naruto</span>
                                </div>
                                <div className="rightbarFollowing">
                                    <img src={`${PF}post/nene.jpg`} alt="" className="rightbarFollowingImg" />
                                    <span className="rightbarFollowingName">Nene</span>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={1} className="rightbarTabPanel">
                            <div className={classes.picture}>
                                <ImageList rowHeight={160} className={classes.pictureList} cols={3}>
                                {/* {itemData.map((item) => (
                                    <ImageListItem key={item.img} cols={item.cols || 1}>
                                    <img src={item.img} alt={item.title} />
                                    </ImageListItem>
                                ))} */}
                                    <ImageListItem cols={ 2 || 1}>
                                        <img src="https://image.shutterstock.com/image-photo/large-beautiful-drops-transparent-rain-260nw-668593321.jpg" alt="" />
                                    </ImageListItem>
                                    <ImageListItem cols={1}>
                                        <img src="https://cdn.stocksnap.io/img-thumbs/960w/chalet-wood_7PBFL1ERJT.jpg" alt="" />
                                    </ImageListItem>
                                    <ImageListItem cols={1}>
                                        <img src="https://cdn.stocksnap.io/img-thumbs/960w/bees-flower_BKHRBSRAUC.jpg" alt="" />
                                    </ImageListItem>
                                    <ImageListItem cols={2}>
                                        <img src="https://cdn.stocksnap.io/img-thumbs/280h/G88ECALHBL.jpg" alt="" />
                                    </ImageListItem>
                                    <ImageListItem cols={ 2 || 1}>
                                        <img src="https://cdn.stocksnap.io/img-thumbs/280h/husky-animal_UJVB2QEHNH.jpg" alt="" />
                                    </ImageListItem>
                                    <ImageListItem cols={1}>
                                        <img src="https://cdn.stocksnap.io/img-thumbs/280h/RJWIE303ZE.jpg" alt="" />
                                    </ImageListItem>
                                </ImageList>
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={2} className="rightbarTabPanel">
                            <Link to="/changeInfo" style={{textDecoration:"none"}}>
                                <Button variant="outlined" color="primary" href="/changeInfo">Chỉnh sửa thông tin</Button>
                            </Link>
                            <div className="rightbarInfo">
                                <div className="rightbarInfoItem">
                                    <Home className="rightbarInfoKey"/>
                                    <Typography className="rightbarInfoValue">{echo(authData.result?.city)}</Typography>
                                </div>
                                <div className="rightbarInfoItem">
                                    <Room className="rightbarInfoKey"/>
                                    <Typography className="rightbarInfoValue">{echo(authData.result?.from)}</Typography>
                                </div>
                                <div className="rightbarInfoItem">
                                    <Work className="rightbarInfoKey"/>
                                    <Typography className="rightbarInfoValue">{echo(authData.result?.job)}</Typography>
                                </div>
                                <div className="rightbarInfoItem">
                                    <Cake className="rightbarInfoKey"/>
                                    <Typography className="rightbarInfoValue">{birthFormat(authData.result?.birthday)}</Typography>
                                </div>
                                <div className="rightbarInfoItem">
                                    <Favorite className="rightbarInfoKey"/>
                                    <Typography className="rightbarInfoValue">{relationship(authData.result?.relationship)}</Typography>
                                    {/* <span className="rightbarInfoValue">{authData.result?.relationship}</span> */}
                                </div>
                            </div>
                        </TabPanel>
                    </SwipeableViews>
                </div>
                <hr className="rightbarHr"/> 
                <div className="rightbarOnlineFriendList">
                    <h4 className="rightbarTitle">Online Friends</h4>
                    <ul className="rightbarFriendList">
                        {Users.map(u => (
                            <Online key={u.id} user={u}/>
                        ))}

                        {Users.map(u => (
                            <Online key={u.id} user={u}/>
                        ))}
                    </ul>
                </div>
                
            </div>
        )
    }

    return (
        <div className="rightbar">
            <div className="rightbarWrapper">
                {profile ? <ProfileRightbar /> : <HomeRightBar />}
            </div>
        </div>
    )
}
