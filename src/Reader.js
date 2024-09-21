import React, { useRef, useEffect, useState } from 'react';
import ePub from 'epubjs';
import getStrTranslate from "./request";
import { Button, Checkbox, Modal, Tooltip } from "antd";
import { StarOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import debounce from 'lodash.debounce';
import WordsCollection from './component/WordsCollection';
import AudioButton from './component/AudioButton';
import log from './utils/log';
import { addWordToDatabase } from './utils/db';
import "./reader.scss"
const TIPTEXT = "框选语句即可以获取读音以及翻译"
const EPUBURL = '../負けヒロインが多すぎる！ (ガガガ文庫) (雨森たきび) (Z-Library).epub'
const DEBOUNCE_WAIT = 200;


const Reader = ({ kuroshiro }) => {
    const fileInputRef = useRef(null);
    const [selectionText, setSelectionText] = useState("");
    const [bookrendition, setBookRendition] = useState(null);
    const [hiraganaText, setHiraganaText] = useState(null);
    const [translatedText, setTranslatedText] = useState("")
    const [audioSrc, setAudioSrc] = useState("");
    const [bookData, setBookData] = useState(null);

    const [collectionModal, setCollectionModal] = useState(false);

    const fliterRbText = (innerHTMLStr) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = innerHTMLStr;
        const rbNodes = tempDiv.querySelectorAll('rb');
        log.info("nodes");
        log.info(rbNodes);
        return Array.from(rbNodes).map(node => node.textContent).join("");
    }

    useEffect(() => {
        const fetchEpub = async () => {
            log.info("fetchEpub");

            try {
                const response = await fetch(EPUBURL);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const arrayBuffer = await response.arrayBuffer();
                setBookData(arrayBuffer);
            } catch (error) {
                console.error('Failed to load EPUB:', error);
            }
        };
        log.info(localStorage.getItem('bookProgress'));
        ;
        fetchEpub();

    }, []);
    useEffect(() => {
        if (selectionText) {
            setAudioSrc(`http://dict.youdao.com/dictvoice?le=jap&audio=${selectionText}&type=2`)

            getStrTranslate(selectionText).then((res) => {
                log.info(res);
                setTranslatedText(res);
            })
            if (kuroshiro) {
                kuroshiro.convert(selectionText, { to: "hiragana" }).then(setHiraganaText);
            }
        }
    }, [selectionText]);
    let firstLoad = 1;
    useEffect(() => {
        let debouncedResize = null;
        if (bookData) {
            const book = ePub(bookData);
            const rendition = book.renderTo("read", {
                width: window.innerWidth,
                height: window.innerHeight * 0.80,
            })
            if (firstLoad === 1 && localStorage.getItem('autoSaveProgress') === "true" && localStorage.getItem('bookProgress')) {
                rendition.display(localStorage.getItem('bookProgress'));
                log.info("asd23123");
                log.info(localStorage.getItem('bookProgress'));

                firstLoad = 0;
            } else {
                rendition.display();
            }

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
                    log.info('Window resized, adjusting rendition size...');
                    rendition.resize(window.innerWidth, window.innerHeight * 0.80);
                }
            };
            function saveProgressBeforeUnload() {
                localStorage.setItem('bookProgress', rendition.location.start.cfi);
            };

            window.addEventListener('beforeunload', saveProgressBeforeUnload)
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
        log.info(bookrendition.location.start.cfi);
        if (bookrendition) {
            bookrendition.next();
        }
    };
    const handleAutoSaveChange = (e) => {
        if (e.target.checked == false) {
            localStorage.removeItem("bookProgress");
        }
        localStorage.setItem("autoSaveProgress", e.target.checked)
    }
    const saveCurrentWords = () => {
        let item = {
            text: selectionText,
            audioSrc,
            translatedText,
            hiraganaText
        }
        addWordToDatabase(item);
        log.info(item);
        
    }
    return (
        <div>
            <div className='header'><div><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".epub" />
                <div>{selectionText}</div>
                <div>{translatedText}</div>
                <div>{hiraganaText}</div>
                {selectionText && (<>
                    <AudioButton audioSrc={audioSrc}/>
                    <Button icon={<StarOutlined />} shape="circle" onClick={saveCurrentWords} />
                </>
                )}
            </div>
                <div className="operations">
                    <Tooltip title={TIPTEXT}>
                        <Button icon={<QuestionCircleOutlined />} shape="circle" />
                    </Tooltip>
                    <div>
                        <Button icon={<StarOutlined />} shape="circle" onClick={() => setCollectionModal(true)} />
                        <span>词句收藏夹</span>
                    </div>
                    <Checkbox onChange={handleAutoSaveChange} defaultChecked={localStorage.getItem("autoSaveProgress") === "true"}>自动保存阅读进度</Checkbox>
                </div>
            </div>
            <div className='main'><div id="read"></div></div>
            <div className='bottom'><button onClick={handlePrev} disabled={!bookrendition}>Prev</button>
                <button onClick={handleNext} disabled={!bookrendition}>Next</button></div>

            <Modal open={collectionModal} footer={null} onCancel={() => setCollectionModal(false)}><WordsCollection /></Modal>


        </div>
    );
};

export default Reader;