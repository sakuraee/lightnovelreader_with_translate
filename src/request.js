
import jsonp from "jsonp";
import md5 from "blueimp-md5";
const APPID = process.env.REACT_APP_BAIDUAPPID;
const APPKEY = process.env.REACT_APP_BAIDUAPPKEY;
const getStrTranslate = (rawStr , from = "jp") => {
    const salt = String(Math.floor(Math.random() * 100000000))   
    const sign = md5(APPID + rawStr +salt + APPKEY)
    console.log("HELLO");
    console.log(APPID);
     
    return new Promise((resolve,reject)=>{
        const url = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${rawStr}&from=${from}&to=zh&appid=${APPID}&salt=${salt}&sign=${sign}`
        jsonp(url,(err,data)=>{
            resolve(data.trans_result[0].dst)
        })
    })

}

export default getStrTranslate;