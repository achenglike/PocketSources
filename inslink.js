async function inslink_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html, xhr
    var postDataStr = data.xhr.filter(function(item){return item.url == '/api/graphql'})[0].responseBody;
    var postData = JSON.parse(postDataStr).data.xdt_shortcode_media;

    var cover = insMediaNode(postData.thumbnail_src, 'image');
    var title = '';
    if (postData.edge_media_to_caption && postData.edge_media_to_caption.edges.length > 0) {
        title =  postData.edge_media_to_caption.edges[0].node.text;
    }
    if (!title) {
        title = postData.owner.full_name + ' ins(@'+ postData.owner.username +')';
    }

    var medias = [];
    if (postData.is_video) {
        medias.push(insMediaNode(postData.video_url, 'video'));
    } else {
        if (postData.edge_sidecar_to_children) {
            medias = postData.edge_sidecar_to_children.edges.map(function(item){ 
                if (item.node.is_video) {
                    return insMediaNode(item.node.video_url, 'video');
                } else {
                    var imgResources = item.node.display_resources;
                    return insMediaNode(imgResources[imgResources.length - 1].src, 'image');
                }
            });
        } else {
            medias.push(insMediaNode(postData.display_resources[postData.display_resources.length - 1].src));
        }

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

function insMediaNode(url, contentMainType) {
    return {
        "url": url,
        "contentMainType": contentMainType
    }
}