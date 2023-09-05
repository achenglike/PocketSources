function dylink_process(data){
    console.log(data);
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

    // regex take image urls
    var regexImg = /<div\s+class="gallery-container[^"]*">[\s\S]*?<img\s+src="(.*?)"/gi;
    var imageUrls = [];
    var match;

    while ((match = regexImg.exec(html)) !== null) {
      imageUrls.push(createMediaNode(decodeEntities(match[1])));
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
    var videoUrls = [];
    var regexVideo = /<div class="video-container">\s*<video.*?src="(.*?)"/i;
    var matchVideo = regexVideo.exec(html);
    if (matchVideo && matchVideo.length >= 2) {
       videoUrls.push(createMediaNode(domain + decodeEntities(matchVideo[1])));
    }
    console.log("videoUrls: " + videoUrls);

    var cover = '';
    var coverRegex = /<img[^>]*src="([^"]*)"[^>]*class="poster"/;
    var coverMatch = html.match(coverRegex);
    if (coverMatch  && coverMatch.length >= 2) {
      cover = createMediaNode(decodeEntities(coverMatch[1]));
    }
    console.log("cover: " + cover);

    var result = {
        title: title,
        description: description,
        richText: false,
        cover: cover,
        imgs: imageUrls,
        videos: videoUrls,
        files: [],
    }
    return new Promise( (resolve, reject) => {
        resolve(JSON.stringify(result));
    });
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