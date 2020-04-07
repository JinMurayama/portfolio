//モーダルウィンドウの表示
new Vue({
  el: "#new_private_channel",
  data: {
    showContent: false
  },
  methods:{
    openModal: function(){
      this.showContent = true
    },
    closeModal: function(){
      this.showContent = false
    }
  }
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

