$('a[href^=#]').on('click', () => {
  var speed = 500;
  var href=$(this).attr('href');
  var target = $(href=="#" || href == "" ? 'html' : href);
  var position = target.offset().top;
  $('html, body').animate({scrollTop:position}, speed, 'swing');
  return false;
}); 

$('.animated').waypoint({
  handler(direction){
    if(direction === 'down'){

      $(this.element).removeClass('fadeOutUp');
      $(this.element).addClass('fadeInUp');
      
    }
    
    if(direction === 'up'){

      $(this.element).removeClass('fadeInUp');
      $(this.element).addClass('fadeOutUp');
      
    }
  },
  
  offset: '80%',
});