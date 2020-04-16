  
var latitude;
var longitude;
var map;
var infoWindow = [];
var marker=[];
var markerData = [];
var latlng;
var lat;
var lng;

function initMap() {
  
  function success(position){
    latitude  = position.coords.latitude;//緯度
    longitude = position.coords.longitude;//経度

    latitude = 35.681432
    longitude = 139.767103
    latlng = new google.maps.LatLng( latitude , longitude ) ;
    map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 15,
      center: latlng,
    });
    marker[0] = new google.maps.Marker({
      map : map,             // 対象の地図オブジェクト
      position : latlng,   // 緯度・経度
      icon : {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      },
      
    });
    
    getResult(latitude, longitude);
    
    infoWindow[0] = new google.maps.InfoWindow({
      content: `<div class="shop-name">中心地</div>`
    });
    
    // clickイベントを取得するListenerを追加
    marker[0].addListener('click', () => {
      infoWindow[0].open(map, marker[0]);
    });
    
    google.maps.event.addListener(map, 'dragend', function(e) {
      checkLatLng();
      $("#googlemap > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(4)").empty()
      latlng = new google.maps.LatLng( lat , lng ) ;
      map.center = latlng;
      marker[0] = new google.maps.Marker({
        map : map,             // 対象の地図オブジェクト
        position : latlng,   // 緯度・経度
        icon : {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        },
      
      });
      infoWindow[0] = new google.maps.InfoWindow({
        content: `<div class="shop-name">中心地</div>`
      });
      // clickイベントを取得するListenerを追加
      marker[0].addListener('click', () => {
        infoWindow[0].open(map, marker[0]);
      });
      getResult(lat, lng);
    });
    
  };
  function error() {
    //エラーの場合
    output.innerHTML = "座標位置を取得できません";
    
    latitude = 35.681432
    longitude = 139.767103
    latlng = new google.maps.LatLng( latitude , longitude ) ;
    map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 15,
      center: latlng,
    });
    marker[0] = new google.maps.Marker({
      map : map,             // 対象の地図オブジェクト
      position : latlng,   // 緯度・経度
      icon : {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      },
      
    });
    
    getResult(latitude, longitude);
    
    infoWindow[0] = new google.maps.InfoWindow({
      content: `<div class="shop-name">東京駅</div>`
    });
    
    // clickイベントを取得するListenerを追加
    marker[0].addListener('click', () => {
      infoWindow[0].open(map, marker[0]);
    });
    
    google.maps.event.addListener(map, 'dragend', function(e) {
      checkLatLng();
      $("#googlemap > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(4)").empty()
      latlng = new google.maps.LatLng( lat , lng ) ;
      map.center = latlng;
      marker[0] = new google.maps.Marker({
        map : map,             // 対象の地図オブジェクト
        position : latlng,   // 緯度・経度
        icon : {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        },
      
      });

      infoWindow[0] = new google.maps.InfoWindow({
        content: `<div class="shop-name">東京駅</div>`
      });

      // clickイベントを取得するListenerを追加
      marker[0].addListener('click', () => {
        infoWindow[0].open(map, marker[0]);
      });
      getResult(lat, lng);
    });
  };
  
  navigator.geolocation.getCurrentPosition(success, error);//成功と失敗を判断
  
};

const addInfo = (i, name, image, url) => {
  infoWindow[i] = new google.maps.InfoWindow({
    content: `<img src='${image}'>
    <div class="shop-name">${name}</div>
    <button class="btn btn-primary map-button" <input type="button" onClick="window.open('${url}','_blank','')" type="button">お店の詳細に行く</button>
    `
  });
}

const showGooglemap = (i, name, lati, longi) => {
  var latlng = new google.maps.LatLng( lati, longi );
  marker[i] = new google.maps.Marker({
    map:map, 
    position:latlng,
  });
  
  // clickイベントを取得するListenerを追加
  marker[i].addListener('click', () => {
    infoWindow[i].open(map, marker[i]);
  });
  
}

const clearResult = () => {
  $("tbody").empty();

}

const showResult = result => {
  let i = 1;
  clearResult();
  result.rest.map( item => {
    $("#table").append(`<tr><td class="shops-name" id="${i}">${item.name}</td><td>${item.opentime}</td></tr>`)
    
    addInfo(i, item.name, item.image_url.shop_image1, item.url);
    console.log(item.image_url.shop_image1);
    showGooglemap(i, item.name, item.latitude, item.longitude);
    markerData[i]={
      name:item.name,
      lat:item.latitude,
      lng:item.longitude,
      image:item.image_url.shop_image1,
      url:item.url,
    }
    
    //イベントリスナー追加
    $(`#${i}`).on('click', (e) => {
      var shop_id = e.target.id;
      infoWindow[shop_id].open(map, marker[shop_id]);
    });
    
    //    console.log(i);
    console.log(markerData[i].name);
    i++;
  })

}


const getResult = (lati, longi) => {
  const url = "https://api.gnavi.co.jp/RestSearchAPI/v3/"
  const params = {
    keyid: "",
    latitude: lati,
    longitude: longi,
    range: 2,
    hit_per_page: 10,
  }
  params.keyid ="77699251ac9ac9c426b7d38ab645ea64";
  $.getJSON( url, params, result => {
    showResult( result )
  });
  
};

function checkLatLng(){
  var pos = map.getCenter();
  lat = pos.lat();
  lng = pos.lng();
  console.log(lat, lng);
};