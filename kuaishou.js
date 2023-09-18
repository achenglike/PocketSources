async function kuaishou_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html
    var html = data.html;

    var title = '';
    const titleRegex = /<div[^>]+class="desc"[\s\S]*?<span[^>]+>([^<]+)<\/span>/i;
    const titleMatch = html.match(titleRegex);

    if (titleMatch && titleMatch.length >= 2) {
      title = titleMatch[1];
    }

    // regex take description
    var regexDesc = /<span[^>]*class="txt topic"[^>]*>(.*?)<\/span>/g;
    var descMatch = regexDesc.exec(html);
    var description = '';
    if (descMatch) {
        for (var i = 0; i < descMatch.length; i++) {
            var match = descMatch[i];
            var text = match.replace(/<[^>]+>/g, ''); // 去除 HTML 标签，只保留文字内容
            description += (' ' + text)
        }
    }

    // extract image cover url
    var cover = '';
    var coverRegex = /<img[^>]+class="[^"]*is-cover[^"]*"[^>]*src="([^"]+)"/i;
    var coverMatch = html.match(coverRegex);
    if (coverMatch && coverMatch.length >= 2) {
        cover = coverMatch[1];
        cover = ksMediaNode(cover.replace(/&amp;/g, '&'), 'image');
    }

    // extract video url from video which has class="player-video"
    var videoRegex = /<video[^>]+class="[^"]*player-video[^"]*"[^>]*src="([^"]+)"/i;
    var videoMatch = html.match(videoRegex);
    if (videoMatch && videoMatch.length >= 2) {
        medias.push(ksMediaNode(videoMatch[1], 'video'));
    } else { 
        title = "快手图片提取未实现"
    }

    var result = {
        title: title,
        redirectUrl: data.redirect_url,
        description: description,
        richText: false,
        cover: cover,
        medias: medias,
    }
    return JSON.stringify(result);
}

function ksMediaNode(url, contentMainType ) {
    return {
        "url": url,
        "contentMainType": contentMainType,
    }
}

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}