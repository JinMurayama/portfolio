// もろもろの準備
var video = document.getElementById("video");           // video 要素を取得
var canvas = document.getElementById("canvas");         // canvas 要素の取得
var context = canvas.getContext("2d");                  // canvas の context の取得
var stampNose = new Image();                            // ★鼻のスタンプ画像を入れる Image オブジェクト
var stampEars = new Image();                            // ★耳のスタンプ画像を入れる Image オブジェクト
stampNose.src = "image/nose.png";                             // ★鼻のスタンプ画像のファイル名
stampEars.src = "image/ears.png";                             // ★耳のスタンプ画像のファイル名
var min = 0 ;
var max = 5 ;
var face_random = 5;
var before_face = 6;
 
var face_str;
 
const face_show_theme = () => {



  while(1){
    face_random = Math.floor( Math.random() * (max + 1 - min) ) + min ;
    face_str = null;
    if(face_random === 0){
      face_str = "怒りの表情";
    }else if(face_random === 2){
      face_str = "恐れの表情";
    }else if(face_random === 3){
      face_str = "悲しみの表情"
    }else if(face_random === 4){
      face_str = "驚きの表情"
    }else if(face_random === 5){
      face_str = "喜びの表情"
    }
    if(face_str && face_random !== before_face){
      before_face = face_random;
      return face_str;
    }
  }

} 
 
// getUserMedia によるカメラ映像の取得
var media = navigator.mediaDevices.getUserMedia({       // メディアデバイスを取得
  video: {facingMode: "user"},                          // カメラの映像を使う（スマホならインカメラ）
  audio: false                                          // マイクの音声は使わない
});
media.then((stream) => {                                // メディアデバイスが取得できたら
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.srcObject = stream;                             // video 要素にストリームを渡す
});
 
// clmtrackr の開始
var tracker = new clm.tracker();  // tracker オブジェクトを作成
tracker.init(pModel);             // tracker を所定のフェイスモデル（※）で初期化
tracker.start(video);             // video 要素内でフェイストラッキング開始

// 感情分類の開始
var classifier = new emotionClassifier();               // ★emotionClassifier オブジェクトを作成
classifier.init(emotionModel);                          // ★classifier を所定の感情モデル（※2）で初期化

// 描画ループ
function drawLoop() {
  requestAnimationFrame(drawLoop);                      // drawLoop 関数を繰り返し実行
  var positions = tracker.getCurrentPosition();         // 顔部品の現在位置の取得
 // showData(positions); 
  var parameters = tracker.getCurrentParameters();      // ★現在の顔のパラメータを取得
  var emotion = classifier.meanPredict(parameters);     // ★そのパラメータから感情を推定して emotion に結果を入れる
  showEmotionData(emotion);   // ★感情データを表示// データの表示
  context.clearRect(0, 0, canvas.width, canvas.height); // canvas をクリア
  tracker.draw(canvas);// canvas にトラッキング結果を描画
  //drawStamp(positions, stampNose, 62, 2.5, 0.0, 0.0);   // ★鼻のスタンプを描画
  //drawStamp(positions, stampEars, 33, 3.0, 0.0, -1.8);  // ★耳のスタンプを描画
}
drawLoop();                                             // drawLoop 関数をトリガー

/*
// 顔部品（特徴点）の位置データを表示する showData 関数
function showData(pos) {
  var str = "";                                         // データの文字列を入れる変数
  for(var i = 0; i < pos.length; i++) {                 // 全ての特徴点（71個）について
    str += "特徴点" + i + ": ("
         + Math.round(pos[i][0]) + ", "                 // X座標（四捨五入して整数に）
         + Math.round(pos[i][1]) + ")<br>";             // Y座標（四捨五入して整数に）
  }
  
  var dat = document.getElementById("dat");             // データ表示用div要素の取得
  dat.innerHTML = str;                                  // データ文字列の表示
}
*/

/*
//★スタンプを描く drawStamp 関数
// (顔部品の位置データ, 画像, 基準位置, 大きさ, 横シフト, 縦シフト)
function drawStamp(pos, img, bNo, scale, hShift, vShift) {
  var eyes = pos[32][0] - pos[27][0];                   // 幅の基準として両眼の間隔を求める
  var nose = pos[62][1] - pos[33][1];                   // 高さの基準として眉間と鼻先の間隔を求める
  var wScale = eyes / img.width;                        // 両眼の間隔をもとに画像のスケールを決める
  var imgW = img.width * scale * wScale;                // 画像の幅をスケーリング
  var imgH = img.height * scale * wScale;               // 画像の高さをスケーリング
  var imgL = pos[bNo][0] - imgW / 2 + eyes * hShift;    // 画像のLeftを決める
  var imgT = pos[bNo][1] - imgH / 2 + nose * vShift;    // 画像のTopを決める
  context.drawImage(img, imgL, imgT, imgW, imgH);       // 画像を描く
}
*/

var downloadLink = document.getElementById('download_link');
var filename = 'your-filename.png';


$(document).on('click', "#savebutton", () => {
  if (canvas.msToBlob) {
    var blob = canvas.msToBlob();
    window.navigator.msSaveBlob(blob, filename);
  } else {
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = filename;
    downloadLink.click();
  }
});

// ★感情データの表示
function showEmotionData(emo) {
  var str ="";                                          // データの文字列を入れる変数
  for(var i = 0; i < emo.length; i++) {                 // 全ての感情（6種類）について
    str += emo[i].emotion + ": "                        // 感情名
         + emo[i].value.toFixed(1) + "<br>";            // 感情の程度（小数第一位まで）
    if(emo[face_random].value.toFixed(1) > 0.4) {                          // ★感情 happy の値が一定値より大きければ
      console.log(emo[face_random].value.toFixed(1));
      emo_score = emo[face_random].value.toFixed(1);
      //canvasを更にimgに書き出す方法
//      var img = document.getElementById('img');
//      $('#img').css("display","inline-block")
//      $('#img_div').addClass('active')
//      img.src = canvas.toDataURL('image/png');
      setTimeout(() =>  {
        textTheme();
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        face_random = 6;
      }, 50);

    }
    
  }
  var dat = document.getElementById("dat");             // データ表示用div要素の取得
  dat.innerHTML = str;                                  // データ文字列の表示
}

function textTheme(){
  $('#text_input').val('');
  $('#text_input').val('お題：' + face_str + '　点数：' + emo_score + "　#表情点数メーカー")
}


var emo_score

const showTheme = new Vue({
  el:'#face-theme',
  data:{
    faceExpre:"",
  },
  created(){
    const vm = this;
    setTimeout(() => {
      vm.faceExpre = face_show_theme();
    }, 1000);
  },
});

new Vue({
  el:'#sidbar',
  data:{
    text:'',
  },
  methods:{
    click_theme:function(){
      showTheme.faceExpre = face_show_theme();
      $('#img').css('display', 'none');
      $('#img_div').removeClass('.active');
    },
    again_theme:function(){
      face_random = before_face;
      $('#img').css('display', 'none');
      $('#img_div').removeClass('.active');

    },
    copyToClipboard(){
      $('#text_input').select();
      
      document.execCommand("Copy");
    },
  }
})