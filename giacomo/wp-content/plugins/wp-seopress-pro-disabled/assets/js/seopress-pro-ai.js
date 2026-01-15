jQuery(document).ready(function ($) {

    $('#seopress_ai_generate_seo_meta').on("click", function () {
        $(this).attr("disabled", "disabled");
        $('.spinner').css("visibility", "visible");
        $('.spinner').css("float", "none");
        $("#seopress_ai_generate_seo_meta_log").hide();

        //Post ID
        if (typeof $("#seopress-tabs").attr("data_id") !== "undefined") {
            var post_id = $("#seopress-tabs").attr("data_id");
        } else if (typeof $("#seopress_content_analysis .wrap-seopress-analysis").attr("data_id") !== "undefined") {
            var post_id = $("#seopress_content_analysis .wrap-seopress-analysis").attr("data_id")
        }

        $.ajax({
            method: "POST",
            url: seopressAjaxAIMetaSEO.seopress_ai_generate_seo_meta,
            data: {
                action: "seopress_ai_generate_seo_meta",
                post_id: post_id,
                _ajax_nonce: seopressAjaxAIMetaSEO.seopress_nonce,
            },
            success: function (data) {
                $('.spinner').css("visibility", "hidden");
                $('#seopress_ai_generate_seo_meta').removeAttr("disabled");
                if (data.success === true) {
                    $("#seopress_titles_title_meta").val(data.data.title);
                    $("#seopress_titles_desc_meta").val(data.data.desc);
                    if (data.data.message !== 'Success') {
                        $("#seopress_ai_generate_seo_meta_log").show();
                        $("#seopress_ai_generate_seo_meta_log").html("<div class='seopress-notice is-error'><p>" + data.data.message + "</p></div>");
                    }
                    sp_titles_counters();
                }
            }
        });
    });
})
