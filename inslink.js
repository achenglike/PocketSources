async function inslink_process(input){
    var data = await sendMessage('browserHtml', JSON.stringify(input));
    data = JSON.parse(data);
    // url, redirect_url, title, html, xhr
    var postDataStr = data.xhr.filter(function(item){return item.url == '/api/graphql'})[0].responseBody;
    var postData = JSON.parse(postDataStr).data.xdt_shortcode_media;

    var cover = postData.thumbnail_src;
    var title = postData.owner.full_name + ' ins(@'+ postData.owner.username +')';

    var imageUrls = postData.edge_sidecar_to_children.edges.map(function(item){ return item.node.display_url });
    var videoUrls = [];


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