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

var latitude
var longitude

function initMap() {
  
  function success(position){
    //latitude  = position.coords.latitude;//緯度
    //longitude = position.coords.longitude;//経度

    latitude = 35.681432
    longitude = 139.767103    
    
    var latlng = new google.maps.LatLng( latitude , longitude ) ;
    var map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 15,
      center: latlng,
    });
    var marker = new google.maps.Marker({
      map : map,             // 対象の地図オブジェクト
      position : latlng,   // 緯度・経度
    });
  };
  function error() {
    //エラーの場合
    output.innerHTML = "座標位置を取得できません";
    
    var latitude = 35.681432
    var longitude = 139.767103  
    
    var latlng = new google.maps.LatLng( latitude , longitude ) ;
    var map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 15,
      center: latlng,
    });
    var marker = new google.maps.Marker({
      map : map,             // 対象の地図オブジェクト
      position : latlng,   // 緯度・経度
    });
    
  };
  navigator.geolocation.getCurrentPosition(success, error);//成功と失敗を判断
};