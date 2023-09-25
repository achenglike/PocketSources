async function xlink_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html, xhr
    var bodyStr = data.xhr.filter(function(item){return item.url.indexOf('TweetDetail') > 0})[0].responseBody;
    var mixData = JSON.parse(bodyStr).data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result;
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
                cover = item.media_url_https;
            }
            return insMediaNode(item.video_info.variants.find(function(elem){ return elem.content_type == 'video/mp4' }).url, 'video');
        } else {
            return insMediaNode(item.media_url_https, 'image');
        }
    });

    var result = {
        title: title,
        redirectUrl: data.redirect_url,
        description: description,
        richText: false,
        cover: null,
        medias: medias,
    }
    return JSON.stringify(result);
}

function insMediaNode(url, contentMainType) {
    return {
        "url": url,
        "contentMainType": contentMainType
    }
}