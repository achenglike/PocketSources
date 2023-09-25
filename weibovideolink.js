async function weibovideo_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html
    var title = data.title;
    var html = data.html;
    var redirectUrl = data.redirect_url;

    // title
    var titleRegex = /class="m-text-cut-2"[^>]*>([\w\W]+?)<\/h3>/;
    var titleMatch = titleRegex.exec(html);
    if (titleMatch && titleMatch.length >= 2) {
        title = titleMatch[1];
    }

    // regex take description
    var description = title;

    // regex take cover
    var cover = "";
    var regexCover = /class="vjs-poster"[^>]+url\(&quot;([^)]+?)&quot;\)/gi;
    var coverMatch = regexCover.exec(html);
    if (coverMatch && coverMatch.length >= 2) {
        cover = wbMediaNode(coverMatch[1], 'image');
    }


    var medias = [];
    // regex take video url
    var regexVideo = /<video[^>]+src="(\S+)"[^>]*>/i;
    var matchVideo = regexVideo.exec(html);
    if (matchVideo && matchVideo.length >= 2) {
        medias.push(wbMediaNode(decodeEntities(matchVideo[1]), 'video'));
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


function wbMediaNode(url, contentMainType ) {
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

