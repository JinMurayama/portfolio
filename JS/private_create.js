/* jshint curly:true, debug:true */
/* globals $, firebase, moment */

let private_id="";

let PrivateChannelTitle="";

var scrollPosition;


Vue.component('buttoncontents',{
  data(){
    return {
      url:`https://jin-portfolio.sakura.ne.jp/private_chat.html#${private_id}`,
      url_active:'',
      QR_active:'',
    }
  },
  methods:{
    showurl(){
      this.url_active=true;
      this.QR_active=false;
    },
    showQR(){
      
      this.QR_active=true;
      this.url_active=false;
      
      $('#qrcode canvas').remove();

      
      $('#qrcode').qrcode({
        text: this.url,
        width: 100,
        height: 100,
        background : "#fff",
        foreground : "#000"
      });
    },
    copyToClipboard(){
      $('#url_input').select();
      
      document.execCommand("Copy");
    },
    open_url(){
      window.open(this.url, '_blank');
      modal.closeModal();
    }
  },
  template:`
    <div>
      <button id="url_share" v-on:click='showurl' type="button" class="btn btn-outline-success">urlでshare</button>
      <button id="qr_share" v-on:click='showQR' type="button" class="btn btn-outline-success">QRでshare</button>
      <button id="new_private_button" target="_blank" type="button" v-on:click='open_url' class="btn btn-success">privateルームへ行く</button>
      <div id = "urlshare" v-show='url_active'>
        <input id="url_input" v-bind:value='url'><button class="btn btn-success" id="url_copy" v-on:click="copyToClipboard" type="button">urlをコピー</button>
      </div>
      <div id="qrcode" v-show='QR_active'></div>
    </div>
  `,
});

function create_privateid( n ){
  var CODE_TABLE = "0123456789"
      + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      + "abcdefghijklmnopqrstuvwxyz";
  var r = "";
  for (var i = 0, k = CODE_TABLE.length; i < n; i++){
    r += CODE_TABLE.charAt(Math.floor(k * Math.random()));
  }
  return r;
}


//モーダルウィンドウの表示
const modal = new Vue({
  el: "#new_private_channel",
  data: {
    showContent: false,
    isActive: false,
    InputForm: "",
    url:"",
  },
  methods:{
    openModal: function(){
      this.showContent = true;
//      scrollPosition = $(window).scrollTop();
      if (window.matchMedia('(max-width: 767px)').matches) {
        //スマホ処理
        scrollPosition = 3000;
      } else if (window.matchMedia('(min-width:768px)').matches) {
        //PC処理
        scrollPosition = 1721;
      }
      $('#all-overlay').addClass('active_overlay');
      $('body').addClass('fixed').css({'top': -scrollPosition});
    },
    closeModal: function(){
      this.showContent = false;
      $('body').removeClass('fixed').css({'top': 0});
      window.scrollTo( 0 , scrollPosition );
      $('#create-room__help').hide();
      $('#create-room__success').hide();
      $('#all-overlay').removeClass('active_overlay');
      this.InputForm="";
      this.isActive=false;
    },
    warn: function (message, event) {
    // ネイティブイベントを参照しています
      if (event) {
        event.preventDefault()
       
      }
      alert(message)
    },
    //privateルームを新規作成する
    active: function(){
      event.preventDefault()
      
      if (/[.$#[\]/]/.test(this.InputForm)) {
        $('#create-room__help')
          .text('ルーム名に次の文字は使えません: . $ # [ ] /')
          .fadeIn();
        $('#create-room__room-name').addClass('has-error');
        return;
      }

      if (this.InputForm.length < 1 || this.InputForm.length > 20) {
        $('#create-room__help')
          .text('1文字以上20文字以内で入力してください')
          .fadeIn();
        $('#create-room__room-name').addClass('has-error');
        return;
      }
      
      private_id = create_privateid(28);

      PrivateChannelTitle = this.InputForm;

      firebase
        .database()
        .ref(`private_rooms/${private_id}`)
        .setWithPriority(
          {
            createdByRoomName: this.InputForm,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
          },
          2,
        )
        .then(() => {

          $('#create-room__success')
            .text(`${this.InputForm}チャンネルを作成いたしました。`)
            .fadeIn();
          
          this.isActive = true;
          $('#create-room__help').hide();
          
          this.url=`location.href='private_chat.html'`;
          console.log(PrivateChannelTitle);
        })
        .catch((error) => {
          console.error('ルーム作成に失敗:', error);
        });
    }
  },
});

// 現在表示しているルーム名
let currentRoomName = null;

// Firebaseから取得したデータを一時保存しておくための変数
let dbdata = {};

/**
 * ----------------------
 * ユーティリティ（便利な関数）
 * ----------------------
 */

// DateオブジェクトをHTMLにフォーマットして返す
const formatDate = (date) => {
  const m = moment(date);
  return `${m.format('YYYY/MM/DD')}&nbsp;&nbsp;${m.format('HH:mm:ss')}`;
};


/**
 * ルームを表示する。window.location.hashを変更することで
 * onhashchangeが呼ばれ、そこからshowRoom()が呼ばれる。
 */
const changeLocationHash = (roomName) => {
  window.location.hash = encodeURIComponent(roomName);
};

// ログイン状態の変化を監視する
firebase.auth().onAuthStateChanged((user) => {

  firebase
    .auth()
    .signInAnonymously() // 匿名ログインの実行

});

