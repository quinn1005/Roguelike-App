'use strict';
// Last Stop Diner game data: classes, walk-ins, enemies, gear, ingredients, junk, parts, takeout.

const RARITY=[
  {id:0,name:'Common',col:'#c9c2d6',w:62,mult:1},
  {id:1,name:'Uncommon',col:'#6fe08a',w:25,mult:1.3},
  {id:2,name:'Rare',col:'#5fb8ff',w:9,mult:1.7},
  {id:3,name:'Epic',col:'#c88aff',w:3.2,mult:2.2},
  {id:4,name:'Legendary',col:'#ffb43a',w:.8,mult:3},
];
function rollRarity(floor,bonus=0){const shift=Math.min(.6,floor*.012)+bonus;return weighted(RARITY,r=>r.w*Math.pow(1+shift*3,r.id))}

// ---------------------------------------------------------------- classes
const CLASSES={
  brawler:{name:'Line Brawler',role:'Tank',hp:62,atk:9,def:6,spd:9,crit:5,range:'melee',school:'Chrome',
    sig:'Grease Slick',sigDesc:'Hits hard, taunts enemies for 2 turns and slows the target.',col:'#e0563a'},
  pyro:{name:'Pyro Punk',role:'Fire damage',hp:38,atk:11,def:2,spd:10,crit:5,range:'ranged',school:'Pyre',
    sig:'Ghost Pepper Breath',sigDesc:'Breathes fire on every enemy and sets them burning.',col:'#ff8a2a'},
  witch:{name:'Hedge Witch',role:'Healer',hp:40,atk:6,def:3,spd:11,crit:4,range:'ranged',school:'Brew',
    sig:'Warm Cuppa',sigDesc:'Heals the whole party and clears bad effects.',col:'#6fe08a'},
  owl:{name:'Night Owl',role:'Fast crits',hp:36,atk:9,def:2,spd:15,crit:20,range:'melee',school:'Void',
    sig:'Double Shot',sigDesc:'Strikes twice with extra crit chance.',col:'#b48cff'},
  drifter:{name:'Drifter',role:'All-rounder',hp:46,atk:8,def:4,spd:11,crit:8,range:'melee',school:'Hex',
    sig:'Hustle',sigDesc:'Copies a random ally\'s signature move at 70% power.',col:'#c9c2d6'},
};
const CLASS_IDS=Object.keys(CLASSES);

const TRAITS={
  main:{name:'Main Character Energy',desc:'+20% stats. Insists on the front row.'},
  milkshake:{name:'Hold My Milkshake',desc:'Double damage, but sometimes drops a takeout.'},
  tipper:{name:'Big Tipper',desc:'+25% tips from kills.'},
  headout:{name:'Ight Imma Head Out',desc:'Leaves the fight below 25% HP (safely).'},
  clumsy:{name:'Clumsy',desc:'10% miss, 10% double hit.'},
  online:{name:'Chronically Online',desc:'+25% damage. Narrates everything.'},
  built:{name:'Lowkey Built Different',desc:'One random stat is doubled.'},
  tnc:{name:'Terms & Conditions Apply',desc:'+30% stats, but stops to read an ArcDyne ad sometimes.'},
  forager:{name:'Forager',desc:'More ingredient drops.'},
  critic:{name:'Food Critic',desc:'Ingredients found are rarer. Complains constantly.'},
};
const TRAIT_IDS=Object.keys(TRAITS);

const FIRST=['Kevin','Brenda','Tyler','Gary','Doug','Karen-but-nice','Steve','Linda','Chad','Becky','Darnell','Priya','Moe','Gwen','Barry','Trish','Lou Jr.','Dale','Fern','Ricky','Marge','Sven','Yuki','Ozzy','Peggy','Hank','Nadia','Rex','Bea','Vince','Dottie','Jojo','Wendell','Tamsin','Ike','Ruthie','Percival','Skylar','Bubba','Mildred','Zed','Clementine','Gus','Ash','Nana Flo'];
const LAST=['the Unready','Two-Shoes','McGriddle','Von Snack','Pottsworth','the Third','Quickfry','Moonbeam','Crumb','Thunderbottom','Lightly-Salted','of Accounting','Dingleberry','Spellsworth','Noodleman','Grimsby','Sparkle','Bonesaw','Wetsock','the Mid'];
const JOBS=['Dentist','ArcDyne intern','Unpaid Pitnet influencer','Tram driver','Crypto wizard','Substitute teacher','Mall cop','Barista (cursed)','Retired bard','Rune plumber','Spellphone repair guy','Wedding DJ','HOA president','Dog walker (dragons)','Life coach','Part-time necromancer','Middle manager','Gym receptionist','Philosophy major','Sandwich artist','Professional line-stander','Exorcist (freelance)','Accountant','Street magician','Lost tourist','Podcast host','Fortune teller (wrong a lot)','Night-shift janitor','Escape room actor','Food truck owner'];
const BIOS=['Wants to be a wizard. Has been one for 20 minutes.','Here for the free mint.','Thought this was a speed-dating event.','Brought a stapler, just in case.','Says they are "in crypto."','Has never lost a fight. Has never been in a fight.','Mom said it was their turn on the pit.','Doing this for the content.','Owes ArcDyne 4,000 tips.','Allergic to the pit. Going anyway.','Just finished a 12-hour shift. Vibing.','Claims to know a shortcut. Does not.','Read one book about dungeons. Skimmed it.','Is only here because the bus broke down.','Wants to find their ex\'s ring down there.','Has a podcast about this. Recording now.','Will not stop talking about their sourdough.','Sigma grindset. Woke up at 3am for this.','Just wants to touch grass. Wrong place.','Pretty sure this is a job interview.','Their horoscope said "descend."','Here ironically.','Main character of their own story. Allegedly.','Has 14 tabs open in their head right now.'];
let walkinCount=0;
function makeWalkin(level=1,forceClass){
  const cls=forceClass||weighted(CLASS_IDS,c=>c==='drifter'?1.4:1);const C=CLASSES[cls];
  const traits=[];const nt=Math.random()<.45?(Math.random()<.3?2:1):0;while(traits.length<nt){const t=pick(TRAIT_IDS);if(!traits.includes(t))traits.push(t)}
  const look={skin:pick(['#f2c6a0','#e8a87c','#c98a5e','#9a6440','#6b4128','#b8d8a0','#a8b8f0']),hair:pick(['#2a1e1a','#5a3828','#c8a050','#e8e0d0','#d04a3a','#39ff9c','#ff5aa8','#5ff2ff','#7a4ad0','#1d1526']),
    style:pick(['short','long','bun','mohawk','bald','pony','afro','spiky']),top:pick(['#d9443a','#3d6ad0','#4f9160','#e0a030','#8a4ad0','#2a2a3a','#e6e0d0','#d05a9a','#3aa0a0']),
    pants:pick(['#3d4c80','#2a2a3a','#5a4030','#4a5a3a','#6a3a5a']),w:R(.9,1.12),h:R(.92,1.08)};
  const u={id:uid(),cls,name:`${pick(FIRST)} ${Math.random()<.35?pick(LAST):''}`.trim(),job:pick(JOBS),bio:pick(BIOS),traits,look,level,
    gear:{weapon:null,hat:null,armor:null,trinket:null},row:CLASSES[cls].range==='melee'?'front':'back',bstat:Math.random()<1?pick(['hp','atk','def','spd']):null};
  walkinCount++;return u}

// ---------------------------------------------------------------- enemies (The Gutter)
const ENEMIES={
  rat:{name:'Pipe Rat',hp:18,atk:5,def:1,spd:14,crit:5,part:'rattail',size:'s',lines:['squeak (derogatory)','*chews on a cable*','RENT IS DUE','ratatouille? never heard of her']},
  tumble:{name:'Tumbleweed NPC',hp:34,atk:4,def:5,spd:7,crit:0,part:'twig',size:'m',lines:['Nice weather.','I used to be an adventurer like you.','Nice weather.']},
  tourist:{name:'Lost Tourist',hp:26,atk:4,def:2,spd:9,crit:0,part:'map',size:'m',ab:'wifi',lines:['Excuse me, what is the wifi password?','Is this the way to the gift shop?','Can you take our picture?','My phone is at 2%']},
  slime:{name:'Sewer Slime',hp:30,atk:6,def:3,spd:8,crit:0,part:'glob',size:'m',ab:'sticky',lines:['*wobbles aggressively*','blorp.','I am not a mistake. I am a lifestyle.']},
  wisp:{name:'Mana Leak',hp:20,atk:8,def:1,spd:11,crit:5,part:'essence',size:'s',ranged:true,minFloor:3,lines:['*hisses in electricity*','ArcDyne owes me overtime','bzzzt']},
  golem:{name:'Gristle Golem',hp:300,atk:13,def:10,spd:8,crit:5,part:'gristle',size:'boss',boss:true,lines:['Do you even lift?','Sigma grindset.','Skipping leg day? Never.','Protein break. Hold on.','Ok that one hurt my feelings.','You hit like a breakfast burrito.']},
};

// ---------------------------------------------------------------- parts (also future cooking ingredients)
const PARTS={
  rattail:{name:'Rat Tail',desc:'Still wiggling. Crunchy if fried.',rar:0,price:3},
  twig:{name:'Dry Twig',desc:'Was once a tumbleweed\'s whole personality.',rar:0,price:2},
  map:{name:'Upside-Down Map',desc:'Somehow tastes like paper and regret.',rar:0,price:3},
  glob:{name:'Slime Glob',desc:'Jiggles when you look at it. Gelatin substitute.',rar:1,price:5},
  essence:{name:'Mana Wisp Essence',desc:'Buzzes. Do not lick. (Lick it.)',rar:1,price:8},
  gristle:{name:'Golem Gristle',desc:'Smells like pre-workout. Very chewy.',rar:2,price:25},
};

// ---------------------------------------------------------------- ingredients (for the cooking mini-game)
const INGREDIENTS={
  mushroom:{name:'Sus Mushroom',rar:0,fl:['Umami','Cursed'],desc:'It was looking at you first.'},
  bread:{name:'Day-Old Bread',rar:0,fl:['Comfort'],desc:'Day-old is generous.'},
  onion:{name:'Generic Onion',rar:0,fl:['Sour'],desc:'Makes everyone cry. Even the onion.'},
  jerky:{name:'Pipe Rat Jerky',rar:0,fl:['Salty','Protein'],desc:'Do not ask where it came from.'},
  water:{name:'Tap Water (Pitnet Edition)',rar:0,fl:['Mana'],desc:'Has 4 bars of signal.'},
  pepper:{name:'Ghost Pepper of Regret',rar:1,fl:['Spicy'],desc:'The regret is part of the flavor.'},
  milk:{name:'Mana Milk (2 Days Expired)',rar:1,fl:['Sweet','Mana'],desc:'Glows. Should it?'},
  tears:{name:'Salted Tears',rar:1,fl:['Salty'],desc:'Harvested from the comment section.'},
  kombucha:{name:'Kombucha Mother',rar:1,fl:['Sour','Fizzy'],desc:'Will tell you about her kids.'},
  protein:{name:'Sigma Protein Powder',rar:2,fl:['Protein'],desc:'Wakes up at 4am on its own.'},
  rizz:{name:'Bottled Rizz',rar:2,fl:['Sweet','Smoky'],desc:'Do not open on a first date.'},
  spice:{name:'Grandma\'s Mystery Spice',rar:2,fl:['Herbal','Spicy'],desc:'Grandma will not say what is in it.'},
  stonks:{name:'Stonks Seeds',rar:2,fl:['Herbal'],desc:'Number go up when planted.'},
  garlic:{name:'Main Character Garlic',rar:3,fl:['Umami'],desc:'Has a dramatic backstory.'},
  butter:{name:'Emotional Support Butter',rar:3,fl:['Comfort','Greasy'],desc:'It believes in you.'},
  truffle:{name:'Crypto Truffle',rar:3,fl:['Umami','Cursed'],desc:'Worth a fortune. Or nothing. Check again.'},
  fry:{name:'The Last Fry',rar:4,fl:['Salty','Greasy'],desc:'Found at the bottom of a bag. Destiny.'},
  egg:{name:'A Single Perfect Egg',rar:4,fl:['Protein','Comfort'],desc:'Scholars have written about this egg.'},
};

// ---------------------------------------------------------------- junk (pawn fodder)
const JUNK={
  phone:{name:'Broken Spellphone',desc:'Still gets notifications. Somehow.',price:12},
  gum:{name:'Gum (Used)',desc:'Lou will buy anything.',price:1},
  sock:{name:'Single Sock',desc:'Its partner is out there somewhere.',price:2},
  coupon:{name:'Expired Coupon',desc:'BOGO Dragon Wings. Expired 1987.',price:3},
  key:{name:'Mystery Key',desc:'Opens nothing. Feels important.',price:8},
  vhs:{name:'VHS of Unknown Origin',desc:'Labeled "DO NOT WATCH". Lou wants it.',price:15},
  nft:{name:'Printed-Out NFT',desc:'Lou laughed for 4 minutes.',price:1},
  duck:{name:'Rubber Duck (Debugging)',desc:'Has heard things.',price:6},
};

// ---------------------------------------------------------------- gear
const SLOTS=['weapon','hat','armor','trinket'];
const SLOT_NAME={weapon:'Weapon',hat:'Hat',armor:'Armor',trinket:'Trinket'};
const GEAR={
  spatula:{slot:'weapon',name:'Spatula',st:{atk:4},vis:'spatula'},
  noodle:{slot:'weapon',name:'Pool Noodle',st:{atk:3,spd:1},vis:'noodle'},
  keyboard:{slot:'weapon',name:'Mechanical Keyboard',st:{atk:5,spd:-1},vis:'keyboard'},
  baguette:{slot:'weapon',name:'Baguette',st:{atk:6},vis:'baguette'},
  chicken:{slot:'weapon',name:'Rubber Chicken',st:{atk:3,crit:5},vis:'chicken'},
  sign:{slot:'weapon',name:'Stolen Stop Sign',st:{atk:7,spd:-2},vis:'sign'},
  selfie:{slot:'weapon',name:'Selfie Stick',st:{atk:4,crit:3},vis:'stick'},
  tinfoil:{slot:'hat',name:'Tinfoil Hat',st:{def:1,res:1},vis:'tinfoil'},
  propeller:{slot:'hat',name:'Propeller Cap',st:{spd:2},vis:'propeller'},
  cone:{slot:'hat',name:'Traffic Cone',st:{def:3},vis:'cone'},
  fedora:{slot:'hat',name:'Fedora of Unearned Confidence',st:{crit:4},vis:'fedora'},
  crown:{slot:'hat',name:'Paper Burger Crown',st:{hp:8},vis:'crown'},
  bucket:{slot:'hat',name:'Bucket',st:{def:4,spd:-1},vis:'bucket'},
  hoodie:{slot:'armor',name:'Hoodie (3 Days Worn)',st:{hp:10,def:1},vis:'#5a5a6a'},
  chair:{slot:'armor',name:'Gamer Chair Backplate',st:{def:5},vis:'#d0303a'},
  bubble:{slot:'armor',name:'Bubble Wrap Vest',st:{def:3,hp:6},vis:'#c8e8f0'},
  dino:{slot:'armor',name:'Inflatable Dino Suit',st:{hp:18},vis:'#4fb060'},
  trench:{slot:'armor',name:'Trench Coat (3 Raccoons Inside)',st:{def:2,spd:2},vis:'#8a6a40'},
  trophy:{slot:'trinket',name:'Participation Trophy',st:{atk:1,def:1,spd:1,hp:4},vis:null},
  ringlight:{slot:'trinket',name:'Ring Light',st:{crit:6},vis:null},
  rduck:{slot:'trinket',name:'Lucky Rubber Duck',st:{crit:3,luck:1},vis:null},
  spinner:{slot:'trinket',name:'Fidget Spinner',st:{spd:3},vis:null},
  rock:{slot:'trinket',name:'Emotional Support Rock',st:{def:2,hp:5},vis:null},
  // forged
  whip:{slot:'weapon',name:'Rat Tail Whip',st:{atk:6,spd:2},vis:'whip',forged:1},
  slimehelm:{slot:'hat',name:'Slime Helmet',st:{def:4,hp:6},vis:'slime',forged:1},
  twigarmor:{slot:'armor',name:'Twig Armor',st:{def:6,spd:-1},vis:'#9a7a4a',forged:1},
  lantern:{slot:'trinket',name:'Wisp Lantern',st:{atk:3,crit:6},vis:null,forged:1},
  gauntlets:{slot:'weapon',name:'Gristle Gauntlets',st:{atk:10,def:2},vis:'gauntlet',forged:1},
};
const DROP_GEAR=Object.keys(GEAR).filter(k=>!GEAR[k].forged);
const AFFIX=[
  {id:'sigma',pre:'Sigma',st:{atkP:.15}},{id:'cert',pre:'Certified',st:{def:2}},{id:'gamer',pre:'Gamer',st:{spd:2}},
  {id:'thicc',pre:'Thicc',st:{hp:12}},{id:'lucky',pre:'Lucky',st:{crit:5}},{id:'cursed',pre:'Cursed',st:{atkP:.3,hpP:-.1}},
  {id:'mild',suf:'of Mild Inconvenience',st:{atk:1,def:1,spd:1}},{id:'main',suf:'of the Main Character',st:{allP:.1}},
  {id:'drip',suf:'with Drip',st:{crit:3,spd:1}},{id:'grind',suf:'of the Grindset',st:{atk:2,hp:6}},
];
const UPG_TITLE=['','','','Pretty Good ','Pretty Good ','Pretty Good ','Kinda Cracked ','Kinda Cracked ','Kinda Cracked ','Absolutely Busted ','Absolutely Busted '];
function makeGear(base,rar,ilvl=1){const n=rar===0?0:rar===1?1:rar===2?ri(1,2):rar===3?2:3;const aff=[];const pool=AFFIX.slice();
  while(aff.length<n&&pool.length){const a=pool.splice(Math.random()*pool.length|0,1)[0];if(aff.some(x=>(x.pre&&a.pre)||(x.suf&&a.suf)))continue;aff.push(a)}
  return{id:uid(),kind:'gear',base,rar,ilvl,up:0,aff:aff.map(a=>a.id)}}
function gearName(g){const B=GEAR[g.base];const A=g.aff.map(i=>AFFIX.find(a=>a.id===i));const pre=A.filter(a=>a.pre).map(a=>a.pre).join(' ');const suf=A.filter(a=>a.suf).map(a=>a.suf).join(' ');
  return`${UPG_TITLE[g.up]}${pre?pre+' ':''}${B.name}${suf?' '+suf:''}${g.up?' +'+g.up:''}`}
function gearStats(g){const B=GEAR[g.base];const m=RARITY[g.rar].mult*(1+.08*(g.ilvl-1))*(1+.1*g.up);const o={hp:0,atk:0,def:0,spd:0,crit:0,atkP:0,hpP:0,allP:0,res:0,luck:0};
  for(const k in B.st){const v=B.st[k];o[k]+=k==='res'||k==='luck'?v:(v>0?Math.round(v*m*10)/10:v)}
  for(const id of g.aff){const a=AFFIX.find(x=>x.id===id);for(const k in a.st)o[k]+=k.endsWith('P')?a.st[k]:Math.round(a.st[k]*m*10)/10}
  for(const k of['hp','atk','def','spd','crit'])o[k]=Math.round(o[k]);return o}
function gearPrice(g){return Math.max(2,Math.round(6*RARITY[g.rar].mult*RARITY[g.rar].mult*(1+.1*g.ilvl)*(1+.35*g.up)))}
function upgradeCost(g){const n=g.up;return{tips:Math.round(25*(n+1)*RARITY[g.rar].mult*(1+.05*g.ilvl)),parts:n+1,shards:n>=5?n-4:0}}

const FORGE=[
  {id:'whip',need:{rattail:3},tips:30},{id:'slimehelm',need:{glob:3},tips:30},{id:'twigarmor',need:{twig:4},tips:40},
  {id:'lantern',need:{essence:2,glob:1},tips:50},{id:'gauntlets',need:{gristle:1,rattail:2},tips:80},
];

// ---------------------------------------------------------------- takeout (M1 counter menu; cooked dishes replace this in Milestone 2)
const TAKEOUT={
  fries:{name:'Fries Basket',desc:'Heals the whole party for 25%.',price:20,col:'#ffd25e'},
  sauce:{name:'Hot Sauce Packet',desc:'+30% damage for the party for 3 turns each.',price:25,col:'#ff5a3a'},
  espresso:{name:'Espresso Shot',desc:'Every hero acts right away.',price:30,col:'#a06a3a'},
  doggy:{name:'Doggy Bag',desc:'Banks everything found so far, even if the party wipes.',price:60,col:'#d8c8a8'},
};

// ---------------------------------------------------------------- banter and quips
const LOU_LINES=['Lou: "I\'ll give you a fair price. Fair for me."','Lou: "Where did you even find this?"','Lou: "This smells like the pit. Love it."','Lou: "No refunds. No questions. No eye contact."','Lou: "My cousin has one of these. It\'s worse."','Lou: "Pawn & Prawn. Ask me about the prawn. Don\'t."'];
const SMITH_LINES=['Brunhilde: "I can make that worse. I mean better."','Brunhilde: "Hit it with a hammer? Say less."','Brunhilde: "Golem gristle. Chef\'s kiss. Smith\'s kiss."','Brunhilde: "Upgrades are just violence with extra steps."'];
const HERO_LINES={start:['Let\'s gooo','I have a bad feeling about this','for the content!','who brought snacks','ight, let\'s cook'],kill:['ez','gg','sit down','skill issue','not even close','respectfully, bye'],hurt:['ow??','emotional damage','that\'s gonna bruise','I want a refund','rude'],down:['tell my mom... nvm','*mint noises*','I\'m taking the tram home','not like this'],level:['I feel different','LEVEL UP. Mom, look','built different now']};
const WIFI_LINES=['Wifi password is "pitpit123". Now leave.','Sorry, I\'m a different kind of tourist guide.','*gets distracted giving directions*'];
