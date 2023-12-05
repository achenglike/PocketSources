async function xlink_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html, xhr
    var bodyStr = data.xhr.filter(function(item){return item.url.indexOf('TweetDetail') > 0})[0].responseBody;
    var mediaEntries = JSON.parse(bodyStr).data.threaded_conversation_with_injections_v2.instructions[0].entries;
    console.log('sssssssssssssssssssss')
    console.log(mediaEntries.length);
    console.log(mediaEntries[mediaEntries.length-1]);
    console.log(mediaEntries[mediaEntries.length-1].content);
    console.log(mediaEntries[mediaEntries.length-2].content.itemContent);
    console.log(mediaEntries[mediaEntries.length-1].content.itemContent);
    console.log(mediaEntries[mediaEntries.length-1].content.itemContent.tweet_results);
    console.log('eeeeeeeeeeeeeeeeeeeee')
    var mixData = mediaEntries[mediaEntries.length-1].content.itemContent.tweet_results.result;
    var postData = mixData.legacy;
    var posterData = mixData.core.user_results.result.legacy;

    var cover = '';
    var title = posterData.name + ' tweet(@'+ posterData.screen_name +')';
    var description = postData.full_text;
   

    // postData.entities.media    array
    var postMedias = postData.entities.media;
    var medias = postMedias.map(function(item) {
        if (item.type == 'video') {
            if (cover == '') {
                cover = insMediaNode(item.media_url_https, 'image');
            }
            return insMediaNode(item.video_info.variants.find(function(elem){ return elem.content_type == 'video/mp4' }).url, 'video');
        } else {
            return insMediaNode(item.media_url_https, 'image');
        }
    });

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

function insMediaNode(url, contentMainType) {
    return {
        "url": url,
        "contentMainType": contentMainType
    }
}