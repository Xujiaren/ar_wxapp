const emojis = {
    '[微笑]': '100',
    '[色]': '101',
    '[发呆]': '102',
    '[得意]': '103',
    '[鼓掌]': '104',
    '[害羞]': '105',
    '[闭嘴]': '106',
    '[调皮]': '107',
    '[呲牙]': '108',
    '[惊讶]': '109',
    '[酷]': '110',
    '[偷笑]': '111',
    '[憨笑]': '112',
    '[卖萌]': '113',
    '[拥抱]': '114',
    '[茶]': '115',
    '[咖啡]': '116',
    '[蛋糕]': '117',
    '[玫瑰]': '118',
    '[礼物]': '119',
    '[赞]': '120',
    '[握手]': '121',
    '[胜利]': '122',
    '[抱拳]': '123',
}
    
const emojiToPath = (i) => "https://arsxy.oss-cn-beijing.aliyuncs.com/app/emo/"+`${emojis[i]}`+".gif"
    
const textToEmoji = (s) => {

    const r = /\[[^\[\]]+?\]/g;
    const a = [];
    let t = null;
    let i = 0;

    while (true) {
        t = r.exec(s);

        if (!t) {
            s.slice(i) && a.push({
                msgType: 'text',
                msgCont: s.slice(i)
            });
            break;
        }

        (i !== t.index) && a.push({
            msgType: 'text',
            msgCont: s.slice(i, t.index)
        });

        if (emojis[t[0]]) {
            a.push({
                msgType: 'emoji',
                msgCont: t[0],
                msgImage: emojiToPath(t[0])
            });
        } else {
            a.push({
                msgType: 'text',
                msgCont: t[0]
            });
        }

        i = t.index + t[0].length; // 更新下一次匹配开始的序号
    }

    return a;
}
    
    
    
module.exports = {
    emojis,
    emojiToPath,
    textToEmoji,
}