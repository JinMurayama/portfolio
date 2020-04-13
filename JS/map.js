  
var latitude
var longitude

function initMap() {
  
  function success(position){
    latitude  = position.coords.latitude;//緯度
    longitude = position.coords.longitude;//経度
    var latlng = new google.maps.LatLng( latitude , longitude ) ;
    var map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 15,
      center: latlng,
    });
    var marker = new google.maps.Marker({
      map : map,             // 対象の地図オブジェクト
      position : latlng,   // 緯度・経度
    });
    
    getResult(latitude, longitude);
    
  };
  function error() {
    //エラーの場合
    output.innerHTML = "座標位置を取得できません";
  };
  
  navigator.geolocation.getCurrentPosition(success, error);//成功と失敗を判断
  
};

const showResult = result => {
  result.rest.map( item => {
    $("#table").append(`<tr><td>${item.name}</td><td>${item.opentime}</td></tr>`)
  })
}


const getResult = (lati, longi) => {
  const url = "https://api.gnavi.co.jp/RestSearchAPI/v3/"
  console.log(lati);
  console.log(longi);
  const params = {
    keyid: "",
    latitude: lati,
    longitude: longi,
    range: 3
  }
  params.keyid ="77699251ac9ac9c426b7d38ab645ea64";
  $.getJSON( url, params, result => {
    showResult( result )
  });
};