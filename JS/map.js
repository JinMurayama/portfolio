  
var latitude;
var longitude;
var map;
var infoWindow = [];
var marker=[];
var markerData = [];
var latlng;
var lat;
var lng;
var hit = 10;
var show_list = 5;
var perPage = hit/show_list;
var showpage=[];
var currentPage=1;
var before_page=1;

Vue.component('button-paging', {
  
  template:`
  <nav class="cp_navi">
    <div class="cp_pagination">
      <a class="cp_pagenum" 
      v-for="n in perPage" :key="n"
      v-bind:id="['b-'+n]"
      >{{n}}</a>
    </div>
  </nav>
  `
})

$(document).on('click','.cp_pagenum', (e) => {
  const click_id =  $(e.target).attr('id');

  var str = click_id.split('-')
  before_page = currentPage;
  currentPage = Number(str[1]);

  split_page();
});

const init_list = () => {
  for(let i = 0 ; i < hit ; i++){
    showpage[i]=i+1
  }
}

const split_page = () => {
  $(`#b-${before_page}`).removeClass('active');
  $(`#b-${currentPage}`).addClass('active');
  for(let i = 0 ; i < hit ; i++){
    if(show_list * (currentPage-1) <= i && i < show_list * currentPage){
      $(`#row-${showpage[i]}`).show();
    }else{
      $(`#row-${showpage[i]}`).hide();
    }
  }
}

new Vue({
  el:"#sidbar",
  data:{
    search_text: null,
    dates: null,
  },
  beforeCreat(){
    setTimeout(1000);
  },
  created(){
    let vm=this;
    setTimeout(() => {
      vm.dates = markerData;
      init_list();
      split_page();
    }, 1000)
  },
  methods:{
    change_page:function(){
    }
  },
  computed:{
    search_shop: function(){
      if(this.search_text){
        for(let j = 1 ; j <= hit ; j++){
          if(this.dates[j].name.toLowerCase().indexOf(this.search_text) === -1) {
            $(`#row-${j}`).hide();
          }else{
            $(`#row-${j}`).show();
          }
        }
      }
      else{
        split_page();
      }
    },
  },

  
})

function initMap() {
  
  function success(position){
    latitude  = position.coords.latitude;//緯度
    longitude = position.coords.longitude;//経度

    //latitude = 35.681432
    //longitude = 139.767103
    latlng = new google.maps.LatLng( latitude , longitude ) ;
    map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 15,
      center: latlng,
    });
    marker[0] = new google.maps.Marker({
      map : map,             // 対象の地図オブジェクト
      position : latlng,   // 緯度・経度
      icon : {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
      animation:google.maps.Animation.BOUNCE
    });
    
    getResult(latitude, longitude);
    
    infoWindow[0] = new google.maps.InfoWindow({
      content: `<div class="shop-name">中心地</div>`
    });
    
    // clickイベントを取得するListenerを追加
    marker[0].addListener('click', () => {
      opencloseWindw(0);
      marker[0].setAnimation(google.maps.Animation.BOUNCE);
    });
    
    markerData[0]={
      name:"中心地",
      lat:latitude,
      lng:longitude,
    }
      
    google.maps.event.addListener(map, 'dragend', function(e) {
      
      infoWindow[0].close(map, marker[0])
      before_page=currentPage;
      currentPage=1;
      checkLatLng();
      $("#googlemap > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(4)").empty()
      latlng = new google.maps.LatLng( lat , lng ) ;
      markerData[0]={
        name:"中心地",
        lat:lat,
        lng:lng,
      }

      map.center = latlng;
      marker[0] = new google.maps.Marker({
        map : map,             // 対象の地図オブジェクト
        position : latlng,   // 緯度・経度
        icon : {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
        animation : google.maps.Animation.BOUNCE,
      });
      infoWindow[0] = new google.maps.InfoWindow({
        content: `<div class="shop-name">中心地</div>`
      });
      
      if(active[before_active] === false){
        infoWindow[before_active].close(map, marker[before_active]);
        active[before_active] = true;
      }
      
      // clickイベントを取得するListenerを追加
      marker[0].addListener('click', () => {
        opencloseWindw(0);
        marker[0].setAnimation(google.maps.Animation.BOUNCE);
      });
      
      getResult(lat, lng);
      
    });
    
  };
  function error() {
    //エラーの場合
    output.innerHTML = "座標位置を取得できません";
    
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

const change_list=i=>{
  var index = showpage.indexOf(i);
  var before_ele = showpage[0];
  var after_ele
  showpage[0] = i;
  for(let j=1 ; j <= index ; j++){
    after_ele = showpage[j];
    showpage[j]=before_ele;
    before_ele = after_ele;
  }
}

const showGooglemap = (i, name, lati, longi) => {
  var latlng = new google.maps.LatLng( lati, longi );
  marker[i] = new google.maps.Marker({
    map:map, 
    position:latlng,
    animation: google.maps.Animation.DROP,
  });
  
  // clickイベントを取得するListenerを追加
  marker[i].addListener('click', (e) => {
    
    $(`#row-${i}`).insertBefore('tbody tr:first');
    before_page=currentPage;
    currentPage=1;
    if(before_active != i){
      change_list(i)
      split_page();
    }
    console.log(showpage);
    opencloseWindw(i);
  });
  
}


const clearResult = () => {
  $("tbody").empty();

}


let active = [];
var before_active = 0;

const opencloseWindw = shop_id => {
   
  if(active[shop_id]===undefined){
    active[shop_id]=true;
  }
  
  latlng = new google.maps.LatLng( markerData[shop_id].lat , markerData[shop_id].lng ) ;
  map.center=latlng;
  map.panTo(latlng);
  
  if(before_active !== shop_id){
    $(`#row-${shop_id}`).addClass('shop_background');
    $(`#row-${before_active}`).removeClass('shop_background');
  }else{
    if(active[shop_id] === false){
      $(`#row-${shop_id}`).removeClass('shop_background');
    }else{
      $(`#row-${shop_id}`).addClass('shop_background');
    }
  }
  
  if(active[shop_id] === true){
    infoWindow[shop_id].open(map, marker[shop_id]);
    marker[shop_id].setAnimation(google.maps.Animation.BOUNCE);
    if(before_active !== shop_id){
      infoWindow[before_active].close(map, marker[before_active]);
      marker[before_active].setAnimation(null);
      active[before_active] = true;
    }
    active[shop_id] = false;
  }else{
    infoWindow[shop_id].close(map, marker[shop_id]);
    marker[before_active].setAnimation(null);
    active[shop_id] = true;
  }
  
  before_active = shop_id;
  
  console.log(marker[shop_id].getAnimation());
}

const showResult = result => {
  let i = 1;
  var maxlat = 0 //最大緯度
  var maxlng = 0;//最大経度
  var minlat = 150;//最小緯度
  var minlng = 150;//最小経度
  clearResult();
  result.rest.map( item => {
    $("#table").append(`<tr id="row-${i}"><td class="shops-name" id="${i}">${item.name}</td><td class="${i}">${item.opentime}</td></tr>`)
    
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

    if(item.latitude !== ""){
    
      if(maxlat < item.latitude){
        maxlat = item.latitude;
      }
  
      if(minlat > item.latitude){
        minlat = item.latitude;
      }

    }
    
    if(item.longitude !== ""){
      if(maxlng < item.longitude){
        maxlng = item.longitude;
      }
      
      
      if(minlng > item.longitude){
        minlng = item.longitude;
      }
    
      
    }
    //イベントリスナー追加
    $(`#${i}`).on('click', (e) => {
      var shop_id = Number(e.target.id);
      opencloseWindw(shop_id);
      marker[shop_id].setAnimation(google.maps.Animation.BOUNCE);
      if (window.matchMedia( "(min-width: 120px) and (max-width: 768px)" ).matches) {
        $('#sidbar').removeClass('active_shoplist');
        $('#overlay').removeClass('active_overlay');  
        $('#close-shoplist').removeClass('active_close');
        $('#sidbar').addClass('hide_ele');
        $('#overlay').addClass('hide_ele');
      }
    });
    
    console.log(markerData[i].name);
    i++;
  })
  
  //北西端の座標を設定
  var sw = new google.maps.LatLng(maxlat,minlng);
  //東南端の座標を設定
  var ne = new google.maps.LatLng(minlat,maxlng);
   
  //範囲を設定
  var bounds = new google.maps.LatLngBounds(sw, ne);
   
  //自動調整
  map.fitBounds(bounds,5);
  
  before_active = 0;
  
  init_list();
  split_page();
}


const getResult = (lati, longi) => {
  $('#b-1').addClass('active');
  const url = "https://api.gnavi.co.jp/RestSearchAPI/v3/"
  const params = {
    keyid: "",
    latitude: lati,
    longitude: longi,
    range: 5,
    hit_per_page: hit,
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

$('#button-shoplist').on('click', () => {
  $('#sidbar').css('display', '');
  $('#sidbar').removeClass('hide_ele');
  $('#overlay').removeClass('hide_ele');
  $('#sidbar').addClass('active_shoplist');
  $('#overlay').addClass('active_overlay');
  $('#close-shoplist').addClass('active_close');
})

$('#close-shoplist').on('click', () => {
  $('#sidbar').removeClass('active_shoplist');
  $('#overlay').removeClass('active_overlay');  
  $('#close-shoplist').removeClass('active_close');
  $('#sidbar').css('display', '');
  $('#sidbar').addClass('hide_ele');
  $('#overlay').addClass('hide_ele');
})

