import { Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';

const AudioButton = ({ audioSrc, playbackRate }) => {
    const audioRef = useRef(null);
    const rate = playbackRate || localStorage.getItem("playbackRate") || 0.8
    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = rate;
    }, [rate, audioRef])
    return (<>
        <Button icon={<PlayCircleOutlined />} shape="circle" onClick={() => audioRef.current.play()} />
        <audio
            ref={audioRef}
            src={audioSrc}
            preload="true"
        /></>
    )
}




export default AudioButton;