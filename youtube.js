async function youtube_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input + '&bpctr=9999999999&has_verified=1'));
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
    var bestVideo = formats.filter(v => v.qualityLabel != undefined && v.mimeType.indexOf('mp4') >= 0).sort((a,b) => parseInt(b.qualityLabel)-parseInt(a.qualityLabel))[0];
    var videoUrl = bestVideo.url;
    if (!videoUrl) {
        videoUrl = signatureToUrl(bestVideo.signatureCipher);
    }
    var bestAudio = formats.filter(v => v.mimeType.indexOf('audio/mp4') >= 0).sort((a,b) => parseInt(b.audioSampleRate)-parseInt(a.audioSampleRate))[0];
    var audioUrl = bestAudio.url;
    if (!audioUrl) {
        audioUrl = signatureToUrl(bestAudio.signatureCipher);
    }


    medias.push(videoNode(videoUrl, audioUrl));

    if (description == '' && medias.length == 0) {
        return JSON.stringify({
            code: 404,
            message: "fetch data fail"
        });
    }

    var result = {
        data: {
            title: title,
            redirectUrl: data.redirect_url,
            description: description,
            richText: false,
            cover: cover,
            medias: medias,
        },
        code: 0,
        message: 'success'
    }
    return JSON.stringify(result);
}

function signatureToUrl(signatureCipher) {
    // parse sig url
    var values = urlDecode(signatureCipher);
    var valueUrl = values.url;
    var valuesS = values.s;
    var sigKey = values.sp || 'signature';
    var sig = FE(valuesS);
    return decodeURIComponent(valueUrl) + '&' + sigKey + '=' + sig;
}


function mediaNode(url, contentMainType) {
    return {
        "url": url,
        "contentMainType": contentMainType,
    }
}

function videoNode(url, audioUrl) {
    return {
        "url": url,
        "contentMainType": "video",
        "ext": {"videoType": "videoAudio", "audioUrl": audioUrl}
    }
}

function urlDecode(querys) {
    var params = querys.split('&');
    var result = {};
    params.forEach(function(param) {
        var parts = param.split('=');
        var key = decodeURIComponent(parts[0]);
        var value = decodeURIComponent(parts[1]);
        result[key] = value;
    });
    return result;
}

    FE = function(a) {
        a = a.split("");
        EE.Z7(a, 23);
        EE.bR(a, 66);
        EE.EH(a, 1);
        EE.bR(a, 45);
        EE.Z7(a, 43);
        EE.EH(a, 3);
        return a.join("")
    }
    
    var EE = {
        bR: function(a) {
            a.reverse()
        },
        Z7: function(a, b) {
            var c = a[0];
            a[0] = a[b % a.length];
            a[b % a.length] = c
        },
        EH: function(a, b) {
            a.splice(0, b)
        }
    };