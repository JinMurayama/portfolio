$('.animated').waypoint({
  handler(direction){
    if(direction === 'down'){

      $(this.element).removeClass('fadeOutUp');
      $(this.element).addClass('fadeInUp');
      
    }
    /*
    if(direction === 'up'){

      $(this.element).removeClass('fadeInUp');
      $(this.element).addClass('fadeOutUp');
      
    }
    */
  },
  
  offset: '80%',
});

