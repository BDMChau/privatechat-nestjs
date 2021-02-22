import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import './MessageList.css';
import { Context } from '../../../context/AppContext';
import { defaultAvatar } from '../../../utils/avatar/avatar'
import { endDomain } from '../../../config/Api';
import axios from 'axios';


const MessageList = (props) => {
    const [selected, setSelected] = useState(null);
    const [latestMessOnl, setLatestMessOnl] = useState([]);
    const [latestMessOff, setLatestMessOff] = useState([]);
    const {
        state,

        listOnl,
        setListOnl,

        listOff,
        setListOff,
    } = useContext(Context);

    const handleSelectUser = (user) => {
        setSelected(user._id);
        props.selectedUser(user);
    }


    // get list online
    useEffect(() => {
        axios({
            method: 'post',
            url: `${endDomain}/user/messagelistonline`,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": JSON.parse(localStorage.getItem("token"))
            },
            data: {
                userId: state._id
            }
        })
            .then((res) => {
                localStorage.setItem('listonline', JSON.stringify(res.data));
                setListOnl({ type: "LIST_USER_ONLINE", payload: res.data });

                // get latestMessOnl
                res.data.map((data) => {
                    axios({
                        method: 'post',
                        url: `${endDomain}/user/latestmessage`,
                        data: {
                            userId: state._id,
                            selectedId: data._id
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': JSON.parse(localStorage.getItem('token'))
                        }
                    })
                        .then((res) => {
                            if (res.data.err) {
                                return;
                            }
                            setLatestMessOnl(mess => [...mess, res.data]);
                        })
                        .catch((err) => {
                            console.log(err);
                        })

                    return null;
                })
            })
            .catch((err) => {
                console.log(err);
            })
        // const fetchListOnline = async () => {
        //     try {
        //         const data = {
        //             userId: state._id
        //         };

        //         const dataResponse = await msgApi.fetchListOnline(data, token);

        //         localStorage.setItem('listonline', JSON.stringify(dataResponse));
        //         setListOnl({ type: "LIST_USER_ONLINE", payload: dataResponse });

        //         // get latestMessOnl
        //         dataResponse.map(async (user) => {
        //             try {
        //                 const data = {
        //                     userId: state._id,
        //                     selectedId: user._id
        //                 };

        //                 const dataResponse = await msgApi.fetchLatestMessage(data, token);

        //                 if (dataResponse.err) {
        //                     return;
        //                 }

        //                 setLatestMessOnl(mess => [...mess, dataResponse]);
        //                 return;
        //             } catch (error) {
        //                 console.log(error);
        //             }

        //         })
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }

        // fetchListOnline();

    }, []);

    // get list offline
    useEffect(() => {
        axios({
            method: 'post',
            url: `${endDomain}/user/messagelistoffline`,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": JSON.parse(localStorage.getItem("token"))
            },
            data: {
                userId: state._id
            }
        })
            .then((res) => {
                localStorage.setItem('listoffline', JSON.stringify(res.data));
                setListOff({ type: "LIST_USER_OFFLINE", payload: res.data });

                // get latestMessOff
                res.data.map((data) => {
                    axios({
                        method: 'post',
                        url: `${endDomain}/user/latestmessage`,
                        data: {
                            userId: state._id,
                            selectedId: data._id
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': JSON.parse(localStorage.getItem('token'))
                        }
                    })
                        .then((res) => {
                            if (res.data.err) {
                                return;
                            }
                            setLatestMessOff(mess => [...mess, res.data]);
                        })
                        .catch((err) => {
                            console.log(err);
                        })

                    return null;
                })
            })
            .catch((err) => {
                console.log(err);
            })
        // const fetchListOffline = async () => {
        //     try {
        //         const data = {
        //             userId: state._id
        //         }
        //         const dataResponse = await msgApi.fetchListOffline(data, token);

        //         localStorage.setItem('listoffline', JSON.stringify(dataResponse));
        //         setListOff({ type: "LIST_USER_OFFLINE", payload: dataResponse });

        //         // get latestMessOff
        //         dataResponse.map(async (user) => {
        //             try {
        //                 const data = {
        //                     userId: state._id,
        //                     selectedId: user._id
        //                 };

        //                 const dataResponse = await msgApi.fetchLatestMessage(data, token);

        //                 if (dataResponse.err) {
        //                     return;
        //                 }

        //                 setLatestMessOff(mess => [...mess, dataResponse]);
        //                 return;

        //             } catch (error) {
        //                 console.log(error);
        //             }
        //         })
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }

        // fetchListOffline();
    }, []);


    // update realtime lastest message
    useEffect(() => {
        if (props.latestMessage.to) {
            // user online
            if (props.latestMessage.to.online === 'Y') {
                setLatestMessOnl(latestMessOnl.filter(mess => mess.to._id !== props.latestMessage.to._id));
                setLatestMessOnl(mess => [...mess, props.latestMessage])
            }

            // user offline
            if (props.latestMessage.to.online === 'N') {
                setLatestMessOff(latestMessOff.filter(mess => mess.to._id !== props.latestMessage.to._id));
                setLatestMessOff(mess => [...mess, props.latestMessage])
            }
        }
    }, [props.latestMessage])


    const renderLatestMessOnl = (selectedId) => {
        return (
            latestMessOnl.map((mess, i) => {
                if (mess) {
                    const fromUser = mess.from._id;
                    const toUser = mess.to._id;

                    if (selectedId === fromUser) {
                        if (mess.message) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >{mess.from.shortname}: {mess.message}</span>
                        }
                        else if (mess.images) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >{mess.from.shortname} sent a photo</span>
                        }
                        else if (mess.sticker) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >{mess.from.shortname} sent a sticker</span>
                        }
                    }

                    if (selectedId === toUser) {
                        if (mess.message) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >You: {mess.message}</span>
                        }
                        else if (mess.images) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >You sent a photo</span>
                        }
                        else if (mess.sticker) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >You sent a sticker</span>
                        }
                    }
                }
                return null;
            })
        )
    }

    const renderLatestMessOff = (selectedId) => {
        return (
            latestMessOff.map((mess, i) => {
                if (mess) {
                    const fromUser = mess.from._id;
                    const toUser = mess.to._id;

                    if (selectedId === fromUser) {
                        if (mess.message) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >{mess.from.shortname}: {mess.message}</span>
                        }
                        else if (mess.images) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >{mess.from.shortname} sent a photo</span>
                        }
                        else if (mess.sticker) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >{mess.from.shortname} sent a sticker</span>
                        }
                    }
                    if (selectedId === toUser) {
                        if (mess.message) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >You: {mess.message}</span>
                        }
                        else if (mess.images) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >You sent a photo</span>
                        }
                        else if (mess.sticker) {
                            return <span key={i} style={{ color: '#00000091', fontWeight: '500' }} >You sent a sticker</span>
                        }
                    }
                }
                return null;
            })
        )
    }

    const renderList = () => {
        if (window.innerWidth <= 414) {
            return (
                <div className="chat-list">
                    <br />
                    <span className="onl-off-space">
                        Online
                        <img src={require('../../../assets/img/online.png')} style={{ width: '15px', margin: '0 0 4px 5px' }} alt="" />
                    </span>

                    {listOnl
                        ? listOnl.map((user) => {
                            const active = selected === user._id ? 'active' : '';
                            return (
                                <li
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className={'user ' + active}
                                >
                                    <div className='list-user' style={{ justifyContent: 'center' }}>
                                        <div className='user-ava' style={{ width: '50px', height: '50px' }}>
                                            <div className='user-avatar' style={{ backgroundImage: `url(${user.avatar ? user.avatar : defaultAvatar})` }}></div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                        : null
                    }
                    <br />
                    <span className="onl-off-space">
                        Offline
                        <img src={require('../../../assets/img/offline.png')} style={{ width: '11px', margin: '0 0 4px 6px' }} alt="" />
                    </span>
                    {listOff
                        ? listOff.map((user) => {
                            const active = selected === user._id ? 'active' : '';
                            return (
                                <li
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    title={user.name}
                                    className={'user ' + active}
                                >
                                    <div className='list-user' style={{ justifyContent: 'center' }}>
                                        <div className='user-ava' style={{ width: '50px', height: '50px' }}>
                                            <div className='user-avatar' style={{ backgroundImage: `url(${user.avatar ? user.avatar : defaultAvatar})` }}></div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                        : null
                    }
                </div>
            )
        } else {
            return (
                <div className="chat-list">
                    <br />
                    <span className="onl-off-space">
                        Online
                        <img src={require('../../../assets/img/online.png')} style={{ width: '15px', margin: '0 0 4px 5px' }} alt="" />

                    </span>
                    {listOnl
                        ?
                        listOnl.map((user) => {
                            const active = selected === user._id ? 'active' : '';
                            return (
                                <li
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className={'user ' + active}
                                >
                                    <div className='list-user'>
                                        <div className='user-ava'>
                                            <div className='user-avatar' style={{ backgroundImage: `url(${user.avatar ? user.avatar : defaultAvatar})` }}></div>
                                        </div>
                                        <div className="user-latest-mess">
                                            <p className="user-name">
                                                {user.name}
                                            </p>
                                            <p className="latest-mess">
                                                {latestMessOnl
                                                    ? renderLatestMessOnl(user._id)
                                                    : null
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                        : null
                    }
                    <br />
                    <span className="onl-off-space">
                        Offline
                        <img src={require('../../../assets/img/offline.png')} style={{ width: '11px', margin: '0 0 4px 6px' }} alt="" />
                    </span>

                    {listOff
                        ? listOff.map((user) => {
                            const active = selected === user._id ? 'active' : '';
                            return (
                                <li
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    title={user.name}
                                    className={'user ' + active}
                                >
                                    <div className='list-user'>
                                        <div className='user-ava'>
                                            <div className='user-avatar' style={{ backgroundImage: `url(${user.avatar ? user.avatar : defaultAvatar})` }}></div>
                                        </div>
                                        <div className="user-last-mess">
                                            <p className="user-name">
                                                {user.name}
                                            </p>
                                            <p className="latest-mess">
                                                {latestMessOff
                                                    ? renderLatestMessOff(user._id)
                                                    : null
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                        : null
                    }
                </div>
            )
        }
    }

    return (
        renderList()
    );
}

MessageList.propTypes = {
    latestMessage: PropTypes.shape({
        to: PropTypes.shape({
            online: PropTypes.string,
            _id: PropTypes.string
        }),
    }),
    selectedUser: PropTypes.func
}

export default MessageList;
