(function(){
let questions = [];
let quizQueue = [];
let answeredMap = new Map();
let wrongIndexes = [];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateProgress() {
  const fill = document.getElementById("progress-bar-fill");
  const percent = Math.round((answeredMap.size / quizQueue.length) * 100);
  fill.style.width = `${percent}%`;
}

function loadAllQuestions() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  quizQueue.forEach((q, index) => {
    const block = document.createElement("div");
    block.className = "question-block";

    const qText = document.createElement("div");
    qText.className = "question";
    qText.textContent = `第 ${index + 1} 題：` + q.text;

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "options";

    while (q.options.length < 4) {
      q.options.push("（缺少選項）");
    }

    q.options.forEach((opt, idx) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `question-${index}`;
      radio.value = idx;
      radio.onclick = () => {
        answeredMap.set(index, parseInt(radio.value));
        updateProgress();
      };
      label.appendChild(radio);
      label.append(" ", opt);
      optionsDiv.appendChild(label);
    });

    const explanation = document.createElement("div");
    explanation.className = "explanation";
    explanation.textContent = `【解析】正確答案是「${q.options[q.answer]}」。請參考課本內容理解。`;
    explanation.style.display = "none";
    explanation.id = `explanation-${index}`;

    block.appendChild(qText);
    block.appendChild(optionsDiv);
    block.appendChild(explanation);
    container.appendChild(block);
  });

  updateProgress();
}

function calculateScore() {
  let correct = 0;
  let wrongList = [];
  wrongIndexes = [];

  quizQueue.forEach((q, i) => {
    if (answeredMap.get(i) === q.answer) {
      correct++;
    } else {
      wrongList.push(`第 ${i + 1} 題：${q.text}`);
      wrongIndexes.push(i);
    }
    document.getElementById(`explanation-${i}`).style.display = "block";
  });

  const scoreDiv = document.getElementById("score");
  scoreDiv.textContent = `你答對了 ${correct} 題，共 ${quizQueue.length} 題，正確率：${Math.round((correct / quizQueue.length) * 100)}%`;

  const wrongDiv = document.getElementById("wrong-questions");
  if (wrongList.length > 0) {
    wrongDiv.innerHTML = "<strong>以下是你答錯的題目：</strong><ul>" + wrongList.map(q => `<li>${q}</li>`).join('') + "</ul>";
  } else {
    wrongDiv.innerHTML = "<strong>太棒了，你全部答對囉！🎉</strong>";
  }
}

function restartQuiz() {
  answeredMap.clear();
  quizQueue = shuffle([...questions]).slice(0, 50);
  document.getElementById("score").innerHTML = "";
  document.getElementById("wrong-questions").innerHTML = "";
  loadAllQuestions();
}

function practiceWrongOnly() {
  if (wrongIndexes.length === 0) {
    alert("目前沒有錯題可練習，請先完成一次測驗。");
    return;
  }
  answeredMap.clear();
  quizQueue = wrongIndexes.map(i => quizQueue[i]);
  document.getElementById("score").innerHTML = "";
  document.getElementById("wrong-questions").innerHTML = "<strong>現在僅顯示你先前答錯的題目</strong>";
  loadAllQuestions();
}

fetch("innovation_questions_v2.json")
  .then(response => response.json())
  .then(data => {
    questions = shuffle(data);
    quizQueue = questions.slice(0, 50);
    loadAllQuestions();
  })
  .catch(err => {
    document.getElementById("quiz-container").textContent = "⚠️ 無法載入題庫檔案";
    console.error("題庫載入錯誤：", err);
  });
})();
