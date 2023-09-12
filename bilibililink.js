async function bilibili_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html
    var title = data.title;
    var html = data.html;
    var redirectUrl = data.redirect_url;
    // title
    var titleRegex = /<meta[^>]*property="og:title" content="(.*?)">/;
    var titleMatch = titleRegex.exec(html);
    if (titleMatch && titleMatch.length >= 2) {
        title = titleMatch[1];
    }

    // regex take description
    var regexDesc = /<meta[^>]*property="og:title" content="(.*?)">/i;
    var descMatch = regexDesc.exec(html);
    var description = '';
    if (descMatch && descMatch.length >= 2) {
        description = descMatch[1];
    }

    // regex take type
    var regexType = /<meta[^>]*property="og:type" content="(.*?)">/i;
    var typeMatch = regexType.exec(html);
    var typeStr = '';
    if (typeMatch && typeMatch.length >= 2) {
        typeStr = typeMatch[1];
    }

    var imageUrls = [];
    var videoUrls = [];

    if (typeStr == 'video') {
        // regex take video url
        var regexVideo = /readyVideoUrl":"([^"]+)"/i;
        var matchVideo = regexVideo.exec(html);
        if (matchVideo && matchVideo.length >= 2) {
            videoUrls.push(createMediaNode(matchVideo[1]));
        }
        console.log("videoUrls: " + videoUrls);

    } else if (typeStr == 'image') {
        // regex take image urls
        var regexImg = /<meta[^>]*property="og:image" content="(.*?)">/gi;
        var match;
        while ((match = regexImg.exec(html)) !== null) {
            imageUrls.push(createMediaNode(decodeEntities(match[1])));
        }
    }






    var cover = '';
    var coverRegex = /<meta[^>]*property="og:image" content="(.*?)">/;
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
        imgs: imageUrls,
        videos: videoUrls,
        files: [],
    }
    return JSON.stringify(result);
}

function createMediaNode(url) {
    return {
        "url": url
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