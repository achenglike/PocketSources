async function inslink_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html, xhr
    var postDataStr = data.xhr.filter(function(item){return item.url == '/api/graphql'})[0].responseBody;
    var postData = JSON.parse(postDataStr).data.xdt_shortcode_media;

    var cover = insMediaNode(postData.thumbnail_src);
    var title = '';
    if (postData.edge_media_to_caption && postData.edge_media_to_caption.edges.length > 0) {
        title =  postData.edge_media_to_caption.edges[0].node.text;
    }
    if (!title) {
        title = postData.owner.full_name + ' ins(@'+ postData.owner.username +')';
    }

    var imageUrls = [];
    var videoUrls = [];
    if (postData.is_video) {
        videoUrls.push(insMediaNode(postData.video_url));
    } else {
        if (postData.edge_sidecar_to_children) {
            imageUrls = postData.edge_sidecar_to_children.edges.map(function(item){ 
                if (item.node.is_video) {
                    return insMediaNode(item.node.video_url);
                } else {
                    var imgResources = item.node.display_resources;
                    return insMediaNode(imgResources[imgResources.length - 1].src);
                }
            });
        } else {
            imageUrls.push(insMediaNode(postData.display_resources[postData.display_resources.length - 1].src));
        }

    }

    var result = {
        title: title,
        redirectUrl: data.redirect_url,
        description: title,
        richText: false,
        cover: cover,
        imgs: imageUrls,
        videos: videoUrls,
        files: [],
    }
    return JSON.stringify(result);
}

function insMediaNode(url) {
    return {
        "url": url,
    }
}