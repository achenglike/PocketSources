async function youtube_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html
    var title = data.title;
    var html = data.html;
    var redirectUrl = data.redirect_url;


    var ytData;
    // take json data
    var jsonRegex = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/;
    var jsonMatch = jsonRegex.exec(html);
    if (jsonMatch && jsonMatch.length >= 2) {
        ytData = JSON.parse(jsonMatch[1]);
    }

    var videoDetails = ytData.videoDetails || {};
    var streamingData = ytData.streamingData || {};
    // title
    title = videoDetails.title;
    // description
    var description = videoDetails.shortDescription;
    // cover
    var thumbnails = videoDetails.thumbnail.thumbnails;
    var coverUrl = thumbnails[thumbnails.length-1].url;
    var cover = mediaNode(coverUrl, 'image');
    
    var medias = [];
    var formats = [...streamingData.formats, ...streamingData.adaptiveFormats];
    var videoUrl = formats.filter(v => v.qualityLabel != undefined && v.mimeType.indexOf('mp4') >= 0).sort((a,b) => parseInt(b.qualityLabel)-parseInt(a.qualityLabel))[0].url;
    medias.push(mediaNode(videoUrl, 'video'));

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


function mediaNode(url, contentMainType) {
    return {
        "url": url,
        "contentMainType": contentMainType,
    }
}