import { useState, useCallback, useMemo } from "react";

const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const cl=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const uid=()=>crypto.randomUUID().slice(0,8);

const P={bg:"#060810",bg2:"#0b0e18",pnl:"#0f1220",pnl2:"#161b2e",bdr:"#1c2240",acc:"#00ddb3",gold:"#ffc844",red:"#ff4466",grn:"#22dd88",blue:"#4499ff",purple:"#9966ff",pink:"#ff66aa",orange:"#ff8844",txt:"#d8e0f0",dim:"#5a6a88",mut:"#2a3350",white:"#eef2ff"};
const TC=["#7dd3fc","#5eead4","#86efac","#fde68a","#fdba74","#fca5a5","#c4b5fd","#f9a8d4","#fb923c","#94a3b8"];
const MO=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

const FLOORS=[
  {id:"time_n",cat:"time",name:"标准时间",icon:"⏱️",desc:"默认",ap:0,cost:0,fx:{timeM:1}},
  {id:"time_l",cat:"time",name:"加时赛",icon:"⏳",desc:"时间+50%",ap:3,cost:200,fx:{timeM:1.5,solvB:.15}},
  {id:"time_s",cat:"time",name:"闪电赛",icon:"⚡",desc:"时间-30%",ap:2,cost:100,fx:{timeM:.7,hangM:1.3,repB:1}},
  {id:"fmt_oi",cat:"fmt",name:"OI赛制",icon:"📋",desc:"盲评",ap:0,cost:0,fx:{hangR:.15}},
  {id:"fmt_ioi",cat:"fmt",name:"IOI赛制",icon:"🔄",desc:"无挂分",ap:4,cost:500,fx:{hangR:0}},
  {id:"fmt_se",cat:"fmt",name:"OI+Self-Eval",icon:"🔍",desc:"挂分↓",ap:2,cost:200,fx:{hangR:.06}},
  {id:"opening",cat:"evt",name:"开幕式",icon:"🎪",desc:"声誉+3",ap:3,cost:600,fx:{repB:3,partM:1.1}},
  {id:"lecture",cat:"evt",name:"赛后讲题",icon:"🎓",desc:"声誉+2",ap:2,cost:350,fx:{repB:2}},
  {id:"live",cat:"evt",name:"比赛直播",icon:"📺",desc:"知名度↑",ap:4,cost:700,fx:{repB:2,partM:1.2}},
  {id:"awards",cat:"evt",name:"颁奖典礼",icon:"🏅",desc:"声誉+4",ap:3,cost:900,fx:{repB:4}},
  {id:"wkshp",cat:"evt",name:"Workshop",icon:"🛠️",desc:"赛前辅导",ap:2,cost:300,fx:{repB:1,solvB:.1}},
  {id:"p_easy",cat:"diff",name:"简单题集",icon:"🟢",desc:"难度-2",ap:1,cost:50,fx:{diffM:-2,partM:1.2}},
  {id:"p_hard",cat:"diff",name:"困难题集",icon:"🔴",desc:"难度+2",ap:2,cost:100,fx:{diffM:2,repMul:1.3,partM:.8}},
  {id:"p_more",cat:"diff",name:"题目加量",icon:"📚",desc:"+2题",ap:3,cost:250,fx:{extraP:2}},
  {id:"wifi",cat:"fac",name:"高速网络",icon:"📡",desc:"评测↑",ap:2,cost:400,fx:{hangM:.7,repB:1}},
  {id:"food",cat:"fac",name:"选手餐饮",icon:"🍱",desc:"餐饮",ap:1,cost:500,fx:{repB:2,solvB:.05}},
  {id:"shirt",cat:"fac",name:"纪念T恤",icon:"👕",desc:"文化衫",ap:2,cost:400,fx:{repB:2,partM:1.05}},
  {id:"venue",cat:"fac",name:"豪华场地",icon:"🏛️",desc:"顶级考场",ap:5,cost:1200,fx:{repB:3,solvB:.1,partM:1.15}},
  {id:"invite",cat:"spec",name:"特邀选手",icon:"⭐",desc:"知名选手",ap:4,cost:800,fx:{repB:5,partM:1.1}},
  {id:"spons",cat:"spec",name:"企业赞助",icon:"💎",desc:"返成本",ap:3,cost:0,fx:{moneyB:600,repB:1}},
];
const FCATS=[
  {id:"time",name:"时间",c:"#60a5fa",ex:true},{id:"fmt",name:"赛制",c:"#a78bfa",ex:true},
  {id:"evt",name:"活动",c:"#f472b6"},{id:"diff",name:"题目",c:"#34d399"},
  {id:"fac",name:"设施",c:"#fbbf24"},{id:"spec",name:"特殊",c:"#f97316"},
];

// needsBoard = needs housing+food (500+200 per person)
const COMPS=[
  {id:"csjp_chu",name:"CSJ-P初赛",tier:0,bd:1,bp:7,defMonth:9,needsBoard:false},
  {id:"cssp_fu",name:"CSS-P复赛",tier:1,bd:2,bp:4,defMonth:10,needsBoard:false},
  {id:"csjp",name:"CSJ-P",tier:2,bd:3,bp:4,defMonth:11,needsBoard:false},
  {id:"cssp",name:"CSS-P",tier:3,bd:4,bp:4,defMonth:12,needsBoard:false},
  {id:"shengxuan",name:"省选",tier:4,bd:5,bp:4,defMonth:1,needsBoard:true},
  {id:"oinp",name:"OINP",tier:5,bd:6,bp:4,defMonth:2,needsBoard:false},
  {id:"oin",name:"OIN",tier:6,bd:7,bp:4,defMonth:3,needsBoard:true},
  {id:"wc",name:"WC冬令营",tier:7,bd:8,bp:4,defMonth:1,needsBoard:true},
  {id:"cesuo",name:"厕所",tier:8,bd:8,bp:3,defMonth:5,needsBoard:false},
  {id:"camp",name:"OIN夏令营",tier:9,bd:9,bp:4,defMonth:7,needsBoard:true},
];

const JUDGES=[
  {id:"j0",name:"树莓派集群",mdl:"RPi 4B ×10",pow:1,mnt:200,upg:0,e:"🫐"},
  {id:"j1",name:"办公台式机",mdl:"i5-12400 / 16GB",pow:2,mnt:500,upg:3000,e:"🖥️"},
  {id:"j2",name:"专业工作站",mdl:"i7-13700K / 64GB",pow:4,mnt:1000,upg:8000,e:"💻"},
  {id:"j3",name:"高性能服务器",mdl:"Xeon W-2495X / 128GB",pow:7,mnt:2000,upg:20000,e:"🖲️"},
  {id:"j4",name:"数据中心节点",mdl:"EPYC 9654 / 256GB",pow:12,mnt:5000,upg:50000,e:"🏗️"},
  {id:"j5",name:"超算集群",mdl:"Dual EPYC 9754 / 512GB",pow:20,mnt:10000,upg:120000,e:"🔥"},
];

const TAGS=["Ad-Hoc","超纲","冷门"];
const SNAMES=["张三","李四","王五","赵六","陈七","周八","吴九","郑十","钱十一","孙十二","冯十三","褚十四"];
const INAMES=["刘督察","陈巡视","黄监理","马专员","宋审核","高巡查","林督导","许监察"];
const ITITLES=["初级巡视员","中级督察","高级监理","首席特派员"];

function mkS(){const nm=SNAMES[R(0,SNAMES.length-1)]+R(10,99);const sk=R(2,10),qu=R(2,10),cap=R(2,5);return{id:uid(),nm,sk,qu,cap,used:0,cost:Math.round((sk*150+qu*200+cap*120)*(.85+Math.random()*.3)),asgn:[]}}
function mkI(){const nm=INAMES[R(0,INAMES.length-1)]+R(10,99);const lv=R(0,3);const ab=cl(lv*2+R(1,3),1,10);const dil=cl(lv*2+R(0,3),1,10);const sal=Math.round((ab*120+dil*80+lv*400)*(.9+Math.random()*.2));return{id:uid(),nm,lv,title:ITITLES[lv],ab,dil,sal,hire:sal*3}}

function cSt(tw){let hangR=.15,timeM=1,solvB=0,repB=0,partM=1,diffM=0,extraP=0,hangM=1,repMul=1,moneyB=0;(tw.floors||[]).forEach(f=>{const e=f.fx||{};if(e.hangR!==undefined)hangR=e.hangR;if(e.timeM)timeM=e.timeM;if(e.solvB)solvB+=e.solvB;if(e.repB)repB+=e.repB;if(e.partM)partM*=e.partM;if(e.diffM)diffM+=e.diffM;if(e.extraP)extraP+=e.extraP;if(e.hangM)hangM*=e.hangM;if(e.repMul)repMul*=e.repMul;if(e.moneyB)moneyB+=e.moneyB});return{hangR,timeM,solvB,repB,partM,diffM,extraP,hangM,repMul,moneyB,totP:tw.bp+extraP,effD:cl(tw.bd+diffM,1,10)}}

function estP(tw,rep,bridges,towers){const st=cSt(tw);const br=bridges.find(b=>b.to===tw.id);let base;if(tw.tier<=1)base=Math.round(40*Math.pow(1.045,rep)-st.effD*3);else if(br){const fr=towers[br.from];const lp=fr?.lastResult?.part||Math.round(20*Math.pow(1.03,rep));base=Math.round(lp*br.pass);if(fr?.suspended)base=Math.round(base*.3)}else base=Math.round(15*Math.pow(1.035,rep)-st.effD*2);const pe=br?cl(1-(br.price-50)/800,.3,1.3):cl(1-((tw.regPrice||50)-50)/800,.3,1.3);return Math.max(5,Math.round(base*pe*st.partM*(1+((tw.sites||1)-1)*.15)))}

function calcEnd(g){const tp=g.results.reduce((s,r)=>s+r.part,0);const rs=cl(g.rep/80,0,1);const ms=cl(g.money/50000,-.5,1);const ps=cl(tp/5000,0,1);const is=cl((g.inspectors||[]).reduce((s,i)=>s+i.ab,0)/20,0,.3);return{c:rs*.4+ms*.25+ps*.25+is*.1,tp}}

// per-site costs
const PROCTOR_PER_SITE=120; // 监考费
const VENUE_RENT_PER_SITE=200; // 场地费
const VOLUNTEER_PER_SITE=80; // 志愿者
const SECURITY_PER_SITE=150; // 安保+医疗
const BOARD_PER_PERSON=350; // 住宿250+饮食100

function compRunCosts(tw,partCount){
  const sites=tw.sites||1;
  const proctoring=sites*PROCTOR_PER_SITE;
  const venueRent=sites*VENUE_RENT_PER_SITE;
  const volunteers=sites*VOLUNTEER_PER_SITE;
  const security=sites*SECURITY_PER_SITE;
  const board=tw.needsBoard?(partCount*BOARD_PER_PERSON):0;
  const total=proctoring+venueRent+volunteers+security+board;
  return{proctoring,venueRent,volunteers,security,board,total};
}

function trainCost(base,sites){return Math.round(base*(1+(sites-1)*.4))}

/* ── NEWS SYSTEM ── */
function genNews(g){
  const msgs=[];
  const e=calcEnd(g);
  const tp=g.results.reduce((s,r)=>s+r.part,0);
  // money-based (silent criticism)
  if(g.money>300000)msgs.push({icon:"💰",c:P.red,t:"网友热议",m:"CCF的报名费都去哪里了呢？怎么换了个马甲继续圈钱？"});
  else if(g.money>150000)msgs.push({icon:"💸",c:P.orange,t:"社交媒体",m:"有人质疑新协会是否也在走CCF的老路——收费太高了。"});
  else if(g.money>80000)msgs.push({icon:"📰",c:P.gold,t:"财经观察",m:"新竞赛协会资金充裕，运营稳健，但部分选手抱怨费用偏高。"});
  else if(g.money<0)msgs.push({icon:"📉",c:P.red,t:"破产预警",m:"协会已经入不敷出！多家承办学校表示拿不到尾款。"});
  else if(g.money<2000)msgs.push({icon:"⚠️",c:P.orange,t:"财务紧张",m:"协会资金见底，明年的比赛能否如期举办令人担忧。"});

  // rep-based
  if(g.rep>=70)msgs.push({icon:"🌟",c:P.grn,t:"教育部通报",m:"新竞赛体系获得广泛好评，被誉为'后CCF时代的标杆'。"});
  else if(g.rep>=50)msgs.push({icon:"👍",c:P.acc,t:"家长论坛",m:"比赛组织得不错，至少比以前的CCF正规多了。"});
  else if(g.rep>=30)msgs.push({icon:"😐",c:P.gold,t:"OI社区",m:"新协会还行吧，但也没比CCF好到哪去，题目质量参差不齐。"});
  else if(g.rep>=15)msgs.push({icon:"👎",c:P.orange,t:"知乎热帖",m:"又一个割韭菜的竞赛组织？选手体验堪忧。"});
  else msgs.push({icon:"💀",c:P.red,t:"微博热搜",m:"#新协会比CCF还烂# 登上热搜，组委会还没回应。"});

  // participation milestones
  if(tp>10000)msgs.push({icon:"🎉",c:P.grn,t:"里程碑",m:`累计${tp}人次参赛！信息学竞赛正在蓬勃发展。`});
  else if(tp>3000)msgs.push({icon:"📊",c:P.blue,t:"数据报告",m:`已有${tp}人次参赛，竞赛影响力持续扩大。`});
  else if(tp>500)msgs.push({icon:"📈",c:P.acc,t:"行业动态",m:`新竞赛体系已服务${tp}名参赛选手。`});

  // inspector related
  if((g.inspectors||[]).length>=3)msgs.push({icon:"🕵️",c:P.purple,t:"内部消息",m:"协会特派员团队已初具规模，比赛监管力度加强。"});
  if((g.inspectors||[]).length===0&&g.month>24)msgs.push({icon:"❓",c:P.orange,t:"质疑声",m:"协会至今没有设立任何特派员，比赛公平性谁来保障？"});

  // judge
  if(g.jIdx>=4)msgs.push({icon:"💻",c:P.blue,t:"科技新闻",m:"协会的评测系统已达到数据中心级别，评测速度全球领先。"});
  if(g.jIdx===0&&g.month>36)msgs.push({icon:"🐌",c:P.red,t:"选手吐槽",m:"都2040年了还在用树莓派评测？？？等结果等到天荒地老。"});

  // seasonal
  const mo=g.month%12;
  if(mo===8)msgs.push({icon:"📚",c:P.dim,t:"新学期",m:"新学年开始，CSJ-P初赛报名即将开启。"});
  if(mo===0)msgs.push({icon:"🎆",c:P.gold,t:"新年快乐",m:`${g.year+Math.floor(g.month/12)}年到来，新赛季新希望！`});

  // ending hints (subtle)
  if(e.c>=.7)msgs.push({icon:"✨",c:P.grn,t:"评论",m:"也许我们正在见证一个传奇的诞生。"});
  else if(e.c<=.25)msgs.push({icon:"😰",c:P.red,t:"评论",m:"按这个趋势发展下去，恐怕结局不会太好..."});

  return msgs;
}

const ENDINGS={bad:{title:"BAD ENDING",sub:"比CCF还糟糕",c:P.red,e:"💀",t:"你的协会在骂声中倒闭了。\"还不如让CCF继续圈钱呢。\"信息学竞赛再次陷入空白期。"},neutral:{title:"NEUTRAL ENDING",sub:"勉强及格",c:P.gold,e:"😐",t:"协会运营了下来，但评价褒贬不一。至少信息学竞赛没有消失。"},good:{title:"GOOD ENDING",sub:"超越CCF的传奇",c:P.grn,e:"🏆",t:"你成功打造了公平高质量的竞赛体系！人们称你为\"OI之父\"。"}};

const initG=()=>({month:0,year:2037,money:15000,ap:15,rep:15,jIdx:0,towers:{},bridges:[],setters:Array.from({length:3},mkS),market:Array.from({length:4},mkS),inspectors:[],inspMkt:Array.from({length:3},mkI),log:[],warnings:[],results:[],over:false,score:0,ending:"neutral"});

function Pill({c,children}){return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,background:`${c}15`,color:c,fontSize:10,fontWeight:600}}>{children}</span>}
const bS=(c,dis)=>({padding:"6px 14px",borderRadius:7,border:"none",cursor:dis?"not-allowed":"pointer",background:dis?P.mut:c,color:dis?P.dim:"#000",fontWeight:700,fontSize:11,fontFamily:"inherit",opacity:dis?.4:1,whiteSpace:"nowrap"});
const iSt={background:P.bg,color:P.txt,border:`1px solid ${P.bdr}`,borderRadius:6,padding:"6px 10px",fontSize:12,fontFamily:"inherit",width:80,textAlign:"center"};

export default function App(){
  const [scr,setScr]=useState("menu");
  const [g,setG]=useState(initG);
  const [tab,setTab]=useState("towers");
  const [selT,setSelT]=useState(null);
  const [fp,setFp]=useState(null);
  const [bf,setBf]=useState(null);
  const [pp,setPp]=useState(null);
  const u=useCallback(fn=>setG(p=>{const n={...p};fn(n);return n}),[]);
  const curMo=g.month%12,curYr=g.year+Math.floor(g.month/12);
  const judge=JUDGES[g.jIdx];
  const tids=Object.keys(g.towers);
  const dailyAP=useMemo(()=>3+Math.floor(g.rep/10)+Object.values(g.towers).reduce((s,t)=>s+Math.floor((t.floors||[]).length/2),0),[g.rep,g.towers]);
  const freeS=g.setters.filter(s=>s.used<s.cap);
  const jMnt=useMemo(()=>Math.round(judge.mnt*(1+Math.floor(g.month/12)*.05)),[judge.mnt,g.month]);
  const inspSal=useMemo(()=>(g.inspectors||[]).reduce((s,i)=>s+i.sal,0),[g.inspectors]);
  const inspBonus=useMemo(()=>{const i=g.inspectors||[];return{repM:i.reduce((s,x)=>s+x.ab*.08+x.dil*.05,0),compR:i.reduce((s,x)=>s+x.ab*.2,0),sal:inspSal}},[g.inspectors,inspSal]);
  const news=useMemo(()=>genNews(g),[g.month,g.rep,g.money,g.results,g.inspectors,g.jIdx]);

  const advance=useCallback(()=>{
    if(g.over)return;
    u(n=>{
      n.month++;const mo=n.month%12,yr=n.year+Math.floor(n.month/12);
      const ap=3+Math.floor(n.rep/10)+Object.values(n.towers).reduce((s,t)=>s+Math.floor((t.floors||[]).length/2),0);
      n.ap+=ap;
      const jAge=Math.floor(n.month/12);
      const jM=Math.round(JUDGES[n.jIdx].mnt*(1+jAge*.05));
      n.money-=jM;
      const iSal=(n.inspectors||[]).reduce((s,i)=>s+i.sal,0);
      n.money-=iSal;
      const iRep=(n.inspectors||[]).reduce((s,i)=>s+i.ab*.08+i.dil*.05,0);
      n.rep=+(n.rep+iRep).toFixed(1);
      if(n.rep>5)n.rep=Math.max(5,+(n.rep-.1).toFixed(1));
      if(n.money>30000)n.rep=Math.max(0,+(n.rep-((n.money-30000)/10000)*.3).toFixed(1));
      if(n.month%2===0){n.market=Array.from({length:R(3,6)},mkS);n.inspMkt=Array.from({length:R(2,4)},mkI)}

      // WARNINGS
      n.warnings=[];
      Object.entries(n.towers).forEach(([tid,tw])=>{
        if(tw.ranThisYear)return;
        const ml=((tw.schedMonth-mo)+12)%12;
        if(ml>0&&ml<=3){
          const st=cSt(tw);const pDone=(tw.problems||[]).filter(Boolean).length;
          const issues=[];
          if(pDone<st.totP)issues.push(`题目${pDone}/${st.totP}`);
          if(!tw.trained)issues.push("未培训");
          if(JUDGES[n.jIdx].pow<Math.ceil(tw.tier*1.2)+1)issues.push("算力不足");
          if(issues.length)n.warnings.push({tid,name:tw.name,ml,issues});
          if(ml<=1&&issues.length)n.log=[...n.log,{mo:n.month,yr,msg:`⚠️ ${tw.name}下月开赛未准备: ${issues.join(", ")}`}];
        }
      });

      // RUN
      Object.entries(n.towers).forEach(([tid,tw])=>{
        if(tw.schedMonth!==mo||tw.ranThisYear)return;
        const st=cSt(tw);const pDone=(tw.problems||[]).filter(Boolean).length;
        const jPow=JUDGES[n.jIdx].pow;const minPow=Math.ceil(tw.tier*1.2)+1;
        if(pDone<st.totP||!tw.trained||jPow<minPow){
          n.rep=Math.max(0,n.rep-6);tw.suspended=true;tw.ranThisYear=true;
          n.log=[...n.log,{mo:n.month,yr,msg:`💀 ${tw.name} 未准备好！声誉-6`}];return;
        }
        tw.suspended=false;const stats=cSt(tw);const jj=JUDGES[n.jIdx];
        const br=n.bridges.find(b=>b.to===tid);
        let base;
        if(tw.tier<=1)base=Math.round(40*Math.pow(1.045,n.rep)-stats.effD*3);
        else if(br){const fr=n.towers[br.from];const lp=fr?.lastResult?.part||Math.round(20*Math.pow(1.03,n.rep));base=Math.round(lp*br.pass);if(fr?.suspended)base=Math.round(base*.3)}
        else base=Math.round(15*Math.pow(1.035,n.rep)-stats.effD*2);
        const pe=br?cl(1-(br.price-50)/800,.3,1.3):cl(1-((tw.regPrice||50)-50)/800,.3,1.3);
        const part=Math.max(5,Math.round(base*pe*stats.partM*(1+((tw.sites||1)-1)*.15)));
        const regP=br?br.price:(tw.regPrice||50);
        const grossRev=Math.round(part*regP*.9*(1+jj.pow*.03))+stats.moneyB;

        // COSTS
        const costs=compRunCosts(tw,part);
        const netRev=grossRev-costs.total;
        n.money+=netRev;

        const probs=(tw.problems||[]).filter(Boolean);
        const avgQ=probs.reduce((s,p)=>s+p.qu,0)/stats.totP;
        const fp2=probs.map(p=>(p.verified&&p.tag&&Math.random()<.7)?{...p,tag:null}:p);
        const badTags=fp2.filter(p=>p.tag==="超纲"||p.tag==="冷门").length;
        const adHoc=fp2.filter(p=>p.tag==="Ad-Hoc").length;
        const hangCnt=Math.round(part*stats.hangR*stats.hangM*(stats.effD/5));
        const trainB=tw.trained==="high"?3:tw.trained==="mid"?1.5:0;
        const jRepB=jj.pow*.15;
        const iCB=(n.inspectors||[]).reduce((s,i)=>s+i.ab*.2,0);
        let repCh=+((avgQ-(tw.tier*1.2+2))*1.5+trainB+stats.repB+jRepB+iCB-badTags*2.5-adHoc*.8)*stats.repMul-(hangCnt>part*.2?2:0);
        repCh=+(repCh.toFixed(1));
        n.rep=Math.max(0,+((n.rep+repCh).toFixed(1)));

        const rTags=fp2.filter(p=>p.tag).map(p=>({idx:p.idx,tag:p.tag}));
        const result={part,rev:netRev,grossRev,costTotal:costs.total,avgQ:+(avgQ.toFixed(1)),hangCnt,repCh,tags:rTags};
        tw.lastResult=result;tw.ranThisYear=true;
        n.results=[...n.results,{tid,name:tw.name,yr,mo,...result}];
        n.setters=n.setters.map(s=>{const nA=s.asgn.filter(a=>a.cid!==tid);return{...s,asgn:nA,used:nA.length}});
        tw.problems=[];tw.trained=null;
        n.log=[...n.log,{mo:n.month,yr,msg:`🏆 ${tw.name}！${part}人|总收¥${grossRev}|成本¥${costs.total}|净收¥${netRev}|声誉${repCh>0?"+":""}${repCh}`}];
      });

      if(mo===0){Object.values(n.towers).forEach(tw=>{tw.ranThisYear=false;tw.suspended=false});n.log=[...n.log,{mo:n.month,yr,msg:`🎉 ${yr}赛季！`}]}
      n.log=[...n.log,{mo:n.month,yr,msg:`📅 ${yr}年${MO[mo]}|AP+${ap}|维护¥${jM}+特派¥${iSal}`}];
      if(n.money<-5000){n.rep=Math.max(0,n.rep-5);n.log=[...n.log,{mo:n.month,yr,msg:"💸 严重负债！"}]}
      if(n.month>=120){n.over=true;const e=calcEnd(n);n.ending=e.c>=.66?"good":e.c>=.33?"neutral":"bad";n.score=Math.round(e.c*1000)}
    });
  },[g.over,u]);

  const unlock=useCallback(def=>{const c=(def.tier+1)*4;if(g.ap<c)return;u(n=>{n.ap-=c;n.towers={...n.towers,[def.id]:{...def,floors:[],problems:[],trained:null,trainedSites:0,ranThisYear:false,suspended:false,lastResult:null,schedMonth:def.defMonth,regPrice:50,sites:1}}}); setSelT(def.id)},[g.ap,u]);
  const addFloor=useCallback((tid,fd)=>{const t=g.towers[tid];if(!t||g.ap<fd.ap||g.money<fd.cost)return;const cat=FCATS.find(c=>c.id===fd.cat);if(cat?.ex&&t.floors.some(f=>f.cat===fd.cat))return;if(!cat?.ex&&t.floors.some(f=>f.id===fd.id))return;u(n=>{n.ap-=fd.ap;n.money-=fd.cost;const tw={...n.towers[tid],floors:[...n.towers[tid].floors,{...fd,uid:uid()}]};n.towers={...n.towers,[tid]:tw}});setFp(null)},[g.towers,g.ap,g.money,u]);
  const rmFloor=useCallback((tid,fuid)=>u(n=>{const tw={...n.towers[tid]};tw.floors=tw.floors.filter(x=>x.uid!==fuid);n.towers={...n.towers,[tid]:tw}}),[u]);
  const updTw=useCallback((tid,ch)=>u(n=>{
    const old=n.towers[tid];
    const nw={...old,...ch};
    // if sites increased after training, need extra training
    if(ch.sites&&old.trained&&ch.sites>old.trainedSites){
      nw.trained=null;nw.trainedSites=0;
    }
    n.towers={...n.towers,[tid]:nw};
  }),[u]);

  const addBridge=useCallback((fr,to)=>{if(g.ap<3)return;u(n=>{n.ap-=3;n.bridges=[...n.bridges,{from:fr,to,price:80,pass:.5,id:uid()}]});setBf(null)},[g.ap,u]);
  const updBr=useCallback((id,ch)=>u(n=>{n.bridges=n.bridges.map(b=>b.id===id?{...b,...ch}:b)}),[u]);
  const hire=useCallback(s=>{if(g.money<s.cost)return;u(n=>{n.money-=s.cost;n.setters=[...n.setters,{...s,asgn:[],used:0}];n.market=n.market.filter(x=>x.id!==s.id)})},[g.money,u]);
  const hireI=useCallback(ins=>{if(g.money<ins.hire)return;u(n=>{n.money-=ins.hire;n.inspectors=[...(n.inspectors||[]),ins];n.inspMkt=(n.inspMkt||[]).filter(x=>x.id!==ins.id)})},[g.money,u]);
  const fireI=useCallback(id=>u(n=>{n.inspectors=(n.inspectors||[]).filter(x=>x.id!==id)}),[u]);
  const assignOne=useCallback((sid,tid,idx)=>{u(n=>{const s=n.setters.find(x=>x.id===sid);const tw=n.towers[tid];if(!s||!tw||s.used>=s.cap)return;const st=cSt(tw);const pD=cl(st.effD+R(-2,2),1,10);const qu=cl(s.qu+R(-2,2),1,10);const tag=Math.random()<.12?TAGS[R(0,2)]:null;const diff=cl(pD,1,s.sk);const probs=[...(tw.problems||[])];probs[idx]={setter:s.nm,sid:s.id,qu,diff,tag,idx,probDiff:pD,verified:false};s.used++;s.asgn=[...s.asgn,{cid:tid,pi:idx}];n.towers={...n.towers,[tid]:{...tw,problems:probs}}})},[u]);
  const unassign=useCallback((sid,tid,idx)=>u(n=>{const s=n.setters.find(x=>x.id===sid);if(!s)return;s.used=Math.max(0,s.used-1);s.asgn=s.asgn.filter(a=>!(a.cid===tid&&a.pi===idx));const tw=n.towers[tid];if(tw){const p=[...(tw.problems||[])];p[idx]=undefined;n.towers={...n.towers,[tid]:{...tw,problems:p}}}}),[u]);
  const autoAssign=useCallback(tid=>{u(n=>{const tw=n.towers[tid];if(!tw)return;const st=cSt(tw);for(let i=0;i<st.totP;i++){if((tw.problems||[])[i])continue;const free=n.setters.filter(s=>s.used<s.cap);if(!free.length)break;free.sort((a,b)=>b.qu-a.qu);const s=free[0];const pD=cl(st.effD+R(-2,2),1,10);const qu=cl(s.qu+R(-2,2),1,10);const tag=Math.random()<.12?TAGS[R(0,2)]:null;const probs=[...(tw.problems||[])];probs[i]={setter:s.nm,sid:s.id,qu,diff:cl(pD,1,s.sk),tag,idx:i,probDiff:pD,verified:false};s.used++;s.asgn=[...s.asgn,{cid:tid,pi:i}];tw.problems=probs}n.towers={...n.towers,[tid]:{...tw}}})},[u]);
  const verify=useCallback((tid,idx)=>{if(g.money<1000)return;u(n=>{n.money-=1000;const tw={...n.towers[tid]};const probs=[...(tw.problems||[])];if(probs[idx])probs[idx]={...probs[idx],verified:true};n.towers={...n.towers,[tid]:{...tw,problems:probs}}})},[g.money,u]);
  const trainC=useCallback((tid,q)=>{const tw=g.towers[tid];const sites=tw?.sites||1;const base={low:150,mid:400,high:800}[q];const c=trainCost(base,sites);if(g.money<c)return;u(n=>{n.money-=c;n.towers={...n.towers,[tid]:{...n.towers[tid],trained:q,trainedSites:sites}}})},[g.money,g.towers,u]);
  const upJ=useCallback(()=>{if(g.jIdx>=JUDGES.length-1)return;const nxt=JUDGES[g.jIdx+1];if(g.money<nxt.upg)return;u(n=>{n.money-=nxt.upg;n.jIdx++})},[g.jIdx,g.money,u]);
  const restart=()=>{setG(initG());setTab("towers");setSelT(null);setScr("menu")};

  /* ═══ MENU ═══ */
  if(scr==="menu")return(
    <div style={{fontFamily:"'Courier New',monospace",background:P.bg,color:P.txt,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:`repeating-linear-gradient(0deg,${P.acc} 0 1px,transparent 1px 50px),repeating-linear-gradient(90deg,${P.acc} 0 1px,transparent 1px 50px)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:640}}>
        <div style={{fontSize:11,letterSpacing:6,color:P.dim,marginBottom:16}}>EST. 2037 · POST-CCF ERA</div>
        <div style={{fontSize:48,fontWeight:900,letterSpacing:3,color:P.acc,lineHeight:1.1,marginBottom:4}}>OI协会</div>
        <div style={{fontSize:28,fontWeight:900,letterSpacing:6,color:P.white,marginBottom:20}}>模拟器</div>
        <div style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:12,padding:"20px 24px",marginBottom:28,textAlign:"left",fontSize:13,lineHeight:2,color:P.dim}}>
          <p style={{color:P.gold,fontWeight:700,marginBottom:4}}>📜 背景</p>
          <p><b style={{color:P.red}}>CCF (Coin-Collecting Foundation)</b> 因圈钱过多于2037年关闭。你获得了<b style={{color:P.gold}}>政府许可</b>开办竞赛。</p>
          <p style={{color:P.txt,fontWeight:600}}>三种结局等待着你。是成为传奇，还是重蹈覆辙？</p>
        </div>
        <button onClick={()=>{setG(initG());setScr("game");setTab("towers")}} style={{padding:"16px 56px",borderRadius:12,border:"none",background:P.acc,color:"#000",fontWeight:900,fontSize:18,cursor:"pointer",fontFamily:"inherit",letterSpacing:4}}>开始经营</button>
        <div style={{marginTop:16,fontSize:10,color:P.mut}}>10年·120月·10种比赛·6种评测机·特派员·新闻系统</div>
      </div>
    </div>
  );

  /* ═══ GAME OVER ═══ */
  if(g.over){const ed=ENDINGS[g.ending];const e=calcEnd(g);return(
    <div style={{fontFamily:"'Courier New',monospace",background:P.bg,color:P.txt,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
      <div style={{fontSize:72,marginBottom:8}}>{ed.e}</div>
      <div style={{fontSize:11,letterSpacing:6,color:P.dim,marginBottom:4}}>{ed.title}</div>
      <div style={{fontSize:28,fontWeight:900,color:ed.c,marginBottom:8}}>{ed.sub}</div>
      <div style={{maxWidth:480,fontSize:14,color:P.dim,lineHeight:1.8,marginBottom:20}}>{ed.t}</div>
      <div style={{fontSize:48,fontWeight:900,color:P.acc,marginBottom:16}}>{g.score}<span style={{fontSize:14,color:P.dim}}>/1000</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20,fontSize:12}}>
        {[[g.rep,P.gold,"声誉"],[`¥${g.money}`,P.grn,"资金"],[e.tp,P.acc,"总人次"],[g.results.length,P.purple,"场次"]].map(([v,c,l],i)=>(
          <div key={i} style={{padding:12,background:P.pnl,borderRadius:8,border:`1px solid ${P.bdr}`}}><div style={{color:c,fontSize:18,fontWeight:900}}>{v}</div><div style={{color:P.dim,fontSize:10}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:12}}><button onClick={()=>{setG(initG());setScr("game")}} style={bS(P.acc)}>再来</button><button onClick={()=>setScr("menu")} style={bS(P.dim)}>菜单</button></div>
    </div>
  )}

  /* ═══ MAP ═══ */
  const renderMap=()=>{
    if(!tids.length)return <div style={{color:P.mut,fontSize:12,padding:30,textAlign:"center"}}>建造地基开始！</div>;
    const TW=130,FH=18,PAD=20,GAP=32,BH=32;
    const pos={};let cx=PAD;
    tids.forEach(id=>{const t=g.towers[id];const h=BH+(t.floors||[]).length*FH+8;pos[id]={x:cx,w:TW,h,t};cx+=TW+GAP});
    const maxH=Math.max(200,...Object.values(pos).map(p=>p.h+55));
    return(<div style={{overflowX:"auto",paddingBottom:4}}>
      <svg width={Math.max(cx+PAD,280)} height={maxH+35} style={{display:"block"}}>
        <defs><linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.pnl2}/><stop offset="100%" stopColor={P.pnl}/></linearGradient></defs>
        {g.bridges.map(b=>{const pf=pos[b.from],pt=pos[b.to];if(!pf||!pt)return null;const y=maxH+3,x1=pf.x+pf.w/2,x2=pt.x+pt.w/2,mid=(x1+x2)/2,sag=Math.min(Math.abs(x2-x1)*.12,25),th=20;const segs=[];for(let i=0;i<=10;i++){const t=i/10;segs.push(`${i===0?"M":"L"}${x1+(x2-x1)*t},${y-th+4*sag*t*(1-t)}`)}const lc=(pf.t.suspended||pt.t.suspended)?P.red:P.acc;return(<g key={b.id}><line x1={x1} y1={y} x2={x2} y2={y} stroke={lc} strokeWidth={2.5} opacity={.7}/><path d={segs.join(" ")} fill="none" stroke={lc} strokeWidth={1.2} opacity={.5}/><line x1={x1} y1={y} x2={x1} y2={y-th} stroke={lc} strokeWidth={2}/><line x1={x2} y1={y} x2={x2} y2={y-th} stroke={lc} strokeWidth={2}/>{Array.from({length:5},(_,i)=>{const t=(i+1)/6;const cx2=x1+(x2-x1)*t;return <line key={i} x1={cx2} y1={y-th+4*sag*t*(1-t)} x2={cx2} y2={y} stroke={lc} strokeWidth={.6} opacity={.3}/>})}<rect x={mid-36} y={y+3} width={72} height={16} rx={3} fill={P.pnl} stroke={lc} strokeWidth={1} opacity={.9}/><text x={mid} y={y+14} textAnchor="middle" fill={lc} fontSize={8} fontWeight="600">¥{b.price}·{Math.round(b.pass*100)}%</text></g>)})}
        {tids.map(id=>{const p=pos[id],t=p.t,tc=TC[t.tier]||P.dim,bx=p.x,by=maxH-p.h,isSel=selT===id;const ml=((t.schedMonth-curMo)+12)%12;const urg=ml>0&&ml<=2&&!t.ranThisYear;const ep=estP(t,g.rep,g.bridges,g.towers);return(<g key={id} style={{cursor:"pointer"}} onClick={()=>{setSelT(selT===id?null:id);setPp(null)}}>
          {isSel&&<rect x={bx-3} y={by-3} width={p.w+6} height={p.h+6} rx={8} fill="none" stroke={P.acc} strokeWidth={2} opacity={.4}><animate attributeName="opacity" values=".2;.5;.2" dur="2s" repeatCount="indefinite"/></rect>}
          <rect x={bx} y={by} width={p.w} height={p.h} rx={4} fill="url(#tG)" stroke={isSel?P.acc:urg?P.orange:t.suspended?P.red:P.bdr} strokeWidth={isSel?2:1}/>
          {[0,1,2].map(i=><rect key={i} x={bx+2+i*44} y={by-5} width={38} height={7} fill={tc+"22"} rx={1}/>)}
          {[...(t.floors||[])].reverse().map((f,i)=>{const cc=FCATS.find(c=>c.id===f.cat)?.c||P.dim;const fy=by+6+i*FH;return(<g key={f.uid}><rect x={bx+4} y={fy} width={p.w-8} height={FH-2} rx={2} fill={`${cc}10`} stroke={`${cc}28`} strokeWidth={1}/><text x={bx+8} y={fy+12} fill={cc} fontSize={8} fontWeight="600">{f.icon}{f.name}</text></g>)})}
          <rect x={bx} y={by+p.h-BH+4} width={p.w} height={BH-4} fill={`${tc}10`}/><line x1={bx} y1={by+p.h-BH+4} x2={bx+p.w} y2={by+p.h-BH+4} stroke={tc} strokeWidth={1.5}/>
          <rect x={bx-1} y={by-24} width={p.w+2} height={19} rx={5} fill={t.suspended?`${P.red}20`:t.ranThisYear?`${P.grn}10`:P.pnl2} stroke={t.suspended?P.red:t.ranThisYear?P.grn:tc} strokeWidth={1}/>
          <text x={bx+p.w/2} y={by-11} textAnchor="middle" fill={t.suspended?P.red:t.ranThisYear?P.grn:tc} fontSize={9} fontWeight="800">{t.name}{t.ranThisYear?" ✅":""}{t.suspended?" ⛔":""}</text>
          <rect x={bx+p.w-32} y={by-38} width={34} height={12} rx={3} fill={urg?P.orange:P.pnl2} stroke={urg?P.orange:P.dim} strokeWidth={1}/><text x={bx+p.w-15} y={by-29} textAnchor="middle" fill={urg?"#fff":P.dim} fontSize={7} fontWeight="700">{MO[t.schedMonth]}</text>
          <rect x={bx} y={by-38} width={46} height={12} rx={3} fill={P.pnl2} stroke={P.blue+"40"} strokeWidth={1}/><text x={bx+23} y={by-29} textAnchor="middle" fill={P.blue} fontSize={7} fontWeight="600">≈{ep}人</text>
          {t.needsBoard&&<text x={bx+p.w/2} y={by+p.h-BH-2} textAnchor="middle" fill={P.orange} fontSize={7}>🏨住宿</text>}
        </g>)})}
      </svg>
    </div>);
  };

  /* ── DETAIL ── */
  const renderDetail=()=>{
    if(!selT||!g.towers[selT])return null;
    const t=g.towers[selT],st=cSt(t),tc=TC[t.tier]||P.dim;
    const pDone=(t.problems||[]).filter(Boolean).length;
    const jPow=judge.pow,minPow=Math.ceil(t.tier*1.2)+1;
    const ml=((t.schedMonth-curMo)+12)%12||12;
    const ep=estP(t,g.rep,g.bridges,g.towers);
    const sites=t.sites||1;
    const tCL=trainCost(150,sites),tCM=trainCost(400,sites),tCH=trainCost(800,sites);
    const costs=compRunCosts(t,ep);
    // check if sites changed after training
    const needRetrain=t.trained&&sites>(t.trainedSites||0);
    return(
      <div style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:12,padding:16,marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:6}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:tc}}>{t.name} <span style={{fontSize:11,color:P.dim,fontWeight:400}}>T{t.tier}·{(t.floors||[]).length}层</span></div>
            <div style={{fontSize:11,color:P.dim,marginTop:2}}>开赛<b style={{color:ml<=2&&!t.ranThisYear?P.red:P.gold}}>{MO[t.schedMonth]}</b>{!t.ranThisYear&&<span>·<b style={{color:ml<=2?P.red:P.acc}}>{ml}</b>月后</span>}{t.ranThisYear&&<span style={{color:P.grn}}>·已完赛</span>}</div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {!t.ranThisYear&&<button onClick={()=>setFp(selT)} style={bS(P.acc)}>+楼层</button>}
            {!t.ranThisYear&&<button onClick={()=>setPp(pp===selT?null:selT)} style={bS(P.purple)}>📝({pDone}/{st.totP})</button>}
            {!t.ranThisYear&&pDone<st.totP&&freeS.length>0&&<button onClick={()=>autoAssign(selT)} style={bS(P.blue)}>🤖自动</button>}
          </div>
        </div>
        {!t.ranThisYear&&(<div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
          <label style={{fontSize:11,color:P.dim,display:"flex",alignItems:"center",gap:4}}>📅<select value={t.schedMonth} onChange={e=>updTw(selT,{schedMonth:+e.target.value})} style={{...iSt,width:65}}>{MO.map((m,i)=><option key={i} value={i}>{m}</option>)}</select></label>
          <label style={{fontSize:11,color:P.dim,display:"flex",alignItems:"center",gap:4}}>💰报名<input type="number" value={t.regPrice||50} onChange={e=>updTw(selT,{regPrice:cl(+e.target.value,0,9999)})} style={{...iSt,width:70}}/></label>
          <label style={{fontSize:11,color:P.dim,display:"flex",alignItems:"center",gap:4}}>🏫考点<input type="number" value={sites} min={1} max={50} onChange={e=>updTw(selT,{sites:cl(+e.target.value,1,50)})} style={{...iSt,width:55}}/></label>
        </div>)}
        {/* training */}
        {!t.ranThisYear&&(!t.trained||needRetrain)&&(
          <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:11,color:needRetrain?P.orange:P.dim}}>🎓{needRetrain?"考点增加需重新培训":"培训"}({sites}考点):</span>
            <button onClick={()=>trainC(selT,"low")} style={bS("#6ee7b7",g.money<tCL)}>基础¥{tCL}</button>
            <button onClick={()=>trainC(selT,"mid")} style={bS("#fbbf24",g.money<tCM)}>标准¥{tCM}</button>
            <button onClick={()=>trainC(selT,"high")} style={bS(P.pink,g.money<tCH)}>高级¥{tCH}</button>
          </div>
        )}
        {/* stats */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
          <Pill c={P.acc}>难度{st.effD}</Pill><Pill c={P.blue}>≈{ep}人</Pill><Pill c={P.purple}>挂分{(st.hangR*100).toFixed(0)}%</Pill><Pill c={P.orange}>考点{sites}</Pill>
          {t.trained&&!needRetrain&&<Pill c={P.grn}>培训{t.trained==="high"?"高级":t.trained==="mid"?"标准":"基础"}✅</Pill>}
          {needRetrain&&<Pill c={P.orange}>需重培训!</Pill>}
          {jPow>=minPow?<Pill c={P.grn}>算力✅</Pill>:<Pill c={P.red}>算力❌</Pill>}
          {t.needsBoard&&<Pill c={P.orange}>住宿+餐饮</Pill>}
        </div>
        {/* cost estimate */}
        <div style={{background:P.bg2,borderRadius:8,padding:10,fontSize:11,marginBottom:8}}>
          <div style={{fontWeight:700,marginBottom:4,color:P.dim}}>💸 预估比赛成本 (基于≈{ep}人)</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",color:P.dim}}>
            <span>监考<b style={{color:P.txt}}>¥{costs.proctoring}</b></span>
            <span>场地<b style={{color:P.txt}}>¥{costs.venueRent}</b></span>
            <span>志愿者<b style={{color:P.txt}}>¥{costs.volunteers}</b></span>
            <span>安保医疗<b style={{color:P.txt}}>¥{costs.security}</b></span>
            {t.needsBoard&&<span>住宿餐饮<b style={{color:P.orange}}>¥{costs.board}</b></span>}
            <span style={{color:P.red,fontWeight:700}}>合计¥{costs.total}</span>
          </div>
        </div>
        {/* last result */}
        {t.lastResult&&(
          <div style={{background:P.bg2,borderRadius:8,padding:10,fontSize:11,marginBottom:8}}>
            <div style={{fontWeight:700,marginBottom:4,color:P.gold}}>📊 上次</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <span>参赛<b style={{color:P.acc}}>{t.lastResult.part}</b></span>
              <span>总收<b style={{color:P.grn}}>¥{t.lastResult.grossRev}</b></span>
              <span>成本<b style={{color:P.red}}>¥{t.lastResult.costTotal}</b></span>
              <span>净收<b style={{color:t.lastResult.rev>=0?P.grn:P.red}}>¥{t.lastResult.rev}</b></span>
              <span>声誉<b style={{color:t.lastResult.repCh>=0?P.grn:P.red}}>{t.lastResult.repCh>0?"+":""}{t.lastResult.repCh}</b></span>
            </div>
            {t.lastResult.tags?.length>0&&<div style={{marginTop:4}}><span style={{color:P.red}}>⚠️ </span>{t.lastResult.tags.map((tg,i)=><Pill key={i} c={P.red}>#{tg.idx+1}{tg.tag}</Pill>)}</div>}
          </div>
        )}
        {/* problems */}
        {pp===selT&&!t.ranThisYear&&(
          <div style={{marginTop:6,background:P.bg2,borderRadius:8,padding:10}}>
            <div style={{fontWeight:700,marginBottom:6,fontSize:12}}>📝 题目</div>
            {Array.from({length:st.totP},(_,i)=>{const prob=(t.problems||[])[i];return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 0",borderBottom:`1px solid ${P.bdr}12`,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,minWidth:24,color:P.dim,fontSize:11}}>#{i+1}</span>
                {prob?(<>
                  <span style={{color:P.acc,fontWeight:600,fontSize:10}}>{prob.setter}</span>
                  <Pill c={prob.qu>=7?P.grn:prob.qu>=4?P.gold:P.red}>q{prob.qu}</Pill>
                  <Pill c={P.blue}>d{prob.diff}</Pill>
                  {prob.verified?<Pill c={P.grn}>验✅</Pill>:<button onClick={()=>verify(selT,i)} style={bS(P.orange,g.money<1000)}>🔍¥1000</button>}
                  <button onClick={()=>unassign(prob.sid,selT,i)} style={bS(P.red)}>✕</button>
                </>):(<select style={{...iSt,width:"auto",minWidth:180,textAlign:"left"}} value="" onChange={e=>e.target.value&&assignOne(e.target.value,selT,i)}><option value="">选择出题人...</option>{freeS.map(s=><option key={s.id} value={s.id}>{s.nm}(lv{s.sk}/q{s.qu})剩{s.cap-s.used}</option>)}</select>)}
              </div>
            )})}
          </div>
        )}
      </div>
    );
  };

  /* ── FLOOR PICKER ── */
  const renderFP=()=>{
    if(!fp||!g.towers[fp])return null;const t=g.towers[fp];const eids=(t.floors||[]).map(f=>f.id);
    return(<div style={{position:"fixed",inset:0,background:"#000b",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setFp(null)}>
      <div style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:14,padding:20,maxWidth:700,width:"100%",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><span style={{fontSize:15,fontWeight:800,color:P.acc}}>为{t.name}添加楼层</span><button onClick={()=>setFp(null)} style={bS(P.red)}>✕</button></div>
        {FCATS.map(cat=>{const floors=FLOORS.filter(f=>f.cat===cat.id);const hasCat=(t.floors||[]).some(f=>f.cat===cat.id);return(<div key={cat.id} style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:cat.c,marginBottom:6}}>{cat.name}{cat.ex&&hasCat&&<span style={{fontSize:10,color:P.mut}}>(互斥)</span>}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:6}}>{floors.map(f=>{const dis=eids.includes(f.id)||(cat.ex&&hasCat)||g.ap<f.ap||g.money<f.cost;return(<div key={f.id} onClick={()=>!dis&&addFloor(fp,f)} style={{padding:8,borderRadius:8,background:dis?P.bg:`${cat.c}06`,border:`1px solid ${dis?P.mut:cat.c}30`,cursor:dis?"not-allowed":"pointer",opacity:dis?.3:1}}><div style={{fontWeight:700,fontSize:11,marginBottom:2}}>{f.icon}{f.name}</div><div style={{fontSize:10,color:P.dim,marginBottom:2}}>{f.desc}</div><div style={{fontSize:10,color:cat.c}}>{f.ap>0&&`AP${f.ap} `}{f.cost>0&&`¥${f.cost}`}{!f.ap&&!f.cost&&"免费"}</div></div>)})}</div></div>)})}
      </div>
    </div>);
  };

  /* ═══ RENDER ═══ */
  const tabs=[{id:"towers",l:"🏗塔"},{id:"bridges",l:"🌉桥"},{id:"setters",l:"👤出题"},{id:"insp",l:"🕵️特派"},{id:"judge",l:"⚙️评测"},{id:"news",l:"📰新闻"},{id:"hist",l:"📊历史"},{id:"log",l:"📜日志"}];
  return(
    <div style={{fontFamily:"'Courier New','Fira Code',monospace",background:P.bg,color:P.txt,minHeight:"100vh",fontSize:13,lineHeight:1.5}}>
      {renderFP()}
      <div style={{background:`linear-gradient(135deg,${P.pnl},#101528)`,borderBottom:`1px solid ${P.bdr}`,padding:"7px 16px",position:"sticky",top:0,zIndex:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,fontWeight:900,color:P.acc,cursor:"pointer",letterSpacing:1}} onClick={()=>setScr("menu")}>OI协会</span>
            <span style={{fontSize:12}}><b style={{color:P.gold,fontSize:14}}>{curYr}</b><span style={{color:P.dim}}>年</span><b style={{color:P.acc,fontSize:14,marginLeft:3}}>{MO[curMo]}</b></span>
          </div>
          <div style={{display:"flex",gap:3}}>
            <button onClick={advance} style={bS(P.acc)}>+1月</button>
            <button onClick={()=>{for(let i=0;i<3;i++)advance()}} style={bS(P.blue)}>+3</button>
            <button onClick={()=>{for(let i=0;i<12;i++)advance()}} style={bS(P.purple)}>+1年</button>
            <button onClick={restart} style={bS(P.red)}>🏠</button>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:4}}>
          <div style={{flex:1}}><div style={{fontSize:8,color:P.dim}}>赛季</div><div style={{height:3,background:P.mut,borderRadius:2}}><div style={{height:"100%",width:`${(curMo/12)*100}%`,background:P.acc,borderRadius:2}}/></div></div>
          <div style={{flex:1}}><div style={{fontSize:8,color:P.dim}}>总{g.month}/120</div><div style={{height:3,background:P.mut,borderRadius:2}}><div style={{height:"100%",width:`${(g.month/120)*100}%`,background:P.gold,borderRadius:2}}/></div></div>
        </div>
      </div>
      {g.warnings.length>0&&<div style={{background:`${P.orange}12`,borderBottom:`1px solid ${P.orange}30`,padding:"6px 16px"}}>{g.warnings.map((w,i)=><div key={i} style={{fontSize:11,color:P.orange,padding:"1px 0"}}>⚠️<b>{w.name}</b>{w.ml}月后:{w.issues.join(",")}<button onClick={()=>{setTab("towers");setSelT(w.tid)}} style={{...bS(P.orange),padding:"1px 6px",fontSize:9,marginLeft:6}}>→</button></div>)}</div>}
      <div style={{display:"flex",gap:6,padding:"5px 16px",background:P.pnl,borderBottom:`1px solid ${P.bdr}`,flexWrap:"wrap"}}>
        {[["💰",`¥${g.money}`,P.gold],["⚡",`${g.ap}(+${dailyAP})`,P.acc],["⭐",String(g.rep),P.pink],["🖥️",`${judge.name}`,P.purple],["🕵️",`${(g.inspectors||[]).length}`,P.blue]].map(([i,v,c],idx)=>(
          <div key={idx} style={{padding:"2px 8px",borderRadius:5,background:`${c}0c`,border:`1px solid ${c}15`,display:"flex",alignItems:"center",gap:4,fontSize:11}}><span style={{fontSize:10}}>{i}</span><b style={{color:c}}>{v}</b></div>
        ))}
        <div style={{padding:"2px 8px",borderRadius:5,background:`${P.red}0c`,border:`1px solid ${P.red}15`,fontSize:11,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10}}>📤</span><span style={{color:P.red}}>月支¥{jMnt+inspSal}</span></div>
      </div>
      <div style={{display:"flex",gap:1,padding:"3px 16px",background:P.bg,borderBottom:`1px solid ${P.bdr}`,overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 10px",borderRadius:"6px 6px 0 0",border:tab===t.id?`1px solid ${P.bdr}`:"1px solid transparent",borderBottom:tab===t.id?`1px solid ${P.pnl}`:"none",background:tab===t.id?P.pnl:"transparent",color:tab===t.id?P.acc:P.dim,fontWeight:tab===t.id?700:400,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{t.l}</button>)}
      </div>
      <div style={{padding:14,maxWidth:1200,margin:"0 auto"}}>
        {tab==="towers"&&(<>
          {COMPS.filter(d=>!g.towers[d.id]).length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:P.dim,marginBottom:4}}>🔒 可建造</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{COMPS.filter(d=>!g.towers[d.id]).map(d=>{const c=(d.tier+1)*4;return <button key={d.id} onClick={()=>unlock(d)} style={bS(TC[d.tier]||P.dim,g.ap<c)}>{d.name}({c}AP)</button>})}</div></div>}
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:4}}>🏗 {curYr}赛季</div>
          {renderMap()}{renderDetail()}
        </>)}
        {tab==="bridges"&&(<>
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:10}}>🌉 桥梁</div>
          {bf?(<div style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:10,padding:12,marginBottom:12}}><div style={{marginBottom:6}}>从<b style={{color:P.acc}}>{g.towers[bf]?.name}</b>→</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tids.filter(id=>id!==bf&&!g.bridges.some(b=>b.from===bf&&b.to===id)).map(id=><button key={id} onClick={()=>addBridge(bf,id)} style={bS(TC[g.towers[id].tier]||P.dim)}>{g.towers[id].name}</button>)}<button onClick={()=>setBf(null)} style={bS(P.red)}>取消</button></div></div>):(<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}><span style={{fontSize:11,color:P.dim}}>起点:</span>{tids.map(id=><button key={id} onClick={()=>setBf(id)} style={bS(TC[g.towers[id].tier]||P.dim,g.ap<3)}>{g.towers[id].name}</button>)}<span style={{fontSize:9,color:P.mut}}>(3AP)</span></div>)}
          {g.bridges.length>0?<div style={{display:"grid",gap:8}}>{g.bridges.map(b=>{const toTw=g.towers[b.to];const ep=toTw?estP(toTw,g.rep,g.bridges,g.towers):"?";return(<div key={b.id} style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:10,padding:14}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><b style={{color:P.acc,fontSize:13}}>{g.towers[b.from]?.name}</b><span style={{color:P.dim,fontSize:16}}>→</span><b style={{color:P.gold,fontSize:13}}>{g.towers[b.to]?.name}</b><Pill c={P.blue}>≈{ep}人</Pill></div><div style={{display:"flex",gap:20,flexWrap:"wrap"}}><label style={{fontSize:11,color:P.dim,display:"flex",alignItems:"center",gap:6}}>💰报名<input type="number" value={b.price} style={iSt} onChange={e=>updBr(b.id,{price:cl(+e.target.value,0,9999)})}/></label><label style={{fontSize:11,color:P.dim,display:"flex",alignItems:"center",gap:6}}>📊通过率<input type="number" value={Math.round(b.pass*100)} style={iSt} onChange={e=>updBr(b.id,{pass:cl(+e.target.value,1,100)/100})}/>%</label></div></div>)})}</div>:<div style={{color:P.mut,fontSize:11}}>桥梁连接两塔。</div>}
        </>)}
        {tab==="setters"&&(<>
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:6}}>👤 出题人({g.setters.length})</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:14}}>
            {g.setters.map(s=><div key={s.id} style={{padding:10,borderRadius:8,background:P.pnl,border:`1px solid ${s.used>0?P.acc+"30":P.bdr}`}}><div style={{fontWeight:700,fontSize:12,marginBottom:2}}>{s.nm}</div><div style={{fontSize:10,color:P.dim}}>lv<b style={{color:P.acc}}>{s.sk}</b>·q<b style={{color:P.gold}}>{s.qu}</b>·<b style={{color:s.used>=s.cap?P.red:P.grn}}>{s.used}/{s.cap}</b></div>{s.asgn.length>0&&<div style={{fontSize:9,color:P.grn,marginTop:2}}>{s.asgn.map((a,i)=><span key={i}>→{g.towers[a.cid]?.name}#{a.pi+1} </span>)}</div>}</div>)}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:P.gold,marginBottom:6}}>📋 市场</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6}}>
            {g.market.map(s=><div key={s.id} style={{padding:10,borderRadius:8,background:P.pnl,border:`1px solid ${P.bdr}`}}><div style={{fontWeight:700,fontSize:12,marginBottom:2}}>{s.nm}</div><div style={{fontSize:10,color:P.dim,marginBottom:4}}>lv{s.sk}·q{s.qu}·容量{s.cap}</div><button onClick={()=>hire(s)} style={bS(P.grn,g.money<s.cost)}>¥{s.cost}</button></div>)}
          </div>
        </>)}
        {tab==="insp"&&(<>
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:4}}>🕵️ 特派员</div>
          <div style={{fontSize:10,color:P.dim,marginBottom:10,display:"flex",gap:6,flexWrap:"wrap"}}><Pill c={P.grn}>月声誉+{inspBonus.repM.toFixed(2)}</Pill><Pill c={P.blue}>赛后+{inspBonus.compR.toFixed(1)}</Pill><Pill c={P.red}>月薪¥{inspBonus.sal}</Pill></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:8,marginBottom:14}}>
            {(g.inspectors||[]).map(ins=>(
              <div key={ins.id} style={{padding:12,borderRadius:10,background:P.pnl,border:`1px solid ${P.acc}30`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><b style={{fontSize:13}}>{ins.nm}</b><button onClick={()=>fireI(ins.id)} style={bS(P.red)}>解雇</button></div>
                <div style={{fontSize:10,color:P.dim,marginBottom:4}}>{ins.title}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Pill c={P.acc}>能力{ins.ab}</Pill><Pill c={P.gold}>尽职{ins.dil}</Pill><Pill c={P.red}>月薪¥{ins.sal}</Pill></div>
              </div>
            ))}
            {!(g.inspectors||[]).length&&<div style={{color:P.mut,fontSize:11,padding:16}}>无特派员</div>}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:P.gold,marginBottom:6}}>可招募</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:8}}>
            {(g.inspMkt||[]).map(ins=>(
              <div key={ins.id} style={{padding:12,borderRadius:10,background:P.pnl,border:`1px solid ${P.bdr}`}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{ins.nm}</div>
                <div style={{fontSize:10,color:P.dim,marginBottom:6}}>{ins.title}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}><Pill c={P.acc}>能力{ins.ab}</Pill><Pill c={P.gold}>尽职{ins.dil}</Pill><Pill c={P.red}>月薪¥{ins.sal}</Pill></div>
                <button onClick={()=>hireI(ins)} style={bS(P.grn,g.money<ins.hire)}>雇佣¥{ins.hire}</button>
              </div>
            ))}
          </div>
        </>)}
        {tab==="judge"&&(<>
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:4}}>⚙️ 评测机</div>
          <div style={{fontSize:10,color:P.dim,marginBottom:10}}>维护费年增5%。当前<b style={{color:P.red}}>¥{jMnt}/月</b></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:8}}>
            {JUDGES.map((j,i)=>{const cur=i===g.jIdx,lk=i>g.jIdx+1,isN=i===g.jIdx+1;return(
              <div key={j.id} style={{padding:12,borderRadius:10,background:cur?`${P.acc}0c`:P.pnl,border:`2px solid ${cur?P.acc:isN?P.gold+"60":P.bdr}`,opacity:lk?.3:1,position:"relative"}}>
                {cur&&<div style={{position:"absolute",top:6,right:8,background:P.acc,color:"#000",padding:"1px 6px",borderRadius:4,fontSize:8,fontWeight:800}}>当前</div>}
                <div style={{fontSize:24,marginBottom:2}}>{j.e}</div>
                <div style={{fontWeight:800,fontSize:13,color:cur?P.acc:P.txt}}>{j.name}</div>
                <div style={{fontSize:10,color:P.blue,marginBottom:4}}>{j.mdl}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}><Pill c={P.blue}>算力{j.pow}</Pill><Pill c={P.red}>¥{j.mnt}/月</Pill><Pill c={P.grn}>+{j.pow*3}%收益</Pill></div>
                <div style={{fontSize:9,color:P.dim,marginBottom:4}}>可运行:{COMPS.filter(c=>j.pow>=Math.ceil(c.tier*1.2)+1).map(c=>c.name).join(",")|| "无"}</div>
                {isN&&<button onClick={upJ} style={bS(P.gold,g.money<j.upg)}>升级¥{j.upg}</button>}
              </div>
            )})}
          </div>
        </>)}
        {/* NEWS */}
        {tab==="news"&&(<>
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:10}}>📰 新闻频道 · {curYr}年{MO[curMo]}</div>
          <div style={{display:"grid",gap:8}}>
            {news.map((n,i)=>(
              <div key={i} style={{background:P.pnl,border:`1px solid ${n.c}20`,borderRadius:10,padding:14,borderLeft:`4px solid ${n.c}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:18}}>{n.icon}</span>
                  <span style={{fontWeight:700,fontSize:12,color:n.c}}>{n.t}</span>
                </div>
                <div style={{fontSize:13,color:P.txt,lineHeight:1.7}}>{n.m}</div>
              </div>
            ))}
            {news.length===0&&<div style={{color:P.mut,fontSize:12,padding:20}}>暂无新闻</div>}
          </div>
        </>)}
        {tab==="hist"&&(<>
          <div style={{fontSize:11,fontWeight:700,color:P.acc,marginBottom:8}}>📊 历史</div>
          {g.results.length===0?<div style={{color:P.mut}}>无记录</div>:<div style={{display:"grid",gap:6}}>{[...g.results].reverse().map((r,i)=><div key={i} style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:8,padding:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><b style={{color:TC[g.towers[r.tid]?.tier||0]||P.dim,fontSize:12}}>{r.name}</b><span style={{fontSize:10,color:P.dim}}>{r.yr}年{MO[r.mo%12]}</span></div><div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:11}}><span>{r.part}人</span><span style={{color:P.grn}}>总¥{r.grossRev}</span><span style={{color:P.red}}>费¥{r.costTotal}</span><span style={{color:r.rev>=0?P.grn:P.red}}>净¥{r.rev}</span><span style={{color:r.repCh>=0?P.grn:P.red}}>誉{r.repCh>0?"+":""}{r.repCh}</span></div>{r.tags?.length>0&&<div style={{marginTop:3}}>{r.tags.map((tg,j)=><Pill key={j} c={P.red}>#{tg.idx+1}{tg.tag}</Pill>)}</div>}</div>)}</div>}
        </>)}
        {tab==="log"&&<div style={{background:P.pnl,border:`1px solid ${P.bdr}`,borderRadius:10,padding:10,maxHeight:500,overflowY:"auto"}}>{[...g.log].reverse().map((l,i)=><div key={i} style={{padding:"2px 0",borderBottom:`1px solid ${P.bdr}10`,fontSize:11}}><span style={{color:P.mut,marginRight:4}}>[{l.yr}·{MO[(l.mo||0)%12]}]</span>{l.msg}</div>)}</div>}
      </div>
    </div>
  );
}