const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
var fs = require('fs')

function delay(second) {
  return new Promise((resolve) => {
    setTimeout(resolve, (Math.random() * 2 + 1) * second * 500);
  });
};

var way = async (city, street) => {
  const browser = await puppeteer.launch(
    {
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',  //登录用cookie
      headless: false,
      ignoreDefaultArgs: ['--enable-automation'],
      // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
      // args:['--no-sandbox',
      // '--proxy-server=socks5://49.86.180.194:9999']

    }
  );

  const page = await browser.newPage();     // 打开一个新标签页
  //防检测
  {
    await page.evaluate(async () => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1");
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      delete navigator.__proto__.webdriver;
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
  }
  // await page.setRequestInterception(true);
  await page.goto('https://h5.waimai.meituan.com/waimai/mindex/home');   // 跳转地址
  await page.setViewport({                  //设置窗口大小
    width: 570,
    height: 882,
    deviceScaleFactor: 1,
  });

  // 1-点击选择定位
  await delay(2);
  await page.mouse.click(70, 30)
  console.log('1-选择定位完毕');


  //  2-点击选择城市
  await delay(2);
  await page.mouse.click(20, 20)
  console.log('2-选择城市完毕');

  //  3-输入城市名
  await delay(2);
  await page.mouse.click(40, 20)
  await page.keyboard.sendCharacter(city);
  console.log('3-1-输入城市完毕');
  await delay(2);
  await page.mouse.click(50, 70)
  console.log('3-2-搜索完毕');

  //  4-输入街道名字
  await delay(2);
  await page.mouse.click(150, 25)
  await page.keyboard.sendCharacter(street);
  console.log('4-1-输入完毕');
  await delay(2);
  await page.mouse.click(80, 70);
  console.log('4-2-输入街道完毕');
//开始
  // 5-选择美食
  await delay(2.5);
  // const meishi = '#wm-container > div > div > div._2qDABxIhG58DjS3SnGcdQ4 > div:nth-child(1) > a:nth-child(2) > div.lYqlChWY4rNp3-JYyHmhG > div > div > img'
  // await page.click(meishi);
  // await page.mouse.click(50,90);
    // 美食DOM操作
    var content, $;
    content = await page.content();
    $ = cheerio.load(content);
    // 获取甜点饮品列表种类
    //#wm-container > div > div > div._2qDABxIhG58DjS3SnGcdQ4 > div:nth-child(1)
    // const meishili = $($($('#wm-container').find('div').find('div').find('div')[2]).find('div')[1]).find('div')
    // console.log('美食栏目列表的种类数量为—————'+meishili)
    const reg = /[\u4e00-\u9fa5]/g;
    for (var i = 2; i <= 10; i+=2 ) {
      const msSecltor = '#wm-container > div > div > div._2qDABxIhG58DjS3SnGcdQ4 > div:nth-child(1) > a:nth-child('+i+') > div._35aWbI-Ceo7eXbrvcqpnOb';
      const meishiItem = await page.$$eval(msSecltor, el => el.map(el => el.innerHTML));
      console.log(meishiItem)
      const meishiItemStr = meishiItem.toString();
      console.log(meishiItemStr)
      // 正则表达验证匹配出 '美食'
      const msItem = meishiItemStr.match(reg).join("");
      if (msItem === '美食') {
        // 如果是美食，则点击，并跳出循环
        await page.click(msSecltor);
        break;
      } else {
        //如果不是美食，则输出改名称，继续下一次循环
        console.log('这是' + msItem)
      }
    }
  console.log('5-选择美食');

 

  // 6-选择甜品饮料
  await delay(2);
  const downChar = '#wm-container > div > div > div._3kSnSjC9S9KReCKprH-Lge > div > div > i'
  // await page.waitForSelector(downChar);
  await page.click(downChar);
  // await page.mouse.click(528,61);
  await delay(1);
  const tianpin = '#wm-container > div > div > div._3kSnSjC9S9KReCKprH-Lge > div._3d2jboBImIJUT8nNyNjQf._1koXTwWGeaiJ6z0IZPz7cU > div._2RzYgqmpmvwO7sD8ysBW-r > div.uCIgM9d5TleIjKtlgKtyy > ul > li:nth-child(3)'
  // await page.waitForSelector(tianpin);
  await page.click(tianpin);
  // await page.mouse.click(50,146);
  await delay(1);

  // DOM操作
  // var content, $;
  content = await page.content();
  $ = cheerio.load(content);
  // 获取甜点饮品列表种类
  const menu = $($('#wm-container').find('ul')[2]).find('li').length
  console.log('甜点饮品列表的种类数量为—————'+menu)
  // const reg = /[\u4e00-\u9fa5]/g;
  for (var i = 1, y = 0; i <= menu; i++ , y += 40) {
    const secltor = '#wm-container > div > div > div._3kSnSjC9S9KReCKprH-Lge > div._3d2jboBImIJUT8nNyNjQf > div._2RzYgqmpmvwO7sD8ysBW-r > div._2G9HcEoPx_j4gIzGhrWKQb > ul > li:nth-child(' + i + ')';
    const liTwo = await page.$$eval(secltor, el => el.map(el => el.innerHTML));
    const liTwoStr = liTwo.toString();
    console.log(liTwoStr)
    // 正则表达验证匹配出 '奶茶果汁'
    const drink = liTwoStr.match(reg).join("");
    if (drink === '奶茶果汁') {
      // 如果是奶茶果汁，则点击，并跳出循环
      await page.mouse.click(270, 65 + y);
      break;
    } else {
      //如果不是奶茶果汁，则输出改名称，继续下一次循环
      console.log('这是' + drink)
    }
  }
  console.log('循环结束')
  await delay(2);

  console.log('开始滚动');
  // var content ,$ ;
  var i = 0;
  async function scrollPage() {
    content = await page.content();
    $ = cheerio.load(content);
    // 执行js代码（滚动页面）
    // 获取店家数量（代码虽然相同，有别于上方menu）
    const li = $($('#wm-container').find('ul')[2]).find('li').length
    console.log('商家的数量为——————' + li)
    console.log('开始点击店家')
    // 根据获取的店家数量确认循环次数，并且依次进入店家
    for (var i = 1; i <= li; i++) {
      await page.click('#wm-container > div > div > div > div > ul > li:nth-child(' + i + ')');
      // 7-选择奶茶果汁商店
      await delay(2);
      await page.mouse.click(50, 80 + y);
      // await page.mouse.click(50,80);
      console.log('7-进入第 ' + i + ' 家商店');

      // 8-选择商店功能
      await delay(2);
      //判断页面中有无弹框并关闭
      page.on('dialog', async dialog => {
        console.log(dialog.message()); //打印弹框内容
        await dialog.dismiss(); 关闭弹窗
      })
      await page.mouse.click(95, 160);
      console.log('8-1-进入点菜界面');
      await delay(2);
      await page.mouse.move(280, 160);
      await page.mouse.down();
      await delay(2);
      await page.mouse.up();

      console.log('8-2-进入评价界面');

      await delay(2);
      await page.mouse.move(465, 160);
      await page.mouse.down();
      await delay(3);
      await page.mouse.up();
      console.log('8-3-进入商家界面');

      // 9-退回商店列表
      await delay(1);
      await page.mouse.click(20, 25);
      console.log('9-退回商店列表成功');
      await delay(2);
      // y+=90;
      console.log("j=" + y);
      console.log("i=" + i)
      console.log('点击完成')
    }
    return li;
  };
  //触发键盘事件HOMR和END,下拉直至出现'已无更多商户'，停止下拉，触发HOME，返回最上部
  for (var y = 0; y <= 100; y++) {
    await delay(2)
    // 触发键盘事件END
    await page.keyboard.press('End');
    // 获取最下模块div进行解析
    const secltor = '#wm-container > div > div > div._3uTnjGaICQR0QQJ0b-Nk8k._2yCMxFCzKcIRQuCBS1XZ_k > div > div '
    let res = await page.$$eval(secltor, el => el.map(el => el.innerHTML));
    const resStr = res.toString();
    console.log(resStr);
    // 正则验证匹配出文字'正在加载'或'已无更多商户'
    const reTxt = resStr.match(reg).join("");
    console.log(reTxt)
    // 判断
    if (reTxt == '正在加载') {
      console.log('继续下滑')
      await page.keyboard.press('End');
    } else {
      console.log('已找到已无更多商户')
      break;
    }
    console.log(y + '===')
  };
  await delay(2);
  await delay(2);
  // 下拉至底部后再返回最顶部
  
  await page.keyboard.press('Home');
  await delay(2);
  console.log('滚动结束')

  // 获取页面li数量
  let li = await scrollPage();
  // console.log(li)
  //结束
  
  await delay(3);
  await page.goto('https://h5.waimai.meituan.com/waimai/mindex/home');
  // await page.screenshot({path: 'testImg/meituan02.png'});    //通过screenshot方法完成截屏，保存到指定path中
  // await browser.close();    // 关闭整个‘浏览器’
};
//调用way方法，巡行操作器
// const cityArr = [
//   {city:'北京',street:'东华门街道办事处'},
//   {city:'北京',street:'景山街道办事处'},
//   {city:'北京',street:'交道口街道办事处'},
//   {city:'北京',street:'安定门街道办事处'},
// ];

fs.readFile('./codeTest.json','utf-8',function(err,data){
  let cityArr = JSON.parse(data)
  for (var i = 0; i < cityArr.length; i++) {
    //  console.log(cityArr[i].city)
  way(cityArr[i].cityName,cityArr[i].name );
}
});


