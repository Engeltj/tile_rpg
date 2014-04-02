window.onload = function()
    {
        //bootstrap tooltips
        if(!window.jQuery)
        {
            alert('jQuery not loaded');
        }
        else
        {
            $(document).ready(function(){
                $('#emailme').tooltip({
                    'placement':'top',
                    'trigger':'hover',
                    'delay':0
                });
                $('#mythanks').tooltip({
                    'placement':'right',
                    'trigger':'hover'
                });
                $('.gitsource').tooltip({
                    'placement':'left',
                    'trigger':'hover',
                    'delay':0
                });
            });
        }

        //small modal
        document.getElementById("call-small-modal").onclick=function()
        {
            $('#contact').modal({
                backdrop: true,
                keyboard: true
            }).css({
                //width: 'auto',
                width: '250px',
                'margin-left': function () {
                    return -($(this).width() / 2);
                }
            });
        };

        $('.accordion').on('show hide', function(e){
            $(e.target).siblings('.accordion-heading').find('.accordion-toggle i').toggleClass('icon-chevron-down icon-chevron-up');
        });

        $('.accordion').on('show', function (e) {
         $(e.target).prev('.accordion-heading').addClass('activeac');
         $(e.target).prev('.accordion-heading').addClass('activeac a');
        });

        $('.accordion').on('hide', function (e) {
            $(this).find('.accordion-heading').not($(e.target)).removeClass('activeac');
        });

    }
