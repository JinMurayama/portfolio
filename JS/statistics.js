var APP_ID = "6ebb6f36af409ef8d329d2dfb5a8b118aa0240b8";
var META_API_URL = "https://api.e-stat.go.jp/rest/3.0/app/json/getMetaInfo";
var JSON_API_URL  = "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData";

var statsdataid="0003001298";

var url = JSON_API_URL;
url += "?appId=" + APP_ID;
url += "&lang=J";
url += "&statsDataId=" + statsdataid;

//JSONデータを取得します

let g_data

$.getJSON(url, (data) => {
  console.log(data.GET_STATS_DATA);
  var label = [];
  var datas = []
  for(let i = 0 ; i < 5 ; i++){
    label.push(data.GET_STATS_DATA.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ[4].CLASS[i]["@name"])
    datas.push(data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE[i].$)
  }
  console.log(label);
  g_data = {
    labels: label,
    datasets: [{
      label: "人口",
      data: datas,
      fill: false
    }]}
    
  // グラフを描画 --- (*2)
  const ctx = document.getElementById('chart_cv')
  const chart_cv = new Chart(ctx, {
    type: 'line', // グラフの種類
    data: g_data, // データ
    options: {
      title:{
        display: true,
        fontSize: 28,
        text: data.GET_STATS_DATA.STATISTICAL_DATA.TABLE_INF.STATISTICS_NAME
      }
    }
  }) // オプション
})