function xhslink_process(data){
    // url, redirect_url, title, html
    var html = data.html;
    var patternJson = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
    var match = patternJson.exec(html);
    var jsonObject = null;
    if (match) {
      var jsonStr = match[1].replace(/\s/g, '');
      jsonObject = JSON.parse(jsonStr);
    } else {
      console.log("xhs link js take json fail");
    }

    var isVideo = jsonStr.indexOf('VideoObject') >= 0;

    var regexDesc = /<div[^>]*class="([^"]*reds-text[^"]*)[^>]*>[\s\S]*?<div[^>]*class="([^"]*desc[^"]*)[^>]*>([\s\S]*?)<\/div>/g;
    var descMatches;
    var contents = [];

    while (isVideo == false && (descMatches = regexDesc.exec(html)) !== null) {
      var innerHtml = descMatches[3];
      var pRegex = /<p[^>]*>(.*?)<\/p>/g;
      var pMatches;

      while ((pMatches = pRegex.exec(innerHtml)) !== null) {
        contents.push(pMatches[1]);
      }
    }
    if (contents.length == 0 && !isVideo) {
        // 直接取div中的内容
        var descMatch = regexDesc.exec(html);
        if (descMatch && descMatch.length >= 4) {
            contents.push(descMatch[3]);
        }
    }

    var regexImg = /<img class="[^"]*\b-size-image\b[^"]*"\s+[^>]*src="(.*?)"/g;
    var imageUrls = [];
    var match;

    while ((match = regexImg.exec(html)) !== null) {
      imageUrls.push(xhsMediaNode('https:' + decodeEntities(match[1])));
    }

    var videoUrls = []
    var regexVideo = /<video\s+class="[^"]*\b-size-image\b[^"]*"\s+[^>]*src="([^"]*)"/i;
    var matchVideo = regexVideo.exec(html);
    if (matchVideo && matchVideo.length >= 2) {
      videoUrls.push(xhsMediaNode(decodeEntities(matchVideo[1])));
    }

    var description = '';
    if (contents.length == 0) {
        description = jsonObject.description;
    } else {
        description = contents.join('\n');
    }

    var cover = '';
    var coverRegex = /<meta name="og:image" content="(.*?)">/;
    var coverMatch = html.match(coverRegex);
    if (coverMatch  && coverMatch.length >= 2) {
      cover = xhsMediaNode(decodeEntities(coverMatch[1]));
    }

    var result = {
        title: jsonObject.name,
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



function xhsMediaNode(url) {
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
