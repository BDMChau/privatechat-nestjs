import React, { useState, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import './SendMessageForm.css';
import { Button, Input, Form } from 'antd';
import { sendMessageSocket, sendImageSocket, sendStickerSocket } from '../../../socket/socketClient';
import { stickerPiyomaruArray } from '../../../utils/sticker/piyomaru'
import { AreaChartOutlined, SendOutlined, TagsOutlined } from '@ant-design/icons';
import { Context } from '../../../context/AppContext';
import msgApi from '../../../api/msgApi';

const SendMessageForm = (props) => {
    const [message, setMessage] = useState('');
    const [urlImage, setUrlImages] = useState('');
    const [urlSticker, setUrlSticker] = useState('');

    const [hoverImageBtn, setHoverImageBtn] = useState(Boolean);
    const [hoverSendBtn, setHoverSendBtn] = useState(Boolean);
    const [hoverStickerBtn, setHoverStickerBtn] = useState(Boolean);
    const [displaySticker, setDisplaySticker] = useState(Boolean);

    const inputRef = useRef();
    const { state } = useContext(Context);


    useEffect(() => {
        inputRef.current.focus();
        setMessage('');
        setUrlImages('');
    }, [props.selectedId])

    // send image
    useEffect(() => {
        if (urlImage) {
            sendImageSocket(urlImage, props.selectedId, state._id);
            setUrlImages('');
        }
    }, [urlImage, props.selectedId, state._id])

    // send sticker
    useEffect(() => {
        if (urlSticker) {
            sendStickerSocket(urlSticker, props.selectedId, state._id);
            setUrlSticker('');
        }
    }, [urlSticker, props.selectedId, state._id])

    // send text
    const sendMessage = (e) => {
        if (e) {
            e.preventDefault();

            const trimmedMess = message.trim();
            if (trimmedMess) {
                sendMessageSocket(trimmedMess, props.selectedId, state._id);
                setMessage('');
            }
        }
    }


    const handlePostImage = async (data) => {
        try {
            var formData = new FormData();
            formData.append("file", data);
            formData.append("upload_preset", "chatApp");
            formData.append("cloudinary_name", "do3l051oy");
            formData.append('folder', 'chatApp_MessageImage');

            const dataResponse = await msgApi.postImageToCloud(formData);

            setUrlImages(dataResponse.url);
            return;

        } catch (error) {
            console.log(error);
        }
    }


    const renderStickerCollection = () => {
        return (
            <div className="sticker-container">

                { stickerPiyomaruArray.map((sticker, i) => {
                    return (
                        <img key={i} className="sticker-item" src={sticker} onClick={(e) => setUrlSticker(e.target.src)} alt='' />
                    )
                })}
            </div>
        )

    }

    return (
        <div className="send-mess-form">
            {displaySticker
                ? renderStickerCollection()
                : null
            }
            <Form
                className="input"
                onKeyPress={(e) => e.key === 'Enter' ? sendMessage(e) : null}
            >
                <Input
                    className="input-text"
                    title="Type a message..."
                    type="text"
                    value={message}
                    placeholder="Type a message..."
                    onChange={(e) => setMessage(e.target.value)}
                    ref={inputRef}
                />

                <div className="btn">
                    <div
                        className="sticker-box"
                        onClick={() => setDisplaySticker(!displaySticker)}
                        onMouseOver={() => setHoverStickerBtn(true)}
                        onMouseLeave={() => setHoverStickerBtn(false)}
                    >
                        <TagsOutlined className="sticker-icon" style={{ color: hoverStickerBtn ? '#0e7adc' : '#238ff1' }} />
                    </div>

                    <div className="image-box">
                        <Input
                            className="input-image"
                            value={""}
                            title="Photos"
                            type="file"
                            onChange={(e) => handlePostImage(e.target.files[0])}
                            onMouseOver={() => setHoverImageBtn(true)}
                            onMouseLeave={() => setHoverImageBtn(false)}
                        />
                        <AreaChartOutlined className="photo-icon" style={{ color: hoverImageBtn ? '#0e7adc' : '#238ff1' }} />
                    </div>

                    <Button
                        className="btn-send"
                        title="Send"
                        type="submit"
                        onClick={(e) => sendMessage(e)}
                        onMouseOver={() => setHoverSendBtn(true)}
                        onMouseLeave={() => setHoverSendBtn(false)}
                    >
                        <SendOutlined className="send-icon" style={{ color: hoverSendBtn ? '#0e7adc' : '#238ff1' }} />
                    </Button>
                </div>
            </Form>
        </div>
    );
}

SendMessageForm.propTypes = {
    selectedId: PropTypes.string
}

export default SendMessageForm;
