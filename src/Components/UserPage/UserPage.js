import React from 'react';
import {useState, useEffect} from 'react';
import { Redirect, useParams } from "react-router-dom";

import Button from '@material-ui/core/Button';
import NavBar from '../Nav/NavBar';
import Post from './Post';
import noprofile from './noprofile.png';
import CircularProgress from '@material-ui/core/CircularProgress';

const axios = require('axios');

const bodyStyle = {
    width: '980px',
    margin: '80px auto 0 auto',
    minHeight: '1000px',
    height: 'auto'
}

const headStyle = {
    display: 'flex',
    width: '80%',
    margin: '0 auto 0 auto',
    height: '250px'
}

const profileImageStyle = {
    borderRadius: '100%',
    width: '170px',
    height: '170px'
}

const infoStyle = {
    marginLeft: '12%',
    width: '600px',
}

const buttonStyle ={
    height: '30px',
    margin: '25px auto auto 20%'
}

const textStyle = {
    fontFamily: 'Roboto'
}

const hrStyle = {
    borderWidth: '1.2px',
    borderColor: 'lightgrey',
    borderTopStyle: 'none',
    borderBottomStyle: 'solid',
    marginTop: '20px'
}

const followStyle = {
    display: 'flex'
}

const inStyle = {
    marginLeft : '60px',
    fontFamily: 'Roboto'
}

const postContainer = {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
}

const loadingDivStyle = {
    width: '100%',
    textAlign: 'center'
}

const loaderStyle = {
    margin: '400px 0 0 0'
}


const UserPage = ({currentUserId,setCurrentUserId,currentUserName,setCurrentUserName}) => {

    const { username } = useParams();
    const [err, setErr] = useState(0);
    const [auth, setAuth] = useState(1);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [noUser, setNoUser] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [profilePhoto, setProfilePhoto] = useState(noprofile);
    const [profileName, setProfileName] = useState('http://localhost:3000/public/users/6120dff44095e24cacd44e52/profile/profile.png');
    const [userid, setUserId] = useState('0');
    const [posts, setPosts] = useState([]);
    const [following, setFollowing] = useState(0);
    const [componentLoading, setComponentLoading] = useState(0);

    useEffect(() => {
        
        const getData = async () => {
            let res = await axios.get('http://localhost:3000/main-page',{
                'headers' : {
                    'Authorization': 'Bearer '+ localStorage.getItem('token')
                }
            });
            if(res.data.err === 1){
                setErr(1);
            }
        }

        const getUser = async () => {
            let res = await axios.get('http://localhost:3000/userprofile/' + username,{
                'headers' : {
                    'Authorization': 'Bearer '+ localStorage.getItem('token')
                }
            });
            console.log(res.data);
            if(res.data.user === null){
                setNoUser(1);
            }
            else {
                setProfileName(res.data.user.username);
                setPostCount(res.data.user.posts.length);
                console.log(res.data.user.followers);
                setFollowerCount(res.data.user.followers.length);
                setFollowingCount(res.data.user.following.length);
                setProfilePhoto('http://localhost:3000/public/users/' + '6120dff44095e24cacd44e52' + '/profile/profile.png');
                setUserId(res.data.user._id);
                setPosts(res.data.user.posts);
                setCurrentUserId(res.data.authData.user._id);
                if(res.data.user.followers.includes(res.data.authData.user._id)){
                    setFollowing(1);
                }
            }
        }

        if(localStorage.getItem('token')){
            console.log('tokenexists');
            getData();
            if(err === 1){
                setAuth(0);
                setComponentLoading(1);
            }
            else{
                setAuth(1);
                getUser().then(() => {
                    setComponentLoading(1);
                });
            }
        }
        else {
            setAuth(0);
            setComponentLoading(1);
        }
    }, [token]);

    function refreshPage(){ 
        window.location.reload(); 
    }

    const followUser = async () => {
        let followMessage = await axios.post("http://localhost:3000/follow/"+userid,{} ,{
            'headers' : {
                'Authorization': 'Bearer '+ localStorage.getItem('token')
            }
        });
        console.log(followMessage);
        refreshPage();
    }

    const unfollowUser = async () => {
        let unfollowMessage = await axios.post("http://localhost:3000/unfollow/"+userid,{} ,{
            'headers' : {
                'Authorization': 'Bearer '+ localStorage.getItem('token')
            }
        });
        console.log(unfollowMessage);
        refreshPage();
    }

    if(componentLoading === 0){
        return(
            <div style={loadingDivStyle}>
                <CircularProgress style={loaderStyle}/>
            </div>
        );
    }

    return(
        <div>
            <NavBar
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            setAuth={setAuth}/>
            <div style={bodyStyle}>
                <div style={headStyle}>
                    {userid !== '0' ?  <img src={'http://localhost:3000/public/users/'+userid+'/profile/profile.png'} style={profileImageStyle} alt={noprofile} srcset="" /> :
                    <img src={noprofile} style={profileImageStyle} alt="" srcset="" /> }
                    <div style={infoStyle}>
                        <div style={followStyle}>
                            <h1 style={textStyle}>
                                {profileName}
                            </h1>
                            {
                                following === 0 ?   <Button variant="contained" color="primary" href="#contained-buttons" style={buttonStyle} onClick={followUser}>
                                                        Follow
                                                    </Button> :
                                                    <Button variant="contained" href="#contained-buttons" style={buttonStyle} onClick={unfollowUser}>
                                                        Unfollow
                                                    </Button> 
                            }
                            
                        </div>
                        <div style={followStyle}>
                            <h4 style={textStyle}>{postCount} posts</h4>
                            <h4 style={inStyle}>{followerCount} followers</h4>
                            <h4 style={inStyle}>{followingCount} following</h4>
                        </div>
                        <p>A very long explanation Kal'18</p>
                    </div>
                </div>
                <hr style={hrStyle}/>
                <div style={postContainer}>
                    {!posts.isEmpty ? 
                    posts.map(post => {
                        return <Post key={post._id} userid={userid} post={post}/>
                    })
                    : null}
                </div>
            </div>
            {auth === 1 ? null : <Redirect to='/'/>}
            {noUser === 0 ? null : <Redirect to='/home'/>}
        </div>
    )
}

export default UserPage;