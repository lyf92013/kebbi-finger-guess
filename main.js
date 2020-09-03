window.onload = async () => {
  let bg = document.getElementsByTagName("body")[0]
  let countdown = document.getElementById('countdown')
  let guessList = [['布', '0068B1'], ['石頭', '00954D'], ['背景', 'FFFFFF'], ['剪刀', 'D42D26']]
  let rivalGuess = null
  let isGameing = false
  let kguess = [...guessList]
  let detectGuess
  let webduinoBroadcastor
  const topic = 'E3PLJ'

  kguess.splice(2, 1) // 移除背景

  if (!webduinoBroadcastor) {
    webduinoBroadcastor = new webduino.module.mqttClient();
    await webduinoBroadcastor.connect();
  }

  await webduinoBroadcastor.onMessage(topic, async (message) => {
    if(message === 'get'){
      Nuwa.say('恭喜你得到糖果')
    }
  });

  let imageClassifier = new webduino.module.imageml("8748bec0-ec28-11ea-b850-bfc5aeeca693", "本機", false);
  for (let i = 0; i < guessList.length; i++) {
    imageClassifier.onLabel(i, function (idx) {
      detectGuess = idx
      // console.log(guessList[detectGuess][0])
    });
  }

  // 模擬Kebbi摸頭
  // setTimeout(async () => {
  //   startGame()
  // }, 1000)

  Nuwa.on('tap', webduino.module.Nuwa.Constants.HEAD, async () => {
    if (!isGameing) startGame()
  })

  async function startGame() {
    isGameing = true

    // 倒數3秒
    updateScreen(null, 'FFDE40')
    countdown.style.display = 'block'
    for (let i = 3; i > 0; i--) {
      countdown.innerHTML = i
      await Nuwa.say(i.toString())
      // await delay(1)
    }
    countdown.style.display = 'none'

    // 顯示請出拳
    updateScreen('guess', 'FFDE40')
    console.log("出拳")
    Nuwa.say("請出拳")
    await delay(2)
    rivalGuess = guessList[detectGuess][0]
    console.log(`玩家`, rivalGuess)
    await delay(0.5)

    // 猜拳結果
    Nuwa.syncMotionPlay("666_TA_DictateR");
    let random = Math.floor(Math.random() * 3)
    let kebbiGuess = kguess[random][0]
    let kebbiGuessBg = kguess[random][1]
    updateScreen(kebbiGuess, kebbiGuessBg)
    Nuwa.say(`我出${kebbiGuess}`)
    await delay(4)

    if (rivalGuess === kebbiGuess) {
      Nuwa.say('平手')
      Nuwa.syncMotionPlay("666_BA_RzArmS90");
      updateScreen('tie', 'FFDE40')
    } else if (rivalGuess === '剪刀' && kebbiGuess === '布' ||
      rivalGuess === '布' && kebbiGuess === '石頭' ||
      rivalGuess === '石頭' && kebbiGuess === '剪刀') {
      updateScreen('lose', 'FFDE40')
      Nuwa.say('你贏了')
      Nuwa.syncMotionPlay("666_EM_Sad03");
      webduinoBroadcastor.send({
        topic,
        message: 'drop'
      });
    } else if (rivalGuess === '背景') {
      updateScreen('what', 'FFDE40')
      Nuwa.say('再出一次')
    } else {
      updateScreen('win', 'FFDE40')
      Nuwa.say('我贏了')
      Nuwa.syncMotionPlay("666_EM_Happy03");
    }
    await delay(2)

    // 初始畫面
    updateScreen('start', 'FFDE40')
    isGameing = false
  }

  function delay(sec) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sec * 1000)
    })
  }

  function updateScreen(name, bgColor) {
    if (name !== null) {
      bg.style.backgroundImage = `url(\"./asset/${name}.png\")`
    } else {
      bg.style.backgroundImage = "none"
    }
    bg.style.backgroundColor = `#${bgColor}`
  }
}