async function pornhub_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html, xhr
    var title = data.title;
    var html = data.html;
    var redirectUrl = data.redirect_url;

    var cover = "";
    var medias = [];
    var jsonRegex = /var flashvars[^{]+({.+);/i;
    var jsonMatch = jsonRegex.exec(html);
    if (jsonMatch && jsonMatch.length >= 2) {
        var jsonData = JSON.parse(jsonMatch[1]);
        title = jsonData.video_title;
        cover = coverNode(jsonData.image_url);

        var hlsLine = jsonData.mediaDefinitions.find(function(item) { return item.format == 'hls' && item.quality =='1080' }).videoUrl;
        medias.push(mediaNode(hlsLine));
    }


    if (title == '' && medias.length == 0) {
        return JSON.stringify({
            code: 404,
            message: "fetch data fail"
        });
    }

    var result = {
        data: {
            title: title,
            redirectUrl: data.redirect_url,
            description: title,
            richText: false,
            cover: cover,
            medias: medias,
        },
        code: 0,
        message: 'success'
    }
    return JSON.stringify(result);
}


function coverNode(url) {
    return {
        "url": url,
        "contentMainType": 'image',
    }
}

function mediaNode(url) {
    return {
        "url": url,
        "contentMainType": 'video',
        "ext": {"videoType": "hls"}
    }
}
