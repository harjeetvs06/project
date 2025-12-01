 let xp=0;
 let health=100;
 let gold=100;
 let diamond=5;
 let currentWeapon=0;
 let monsterHealth;
 let fighting;
 let inventory=['stick'];

 const button1=document.querySelector("#button1");
 const button2=document.querySelector("#button2");
 const button3=document.querySelector("#button3");
 const text=document.querySelector("#text");
 const xptext=document.querySelector("#xptext");
 const goldtext=document.querySelector("#goldtext");
 const healthtext=document.querySelector("#healthtext");
 const diamondtext=document.querySelector("#diamondtext");
 const monstername=document.querySelector("#monstername");
 const Health=document.querySelector("#Health");

 const locations=[
  {
    name:"town Hall",
  "button Text":["Go to store","Go to cave","fight the dragon"],
  "button function":[goStore,goCave,fightDragon],
  text:"Welcome to the land of heritage.There is a store"
 },
 {
  name:"store",
  "button text":["Buy 10 health(5 Gold)","Buy a weapon(30 Gold)","Go to Town Hall"],"button function":[goStore,goCave,fightDragon],
  text:"you entered the store"
 }
]

 //intialize buttons
 button1.onclick=goStore;
 button2.onclick=goCave;
 button3.onclick=fightDragon;

 function update(location){
   button1.innerText=location["button Text"][0];
   button2.innerText=location["button Text"][1];
   button3.innerText=location["button Text"][2];
   button1.onclick=location["button function"][0];
   button2.onclick=location["button function"][1];
   button3.onclick=location["button function"][2];
   text.innerText=location.text;
}
function goTown(){
  update(locations[0]);
}
 function goStore(){
  update(locations[1]);
 }
 function goCave(){
  console.log("goin to cave")
   
 }
function fightDragon(){
   button1.innerText="Attack the Dragon"
   button2.innerText="defend the attack"
   button3.innerText="slay the dragon(only when HP=30)"
   text.innerText="The dragon is enraged by the intruder"
 }
 function buyHealth(){
   console.log("potion recieved")
 }
function buyWeapon(){
   console.log("weapon acquired")
}
