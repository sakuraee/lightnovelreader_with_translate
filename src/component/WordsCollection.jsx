import { List, Typography } from 'antd';
import { getAllWordsFromDatabase } from '../utils/db';
import { useEffect, useState } from 'react';
import AudioButton from './AudioButton';

const WordsCollection = () => {
    const [data, setData] = useState([]);
    useEffect(() => {
        getAllWordsFromDatabase().then(res => {
            setData(res)
        })
    }, [])

    return (
        <List
            header={<div>词句收藏夹</div>}
            bordered
            dataSource={data}
            renderItem={(item) => (
                <List.Item style={{flexDirection:"column"}}>
                    <div>原文 ： {item.text}</div>
                    <div>译文 ：{item.translatedText}</div>
                    <div>假名拼音 ： {item.hiraganaText}</div>
                    <AudioButton audioSrc={item.audioSrc}/>
                </List.Item>
            )}
        />)

}




export default WordsCollection;