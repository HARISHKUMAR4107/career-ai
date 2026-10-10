const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = "learnxai-prototype-v1";
const initialState = {
  name: "Harish",
  scores: { Variables: 90, Loops: 82, Arrays: 42, OOP: 55, Strings: 72, Collections: 48 },
  quizScores: [70, 65, 69],
  completed: ["Java fundamentals"],
  career: "java",
  activities: [
    { title: "Completed Java fundamentals quiz", detail: "Today · Score 70%" },
    { title: "Reviewed loop concepts", detail: "Yesterday · 15 minutes" },
    { title: "Started Java fundamentals", detail: "2 days ago · Learning module" }
  ]
};
let state = loadState();
let currentQuestion = 0;
let answers = {};
let chart = null;
let toastTimer;

const questions = [
  { topic:"Variables", q:"Which Java type is commonly used to store a whole number such as 25?", options:["double","int","boolean","char"], correct:1, explanation:"The int type stores whole numbers within its supported range." },
  { topic:"Loops", q:"Which loop is commonly used when you know how many times to repeat an action?", options:["for loop","try block","switch","class"], correct:0, explanation:"A for loop is convenient when the repetition count or iteration range is known." },
  { topic:"Arrays", q:"What is the index of the first element in a Java array?", options:["1","-1","0","It has no index"], correct:2, explanation:"Java arrays use zero-based indexing, so the first element is at index 0." },
  { topic:"OOP", q:"Which concept lets a class inherit fields and methods from another class?", options:["Iteration","Inheritance","Compilation","Casting"], correct:1, explanation:"Inheritance allows a class to derive behavior and state from another class." },
  { topic:"Collections", q:"Which Java collection is designed to store unique elements?", options:["ArrayList","HashSet","StringBuilder","Scanner"], correct:1, explanation:"HashSet stores unique elements and does not preserve insertion order by default." }
];
const resources = {
  Variables: { description:"Refresh primitive data types and variable declarations, then solve five quick examples.", resource:"Java variables & data types", time:"10 min" },
  Loops: { description:"Practice for, while, and do-while loops using small counting problems.", resource:"Loop practice worksheet", time:"15 min" },
  Arrays: { description:"Review zero-based indexing and array traversal before solving beginner array exercises.", resource:"Arrays: basics and traversal", time:"20 min" },
  OOP: { description:"Revisit classes, objects, inheritance, encapsulation, and simple real-world examples.", resource:"OOP concepts in Java", time:"20 min" },
  Strings: { description:"Practice common String methods, comparisons, and character traversal.", resource:"Java String exercises", time:"15 min" },
  Collections: { description:"Compare List, Set, and Map, then practice choosing the right collection.", resource:"Java Collections overview", time:"20 min" }
};
const careers = {
  java: { title:"Java Developer", subtitle:"Build reliable backend services and applications.", icon:"☕", steps:[
    ["Java fundamentals","Variables, conditions, loops, methods, and basic debugging."],
    ["Object-oriented programming","Classes, inheritance, interfaces, encapsulation, and exceptions."],
    ["Collections & DSA","Lists, sets, maps, sorting, searching, and complexity basics."],
    ["SQL & Spring Boot","Relational databases, REST APIs, validation, and persistence."],
    ["Portfolio project","Build and document a REST API project with tests and deployment."]
  ]},
  fullstack: { title:"Full-Stack Developer", subtitle:"Create complete web experiences from UI to database.", icon:"⌘", steps:[
    ["HTML, CSS & JavaScript","Build responsive layouts and interactive browser features."],
    ["Frontend framework","Learn React components, props, state, and routing."],
    ["Backend APIs","Create REST endpoints, validation, and authentication."],
    ["Database fundamentals","Model data, write SQL queries, and connect your backend."],
    ["Deploy a full-stack project","Publish the frontend and backend with clear documentation."]
  ]},
  ai: { title:"AI / ML Engineer", subtitle:"Build data-driven applications and useful AI features.", icon:"✦", steps:[
    ["Python foundations","Practice functions, collections, files, and clean code."],
    ["Math & data basics","Learn descriptive statistics, vectors, and data preparation."],
    ["Machine learning","Explore model training, evaluation, and overfitting."],
    ["AI APIs & responsible use","Build an app with an AI API and handle errors safely."],
    ["AI portfolio project","Document a real use case, evaluation, limitations, and demo."]
  ]}
};

function loadState(){
  try { const saved=localStorage.getItem(STORAGE_KEY); return saved ? {...structuredClone(initialState),...JSON.parse(saved)} : structuredClone(initialState); }
  catch { return structuredClone(initialState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function showToast(message){
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}
function escapeHtml(value){ return String(value).replace(/[&<>"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function goTo(page){
  const target=$("#page-"+page); if(!target) return;
  $$(".page").forEach(p=>p.classList.toggle("active",p===target));
  $$(".nav-link[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("#pageCrumb").textContent=({dashboard:"Dashboard",assessment:"Skill assessment",learning:"My learning",tutor:"AI tutor",career:"Career roadmap",skills:"Skill wallet"})[page]||"Dashboard";
  $("#sidebar").classList.remove("open");
  if(page==="career") renderCareer();
  if(page==="skills") renderSkills();
  if(page==="learning") renderLearning();
  window.scrollTo({top:0,behavior:"smooth"});
}
function focusTopics(){ return Object.entries(state.scores).filter(([,score])=>score<60).sort((a,b)=>a[1]-b[1]); }
function avgScore(){ return state.quizScores.length ? Math.round(state.quizScores.reduce((a,b)=>a+b,0)/state.quizScores.length) : 0; }
function renderDashboard(){
  $("#sideName").textContent=state.name; $("#topName").textContent=state.name; $("#welcomeName").textContent=state.name;
  const progress=Math.min(100,Math.round(25 + state.completed.length*8 + state.quizScores.length*3));
  $("#progressValue").textContent=progress+"%"; $("#progressBar").style.width=progress+"%";
  $("#quizCount").textContent=state.quizScores.length; $("#avgScore").textContent=avgScore()+"%"; $("#weakCount").textContent=focusTopics().length;
  renderRecommendations(); renderActivity(); renderChart();
}
function renderRecommendations(){
  const weak=focusTopics().slice(0,3);
  const list=weak.length ? weak.map(([topic,score])=>({topic,score,...(resources[topic]||{description:"Practice this topic with a short learning activity.",resource:"Guided practice",time:"15 min"})})) : [{topic:"Advanced Java",score:state.scores["Variables"],description:"Your tracked topics look strong. Try a harder practice set.",resource:"Challenge questions",time:"20 min"}];
  $("#recommendationList").innerHTML=list.map(item=>`<div class="recommendation"><div class="recommendation-icon">✦</div><div><strong>${escapeHtml(item.resource)}</strong><p>${escapeHtml(item.topic)} · ${item.score}% · ${escapeHtml(item.time)}<br>${escapeHtml(item.description)}</p></div></div>`).join("");
}
function renderActivity(){
  $("#activityList").innerHTML=state.activities.slice(0,4).map(a=>`<div class="activity-item"><span class="activity-dot"></span><div><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.detail)}</p></div></div>`).join("");
}
function renderChart(){
  const canvas=$("#performanceChart"); if(!canvas || !window.Chart) return;
  if(chart) chart.destroy();
  chart=new Chart(canvas,{type:"bar",data:{labels:Object.keys(state.scores),datasets:[{label:"Topic score",data:Object.values(state.scores),backgroundColor:["#a5b4fc","#818cf8","#06b6d4","#f59e0b","#34d399","#67e8f9"],borderRadius:6,borderSkipped:false,maxBarThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.raw}%`}}},scales:{y:{beginAtZero:true,max:100,ticks:{stepSize:25,color:"#9299aa",font:{size:10}},grid:{color:"#eef0f5"},border:{display:false}},x:{ticks:{color:"#6b7280",font:{size:10}},grid:{display:false},border:{display:false}}}}});
}
function renderQuestion(){
  const q=questions[currentQuestion];
  $("#questionCounter").textContent=`Question ${currentQuestion+1} of ${questions.length}`;
  $("#questionProgress").style.width=`${((currentQuestion+1)/questions.length)*100}%`;
  $("#questionArea").innerHTML=`<span class="question-tag">QUESTION ${currentQuestion+1} · ${escapeHtml(q.topic.toUpperCase())}</span><h2 class="question-title">${escapeHtml(q.q)}</h2><div class="options">${q.options.map((option,i)=>`<button class="option ${answers[currentQuestion]===i?"selected":""}" data-option="${i}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(option)}</span></button>`).join("")}</div>`;
  $$(".option",$("#questionArea")).forEach(btn=>btn.addEventListener("click",()=>{answers[currentQuestion]=Number(btn.dataset.option);renderQuestion();}));
  $("#prevQuestion").disabled=currentQuestion===0; $("#prevQuestion").style.opacity=currentQuestion===0?".45":"1";
  $("#nextQuestion").textContent=currentQuestion===questions.length-1?"Submit assessment ✓":"Next question →";
  $("#assessmentResult").classList.add("hidden");
}
function submitAssessment(){
  let correct=0; const topicResults={};
  questions.forEach((q,i)=>{const isCorrect=answers[i]===q.correct;if(isCorrect)correct++;topicResults[q.topic]=isCorrect?100:35;});
  Object.entries(topicResults).forEach(([topic,newScore])=>{state.scores[topic]=Math.round((state.scores[topic]*0.35)+(newScore*0.65));});
  const score=Math.round(correct/questions.length*100);state.quizScores.push(score);
  state.activities.unshift({title:"Completed Java skill assessment",detail:`Just now · Score ${score}%`});
  state.activities=state.activities.slice(0,8);
  state.completed=[...new Set([...state.completed,"Java skill assessment"])];
  saveState();renderDashboard();renderLearning();renderSkills();
  const result=$("#assessmentResult");result.classList.remove("hidden");
  result.innerHTML=`<h3>Assessment completed! You scored ${score}%</h3><p>You answered ${correct} out of ${questions.length} questions correctly. Your topic profile and recommendations have been updated.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button class="primary-btn" id="seePlanBtn">View personalized plan →</button><button class="secondary-btn" id="retryBtn">Try again</button></div>`;
  $("#seePlanBtn").addEventListener("click",()=>goTo("learning"));$("#retryBtn").addEventListener("click",()=>{currentQuestion=0;answers={};renderQuestion();});
  $("#questionArea").innerHTML="";$("#assessment-controls");
  $("#prevQuestion").classList.add("hidden");$("#nextQuestion").classList.add("hidden");
  showToast("Assessment saved to this browser");
}
function renderLearning(){
  const entries=Object.entries(state.scores).sort((a,b)=>a[1]-b[1]);
  $("#learningFocusCount").textContent=`${focusTopics().length} focus topics`;
  $("#learningCards").innerHTML=entries.map(([topic,score])=>{const data=resources[topic]||{description:"Practice with targeted exercises to reinforce your understanding.",resource:`${topic} practice`,time:"15 min"};const strong=score>=80;return `<article class="learning-card"><div class="learning-card-head"><span class="stat-icon ${strong?"green":"purple"}" style="margin:0">${strong?"✓":"✦"}</span><span class="level-pill ${strong?"strong":""}">${strong?"Strong":score>=60?"Developing":"Needs focus"}</span></div><h3>${escapeHtml(topic)}</h3><div class="score">${score}%</div><div class="progress"><span style="width:${score}%"></span></div><p>${escapeHtml(data.description)}</p><p><strong>Suggested activity:</strong> ${escapeHtml(data.resource)} · ${escapeHtml(data.time)}</p><button class="primary-btn" data-study="${escapeHtml(topic)}">${state.completed.includes(topic)?"Review topic":"Mark as studied"} →</button></article>`;}).join("");
  $$("[data-study]",$("#learningCards")).forEach(btn=>btn.addEventListener("click",()=>{const topic=btn.dataset.study;state.completed=[...new Set([...state.completed,topic])];state.activities.unshift({title:`Studied ${topic}`,detail:"Just now · Learning activity"});state.activities=state.activities.slice(0,8);saveState();renderDashboard();renderLearning();showToast(`${topic} marked as studied`);}));
}
function tutorReply(text){
  const t=text.toLowerCase();
  if(t.includes("array"))return "A Java array stores multiple values of the same type in one variable. Example: int[] marks = {80, 75, 90}; The first value is marks[0] because Java uses zero-based indexing. Practice by looping through the array and calculating its sum.";
  if(t.includes("oop")||t.includes("object-oriented")||t.includes("inherit"))return "Object-oriented programming organizes code around classes and objects. Four common ideas are encapsulation (protecting data), inheritance (reusing a parent class), polymorphism (one interface, different behavior), and abstraction (showing essential details). Try creating a Student class with name and mark fields.";
  if(t.includes("loop")||t.includes("practice"))return "Start with a for loop when you know the number of repetitions. Example: for (int i = 1; i <= 5; i++) { System.out.println(i); } Then practice printing even numbers, summing 1 to n, and traversing an array. Trace the value of i on paper when you're unsure.";
  if(t.includes("variable")||t.includes("data type"))return "A variable is a named place to store a value. In Java, int age = 19 stores a whole number, double price = 12.5 stores a decimal, char grade = 'A' stores one character, and boolean passed = true stores true/false. Choose a type that matches the data.";
  if(t.includes("study")||t.includes("plan")||t.includes("learn"))return "Try a 20-minute routine: spend 5 minutes reviewing one concept, 10 minutes solving two or three problems, and 5 minutes explaining the solution in your own words. Revisit weak topics after a day and take a short quiz to check retention.";
  return "Good question! For this prototype, I can share sample guidance on Java variables, loops, arrays, OOP, and study planning. Try asking: “Explain Java arrays simply” or “How should I practice loops?” These are predefined demo responses, not a live AI-generated answer.";
}
function addMessage(text,isUser=false){
  const wrap=document.createElement("div");wrap.className=`message ${isUser?"user-message":""}`;
  const avatar=document.createElement("span");avatar.className="message-avatar";avatar.textContent=isUser?"H":"✦";
  const bubble=document.createElement("div");const p=document.createElement("p");p.textContent=text;const small=document.createElement("small");small.textContent=isUser?"You":"Demo response · Not live AI";bubble.append(p,small);wrap.append(avatar,bubble);$("#chatMessages").append(wrap);$("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;
}
function renderCareer(){
  const c=careers[state.career]||careers.java;
  $("#careerContent").innerHTML=`<div class="career-title-row"><div class="career-large-icon">${c.icon}</div><div><h2>${c.title}</h2><p>${c.subtitle}</p></div></div><div class="roadmap">${c.steps.map((step,i)=>{const key=`${state.career}-${i}`;const done=state.completed.includes(key);return `<div class="roadmap-step"><span class="step-number ${done?"done":""}">${done?"✓":i+1}</span><div><strong>${escapeHtml(step[0])}</strong><p>${escapeHtml(step[1])}</p></div><label><input type="checkbox" data-roadmap="${key}" ${done?"checked":""}/> Done</label></div>`;}).join("")}</div><p class="muted">Roadmap progress is saved in this browser. This is educational guidance, not a job guarantee.</p>`;
  $$("[data-roadmap]",$("#careerContent")).forEach(input=>input.addEventListener("change",()=>{const key=input.dataset.roadmap;if(input.checked)state.completed=[...new Set([...state.completed,key])];else state.completed=state.completed.filter(x=>x!==key);saveState();renderCareer();renderSkills();renderDashboard();showToast("Career roadmap updated");}));
}
function renderSkills(){
  const entries=Object.entries(state.scores);
  $("#skillsExplored").textContent=entries.length;$("#milestoneCount").textContent=Math.min(4,1+(state.quizScores.length>=4?1:0)+(state.completed.length>=3?1:0));
  $("#skillList").innerHTML=entries.map(([topic,score])=>`<div class="skill-item"><strong>${escapeHtml(topic)}</strong><div class="progress"><span style="width:${score}%;background:${score>=80?"#10b981":score>=60?"#4f46e5":"#f59e0b"}"></span></div><span>${score}%</span></div>`).join("");
  const achievements=[{icon:"⚡",title:"First steps",desc:"Started your learning journey",earned:true},{icon:"✓",title:"Quiz taker",desc:"Complete a quiz or assessment",earned:state.quizScores.length>0},{icon:"◈",title:"Consistent learner",desc:"Complete 3 learning activities",earned:state.completed.length>=3},{icon:"✦",title:"Skill builder",desc:"Reach 80% in a topic",earned:Object.values(state.scores).some(s=>s>=80)}];
  $("#achievementList").innerHTML=achievements.map(a=>`<div class="achievement ${a.earned?"":"locked"}"><div class="achievement-icon">${a.icon}</div><strong>${a.title}</strong><p>${a.desc}<br>${a.earned?"Earned":"Not yet earned"}</p></div>`).join("");
}
function resetDemo(){
  if(!confirm("Reset all LearnXAI demo progress in this browser?"))return;
  state=structuredClone(initialState);saveState();currentQuestion=0;answers={};renderDashboard();renderQuestion();renderLearning();renderSkills();renderCareer();$("#prevQuestion").classList.remove("hidden");$("#nextQuestion").classList.remove("hidden");$("#assessmentResult").classList.add("hidden");$("#questionArea").innerHTML="";renderQuestion();showToast("Demo data has been reset");
}
$$(".nav-link[data-page]").forEach(btn=>btn.addEventListener("click",()=>goTo(btn.dataset.page)));
$$("[data-goto]").forEach(btn=>btn.addEventListener("click",()=>goTo(btn.dataset.goto)));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#resetBtn").addEventListener("click",resetDemo);
$("#profileBtn").addEventListener("click",()=>showToast("Demo profile: "+state.name));
$("#prevQuestion").addEventListener("click",()=>{if(currentQuestion>0){currentQuestion--;renderQuestion();}});
$("#nextQuestion").addEventListener("click",()=>{if(answers[currentQuestion]===undefined){showToast("Please select an answer first");return;}if(currentQuestion<questions.length-1){currentQuestion++;renderQuestion();}else submitAssessment();});
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput");const text=input.value.trim();if(!text)return;addMessage(text,true);input.value="";setTimeout(()=>addMessage(tutorReply(text)),180);});
$$("[data-prompt]").forEach(btn=>btn.addEventListener("click",()=>{addMessage(btn.dataset.prompt,true);setTimeout(()=>addMessage(tutorReply(btn.dataset.prompt)),180);}));
$$("[data-career]").forEach(btn=>btn.addEventListener("click",()=>{state.career=btn.dataset.career;saveState();$$("[data-career]").forEach(b=>b.classList.toggle("active",b===btn));renderCareer();}));
$("#questionArea").innerHTML="";
renderDashboard();renderQuestion();renderLearning();renderSkills();renderCareer();
