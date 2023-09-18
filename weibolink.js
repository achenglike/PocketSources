async function weibo_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html
    var title = data.title;
    var html = data.html;
    var redirectUrl = data.redirect_url;

    // title
    var titleRegex = /("status_title": ".+"),/;
    var titleMatch = titleRegex.exec(html);
    if (titleMatch && titleMatch.length >= 2) {
        title = titleMatch[1];
        title = JSON.parse('{'+title+'}').status_title
    }

    // regex take description
    var regexDesc = /("text": ".+"),/i;
    var descMatch = regexDesc.exec(html);
    var description = '';
    if (descMatch && descMatch.length >= 2) {
        description = descMatch[1];
        description = JSON.parse('{'+description+'}').text
    }

    // regex take image urls
    var regexImg = /"pics":([\s\S]+?])/gi;
    var medias = [];
    var picsMatch = regexImg.exec(html);
    if (picsMatch && picsMatch.length >= 2) {
        var pics = JSON.parse(picsMatch[1]);
        medias = pics.map((e) => wbMediaNode(e.large.url, 'image'));
    }

    // regex take cover
    var cover = "";
    var regexCover = /"page_pic":([\s\S]*?})/gi;
    var coverMatch = regexCover.exec(html);
    if (coverMatch && coverMatch.length >= 2) {
        cover = wbMediaNode(JSON.parse(coverMatch[1]).url, 'image');
    }


    // regex take video url
    var regexVideo = /"stream_url_hd": "(.+)"/i;
    var matchVideo = regexVideo.exec(html);
    if (matchVideo && matchVideo.length >= 2) {
        medias.push(wbMediaNode(matchVideo[1], 'video'));
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