async function dylink_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html
    var title = data.title;
    var html = data.html;
    var redirectUrl = data.redirect_url;
    // title
    var titleRegex = /<title>([\s\S]*?)<\/title>/;
    var titleMatch = titleRegex.exec(html);
    if (titleMatch && titleMatch.length >= 2) {
        title = titleMatch[1];
    }

    // regex take description
    var regexDesc = /<meta\s+name="description"\s+content="([^"]*)"/i;
    var descMatch = regexDesc.exec(html);
    var description = '';
    if (descMatch && descMatch.length >= 2) {
        description = descMatch[1];
    }

    var medias = [];

    // regex take image urls
    var regexImg = /<div\s+class="gallery-container[^"]*">[\s\S]*?<img\s+src="(.*?)"/gi;
    var match;

    while ((match = regexImg.exec(html)) !== null) {
        medias.push(createMediaNode(decodeEntities(match[1])));
    }

    console.log("domain before :" + redirectUrl);
    // take domain from redirectUrl
    var domain = '';
    var domainRegex = /(https?:\/\/[^\/]*)/;
    var domainMatch = domainRegex.exec(redirectUrl);
    if (domainMatch && domainMatch.length >= 2) {
        domain = domainMatch[1];
    }
    // regex take video url
    var regexVideo = /<div class="video-container">\s*<video.*?src="(.*?)"/i;
    var matchVideo = regexVideo.exec(html);
    if (matchVideo && matchVideo.length >= 2) {
        medias.push(dyVideoNode(domain + decodeEntities(matchVideo[1])));
    }

    var cover = '';
    var coverRegex = /<img[^>]*src="([^"]*)"[^>]*class="poster"/;
    var coverMatch = html.match(coverRegex);
    if (coverMatch  && coverMatch.length >= 2) {
      cover = createMediaNode(decodeEntities(coverMatch[1]));
    }
    console.log("cover: " + cover);

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

function dyVideoNode(url) {
    if (url.indexOf("playwm") > 0) {
        url = url.replace("playwm", "play");
    }
    if (url.indexOf("ratio=720p") > 0) {
        url = url.replace("ratio=720p", "ratio=1080p");
    }
    return {
        "url": url,
        "contentMainType": "video",
        "headers": {
            "accept": "*/*",
            "accept-encoding": "identity;q=1, *;q=0",
            "accept-language": "zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7,zh-TW;q=0.6,de;q=0.5,fr;q=0.4,ca;q=0.3,ga;q=0.2",
            "sec-fetch-dest": "video",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-sit"
        }
    }
}

function createMediaNode(url) {
    return {
        "url": url,
        "contentMainType": "image"
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