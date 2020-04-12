/* jshint curly:true, debug:true */
/* globals $, firebase, moment */

//モーダルウィンドウの表示
new Vue({
  el: "#new_public_channel",
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
// 初期ルーム名
const defaultRoomName = 'default';

// 現在表示しているルーム名
let currentRoomName = null;

// 現在ログインしているユーザID
let currentUID;

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
 * --------------------
 * ユーザ情報設定関連の関数
 * --------------------
 */


// ニックネーム表示を更新する
const updateNicknameDisplay = (uid) => {
  const user = dbdata.users[uid];
  if (user) {
    $(`.nickname-${uid}`).text(user.nickname);
    if (uid === currentUID) {
      $('#menu-profile-name').text(user.nickname);
    }
  }
};

/**
 * -------------------
 * チャット画面関連の関数
 * -------------------
 */

// messageの表示用のdiv（jQueryオブジェクト）を作って返す
const createMessageDiv = (messageId, message) => {
  // HTML内のテンプレートからコピーを作成
  let divTag = null;
  if (message.uid === currentUID) {
    // 送信メッセージ
    divTag = $('.message-template .message--sent').clone();
  } else {
    // 受信メッセージ
    divTag = $('.message-template .message--received').clone();
  }

  const user = dbdata.users[message.uid];

  // ユーザが存在する場合
  // 投稿者ニックネーム
  divTag
    .find('.message__user-name')
    .addClass(`nickname-${message.uid}`)
    .text(message.name);

  // メッセージ本文
  divTag.find('.message__text').text(message.text);
  // 投稿日
  divTag.find('.message__time').html(formatDate(new Date(message.time)));

  // id属性をセット
  divTag.attr('id', `message-id-${messageId}`);

  return divTag;
};

// messageを表示する
const addMessage = (messageId, message) => {
  const divTag = createMessageDiv(messageId, message);
  divTag.appendTo('#message-list');

  // 一番下までスクロール
  $('#message-list').scrollTop($(document).height());
};

// 動的に追加されたルームを一旦削除する
const clearRoomList = () => {
  $('#channel-list > div')
    .remove();
};

// ルーム一覧をPublic Channelに表示する


const showRoomList = (roomsSnapshot) => {
  // 動的に追加されたルームを一旦削除する
  clearRoomList();

  roomsSnapshot.forEach((roomSnapshot) => {
    
    const roomName = roomSnapshot.key;
    const roomNameFrame = $('<div>',{
      class: 'room-join-flame d-flex justify-content-between',
      id: `${roomName}`
    })
    $('#channel-list').append(roomNameFrame);
    
    const roomListLink = $('<span>', {
      class: 'room-list-name',
    }).text(roomName);
    $('#channel-list').find(`#${roomName}`).append(roomListLink);
    
    const room_join = $('<button>', {
      class: 'btn btn-success room-join-button',
      type: 'button',
      onclick: `location.href='#${roomName}'`,
    }).text("参加");
    $('#channel-list').find(`#${roomName}`).append(room_join);
    
    if (roomName !== defaultRoomName) {
      const room_delete = $('<button>', {
        class: 'btn btn-danger room-delete-button',
        type: 'button'
      }).text("削除")
      
      $('#channel-list').find(`#${roomName}`).append(room_delete);
    }
  });
};

// 表示されているメッセージを消去
const clearMessages = () => {
  $('#message-list').empty();
};

// チャットビュー内のユーザ情報をクリア
const resetChatView = () => {
  // メッセージ一覧を消去
  clearMessages();

};

/**
 * ルームを表示する。window.location.hashを変更することで
 * onhashchangeが呼ばれ、そこからshowRoom()が呼ばれる。
 */
const changeLocationHash = (roomName) => {
  window.location.hash = encodeURIComponent(roomName);
};

// ルームを実際に表示する
const showRoom = (roomName) => {
  if (!dbdata.rooms || !dbdata.rooms[roomName]) {
    console.error('該当するルームがありません:', roomName);
    return;
  }
  currentRoomName = roomName;
  $("#channel-title").text(currentRoomName);

  clearMessages();

  // ルームのメッセージ一覧をダウンロードし、かつメッセージの追加を監視
  const roomRef = firebase.database().ref(`messages/${roomName}`);

  // 過去に登録したイベントハンドラを削除
  roomRef.off('child_added');

  // イベントハンドラを登録
  roomRef.on('child_added', (childSnapshot) => {
    if (roomName === currentRoomName) {
      
      // 追加されたメッセージを表示
      addMessage(childSnapshot.key, childSnapshot.val());
    }
  });

  // ナビゲーションバーのルーム表示を更新
  $('.room-list-menu').text(`ルーム: ${roomName}`);

  // 初期ルームの場合はルーム削除メニューを無効にする
  if (roomName === defaultRoomName) {
    $('#delete-room-menuitem').addClass('disabled');
  } else {
    $('#delete-room-menuitem').removeClass('disabled');
  }

  // ナビゲーションのドロップダウンメニューで現在のルームをハイライトする
  $('#room-list > a').removeClass('active');
  $(`.room-list__link[href='#${roomName}']`).addClass('active');
};

// チャット画面表示用のデータが揃った時に呼ばれる
const showCurrentRoom = () => {
  if (currentRoomName) {
    if (!dbdata.rooms[currentRoomName]) {
      // 現在いるルームが削除されたため初期ルームに移動
      changeLocationHash(defaultRoomName);
    }
  } else {
    // ページロード直後の場合
    const { hash } = window.location;
    if (hash) {
      // URLの#以降がある場合はそのルームを表示
      const roomName = decodeURIComponent(hash.substring(1));
      if (dbdata.rooms[roomName]) {
        showRoom(roomName);
      } else {
        // ルームが存在しないので初期ルームを表示
        changeLocationHash(defaultRoomName);
      }
    } else {
      // #指定がないので初期ルームを表示
      changeLocationHash(defaultRoomName);
    }
  }
};

// #message-listの高さを調整する。主にMobile Safari向け。
const setMessageListMinHeight = () => {
  $('#message-list').css({
    // $(window).height() (ブラウザウインドウの高さ)
    // - 51 (ナビゲーションバーの高さ)
    // - 46 (投稿フォームの高さ)
    // + 6 (投稿フォームのborder-radius)
  //  'min-height': `${$(window).height() - 51 - 46 + 6}px`,
  });
};
/**
 * ルームを削除する
 * なおルームが削除されると roomsRef.on("value", ...); のコールバックが実行され、初期ルームに移動する
 */
const deleteRoom = (roomName) => {

  firebase
    .database()
    .ref(`rooms/${roomName}`)
    .remove();

  // ルーム内のメッセージも削除
  firebase
    .database()
    .ref(`messages/${roomName}`)
    .remove();
};

// チャット画面の初期化処理
const loadChatView = () => {
  resetChatView();

  dbdata = {}; // キャッシュデータを空にする

  // ユーザ一覧を取得してさらに変更を監視
  const usersRef = firebase.database().ref('users');
  // 過去に登録したイベントハンドラを削除
  usersRef.off('value');
  // イベントハンドラを登録
  usersRef.on('value', (usersSnapshot) => {
    // usersに変更があるとこの中が実行される

    dbdata.users = usersSnapshot.val();

    // 自分のユーザデータが存在しない場合は作成
    if (dbdata.users === null || !dbdata.users[currentUID]) {
      const { currentUser } = firebase.auth();
      if (currentUser) {
        console.log('ユーザデータを作成します');
        firebase
          .database()
          .ref(`users/${currentUID}`)
          .set({
            nickname: currentUser.email,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
          });

        // このコールバック関数が再度呼ばれるのでこれ以上は処理しない
        return;
      }
    }

    Object.keys(dbdata.users).forEach((uid) => {
      updateNicknameDisplay(uid);
    });

    // usersとroomsが揃ったらルームを表示（初回のみ）
    if (currentRoomName === null && dbdata.rooms) {
      showCurrentRoom();
    }
  });

  // ルーム一覧を取得してさらに変更を監視
  const roomsRef = firebase.database().ref('rooms');

  // 過去に登録したイベントハンドラを削除
  roomsRef.off('value');

  // コールバックを登録
  roomsRef.on('value', (roomsSnapshot) => {
    // roomsに変更があるとこの中が実行される

    dbdata.rooms = roomsSnapshot.val();

    // 初期ルームが存在しない場合は作成する
    if (dbdata.rochatoms === null || !dbdata.rooms[defaultRoomName]) {
      console.log(`${defaultRoomName}ルームを作成します`);
      firebase
        .database()
        .ref(`rooms/${defaultRoomName}`)
        .setWithPriority(
          {
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            createdByUID: currentUID,
          },
          1,
        );

      // このコールバック関数が再度呼ばれるのでこれ以上は処理しない
      return;
    }

    // ルーム一覧を表示
    showRoomList(roomsSnapshot);

    // usersデータがまだ来ていない場合は何もしない
    if (!dbdata.users) {
      return;
    }

    showCurrentRoom();
  });
};

/**
 * ----------------------
 * すべての画面共通で使う関数
 * ----------------------
 */

// ビュー（画面）を変更する
const showView = (id) => {
  $('.view').hide();
  $(`#${id}`).fadeIn();

  if (id === 'chat') {
    loadChatView();
  }
};

/**
 * -------------------------
 * ログイン・ログアウト関連の関数
 * -------------------------
 */


// ログインした直後に呼ばれる
const onLogin = () => {

  // チャット画面を表示
  showView('chat');
};

/**
 * ---------------------------------------
 * 以下、コールバックやイベントハン���ラの登録と、
 * ページ読み込みが完了したタイミングで行うDOM操作
 * ---------------------------------------
 */

/**
 * --------------------
 * ログイン・ログアウト関連
 * --------------------
 */

// ログイン状態の変化を監視する
firebase.auth().onAuthStateChanged((user) => {
  // ログイン状態が変化した
  if (user) {
    currentUID = user.uid;
    onLogin();
  } else {

    firebase
      .auth()
      .signInAnonymously() // 匿名ログインの実行
      .catch((error) => {
        // ログインに失敗したときの処理
        console.error('ログインエラー', error);
      });
  }
});


/**
 * --------------
 * チャット画面関連
 * --------------
 */

$('#comment-form').on('submit', (e) => {
  const commentForm = $('#comment-form__text');
  const comment = commentForm.val();

  const nameForm=$('#name-form__text');
  let name = nameForm.val();
  
  e.preventDefault();

  if (comment === '') {
    return;
  }
  commentForm.val('');
  
  if(name === ''){
    name = "匿名";
  }

  // メッセージを投稿する
  const message = {
    name: name,
    uid: currentUID,
    text: comment,
    time: firebase.database.ServerValue.TIMESTAMP,
  };
  firebase
    .database()
    .ref(`messages/${currentRoomName}`)
    .push(message);
});

// #message-listの高さを調整
setMessageListMinHeight();

/**
 * ------------
 * ルーム作成関連
 * ------------
 */

  
// ルーム作成フォームが送信されたらルームを作成
$('#new-channel-form').on('submit', (e) => {
  const roomName = $('#room-name')
    .val()
    .trim(); // 頭とお尻の空白文字を除去
  $('#room-name').val(roomName);

  e.preventDefault();

  // Firebaseのキーとして使えない文字が含まれているかチェック
  if (/[.$#[\]/]/.test(roomName)) {
    $('#create-room__help')
      .text('ルーム名に次の文字は使えません: . $ # [ ] /')
      .fadeIn();
    $('#create-room__room-name').addClass('has-error');
    return;
  }

  if (roomName.length < 1 || roomName.length > 20) {
    $('#create-room__help')
      .text('1文字以上20文字以内で入力してください')
      .fadeIn();
    $('#create-room__room-name').addClass('has-error');
    return;
  }

  if (dbdata.rooms[roomName]) {
    $('#create-room__help')
      .text('同じ名前のルームがすでに存在します')
      .fadeIn();
    $('#create-room__room-name').addClass('has-error');
    return;
  }

  /**
   * ルーム作成処理
   * priorityを2にすることで初期ルーム（priority=1）より順番的に後になる
   */
  firebase
    .database()
    .ref(`rooms/${roomName}`)
    .setWithPriority(
      {
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      // createdByUID: currentUID,
      },
      2,
    )
    .then(() => {
      // ルーム作成に成功した場合は、下記2つの処理を実行する

      // 作成したルームを表示
      changeLocationHash(roomName);
    })
    .catch((error) => {
      console.error('ルーム作成に失敗:', error);
    });
});

/**
 * ------------
 * ルーム削除関連
 * ------------
 */

// ルーム削除ボタンクリックでルームを削除する
$(document).on('click','.room-delete-button', (e) => {
  const delete_id =  $(e.target).parent('div').attr('id');

  console.log(delete_id);
  deleteRoom(delete_id);
  $(`#${delete_id}`).remove();
});

/**
 * ---------------
 * ユーザ情報設定関連
 * ---------------
 */

// URLの#以降が変化したらそのルームを表示する
$(window).on('hashchange', () => {
  if (window.location.hash.length > 1) {
    showRoom(decodeURIComponent(window.location.hash.substring(1)));
  }
});

// ウインドウがリサイズされたら#message-listの高さを再調整
$(window).on('resize', setMessageListMinHeight);
