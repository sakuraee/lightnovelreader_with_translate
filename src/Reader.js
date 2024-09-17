import React, { useRef, useEffect, useState } from 'react';
import ePub from 'epubjs';
import "./reader.scss"
import getStrTranslate from "./request";
import { Button }from"antd";
import { PlayCircleOutlined } from '@ant-design/icons';
import debounce from 'lodash.debounce';

// 初始化
// 这里使用了async/await, 你同样也可以使用Promise

const Reader = ({kuroshiro}) => {
    //const result = kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { to: "hiragana" });

    const fileInputRef = useRef(null);
    const [selectionText, setSelectionText] = useState("");
    const [bookrendition, setBookRendition] = useState(null);
    const [hiraganaText ,setHiraganaText] = useState(null);
    const [translatedText, setTranslatedText] = useState("")
    const audioRef = useRef(null);
    const [audioSrc, setAudioSrc] = useState("");
    const [bookData, setBookData] = useState(null);
    const epubUrl = '../負けヒロインが多すぎる！ (ガガガ文庫) (雨森たきび) (Z-Library).epub'
    const DEBOUNCE_WAIT = 200;

    const fliterRbText = (innerHTMLStr) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = innerHTMLStr;
        const rbNodes = tempDiv.querySelectorAll('rb');
        console.log("nodes");
        console.log(rbNodes);
        return Array.from(rbNodes).map(node => node.textContent).join("");
    }

    useEffect(() => {
        const fetchEpub = async () => {
            console.log("fetchEpub");
            
            try {
                const response = await fetch(epubUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const arrayBuffer = await response.arrayBuffer();
                setBookData(arrayBuffer);
            } catch (error) {
                console.error('Failed to load EPUB:', error);
            }
        };
        fetchEpub();

    }, []);
    useEffect(() => {
        if (selectionText) {
            setAudioSrc(`http://dict.youdao.com/dictvoice?le=jap&audio=${selectionText}&type=2`) 
            console.log(`http://dict.youdao.com/dictvoice?le=jap&audio=${selectionText}&type=2`);
            
            getStrTranslate(selectionText).then((res) => {
                console.log(res);
                setTranslatedText(res);
            })
            if(kuroshiro){
                kuroshiro.convert(selectionText, { to: "hiragana" }).then(setHiraganaText);
            }
        }
    }, [selectionText]);

    useEffect(() => {
        let debouncedResize = null;
        if (bookData) {
            const book = ePub(bookData);
            const rendition = book.renderTo("read", {
                width: window.innerWidth,
                height: window.innerHeight * 0.80,
            })
            rendition.display();
            let selectHandle = (_, Contents) => {
                let selection = Contents.document.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);

                    const fragment = range.cloneContents();
                    let selectText = Array.from(fragment.childNodes).map(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'RUBY') {
                            return fliterRbText(node.innerHTML)

                        } else {
                            return node.textContent.trim()
                        }
                    }).join("");
                    setSelectionText(selectText)
                }

            }
            let debouncedSelectHandle = debounce(selectHandle, 500);
            rendition.on('selected', debouncedSelectHandle);
            setBookRendition(rendition);
            function resizeHandler() {
                if (rendition) {
                    console.log('Window resized, adjusting rendition size...');
                    rendition.resize(window.innerWidth, window.innerHeight * 0.80);
                }
            };
            debouncedResize = debounce(resizeHandler, DEBOUNCE_WAIT);
            window.addEventListener('resize', debouncedResize);
        }
        return () => {
            window.removeEventListener('resize', debouncedResize);
        };
    }, [bookData]
    )

    const handleFileChange = async (e) => {
        setBookData(null);

        document.getElementById('read').innerHTML = '';
        const file = e.target.files[0];
        if (!file || file.type !== 'application/epub+zip') {
            alert('Please upload an EPUB file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setBookData(e.target.result);
        };

        reader.readAsArrayBuffer(file);

    };
    const handlePrev = () => {
        if (bookrendition) {
            bookrendition.prev();
        }
    };

    const handleNext = () => {
        if (bookrendition) {
            bookrendition.next();
        }
    };


    return (
        <div>
            <div className='header'><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".epub" />
                <div>{selectionText}</div>
                <div>{translatedText}</div>
                <div>{hiraganaText}</div>
                <div></div>
                <Button type="primary" icon={<PlayCircleOutlined />}  shape="circle" onClick={()=>audioRef.current.play()}/>
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    preload="true"
                />
            </div>
            <div className='main'><div id="read"></div></div>
            <div className='bottom'><button onClick={handlePrev} disabled={!bookrendition}>Prev</button>
                <button onClick={handleNext} disabled={!bookrendition}>Next</button></div>
        </div>
    );
};

export default Reader;