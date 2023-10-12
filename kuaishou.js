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

    var medias = [];
    // extract video url from video which has class="player-video"
    var videoRegex = /<video[^>]+class="[^"]*player-video[^"]*"[^>]*src="([^"]+)"/i;
    var videoMatch = html.match(videoRegex);
    if (videoMatch && videoMatch.length >= 2) {
        medias.push(ksMediaNode(videoMatch[1], 'video'));
    }

    // extract image from class="player-wrapper"
    var imageWrapperRgex = /player-wrapper(.+)?page-info/i;
    var imageWrapperMatch = html.match(imageWrapperRgex);
    if (imageWrapperMatch && imageWrapperMatch.length >= 2) {
        var imageWrapperHtml = imageWrapperMatch[1];
        
        var regexImgItem = /<img[^>]+class="[^"]*image-main[^"]*"[^>]*src="([^"]+)"[^>]*>/gi;
        var regexImgMatch;

        while ((regexImgMatch = regexImgItem.exec(imageWrapperHtml)) !== null) {
            var findUrl = regexImgMatch[1];
            if (findUrl.startsWith('//')) {
                findUrl = 'https:' + findUrl;
            }
            medias.push(ksMediaNode(findUrl, 'image'));
        }
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