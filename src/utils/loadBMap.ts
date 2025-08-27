export default function loadBMap() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src
    = 'https://api.map.baidu.com/api?v=1.0&&type=webgl&ak=DREdszCybjL2McPByje3l2baKhxn5ipU&callback=initBMap';
  document.body.appendChild(script);
}
