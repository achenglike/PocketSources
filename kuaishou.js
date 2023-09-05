function kuaishou_process(data){
    // url, redirect_url, title, html
    var html = data.html;

    var title = '';
    const titleRegex = /<div[^>]+class="desc"[\s\S]*?<span[^>]+>([^<]+)<\/span>/i;
    const titleMatch = html.match(titleRegex);

    if (titleMatch && titleMatch.length >= 2) {
      title = titleMatch[1];
    }

    // extract image cover url
    var cover = '';
    var coverRegex = /<img[^>]+class="[^"]*is-cover[^"]*"[^>]*src="([^"]+)"/i;
    var coverMatch = html.match(coverRegex);
    if (coverMatch && coverMatch.length >= 2) {
        cover = coverMatch[1];
        cover = ksMediaNode(cover.replace(/&amp;/g, '&'));
    }

    // extract video url from video which has class="player-video"
    var videoUrls = [];
    var videoRegex = /<video[^>]+class="[^"]*player-video[^"]*"[^>]*src="([^"]+)"/i;
    var videoMatch = html.match(videoRegex);
    if (videoMatch && videoMatch.length >= 2) {
        videoUrls.push(ksMediaNode(videoMatch[1]));
    }

    if (videoUrls.length == 0) {
        title = "快手图片提取未实现"
    }

    var result = {
        title: title,
        description: '',
        richText: false,
        cover: cover,
        imgs: [],
        videos: videoUrls,
        files: [],
    }
    return new Promise( (resolve, reject) => {
        resolve(JSON.stringify(result));
    });
}

function ksMediaNode(url) {
    return {
        "url": url,
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