const form = document.getElementById('badgeForm');
const fullnameInput = document.getElementById('fullname');
const genderInput = document.getElementById('gender');
const photoInput = document.getElementById('photo');
const canvas = document.getElementById('badgeCanvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('result');
const statusBox = document.getElementById('status');
const downloadBtn = document.getElementById('downloadBtn');

function makeCode(){
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return 'BE-' + new Date().getFullYear() + '-' + [...bytes].map(n => n.toString(16).padStart(2,'0')).join('').toUpperCase();
}
function roundedRect(context,x,y,w,h,r){
  context.beginPath(); context.roundRect(x,y,w,h,r);
}
function fitText(text,maxWidth,startSize,font){
  let size=startSize;
  ctx.font=`${font} ${size}px Arial`;
  while(ctx.measureText(text).width>maxWidth && size>24){size-=2;ctx.font=`${font} ${size}px Arial`;}
  return size;
}
function drawBadge(name,gender,code,file,done){
  const img=new Image();
  const objectUrl=URL.createObjectURL(file);
  img.onload=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const bg=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    bg.addColorStop(0,'#252b20');bg.addColorStop(.5,'#515b3d');bg.addColorStop(1,'#171c15');
    ctx.fillStyle=bg;ctx.fillRect(0,0,1200,820);
    // Motif discret
    ctx.globalAlpha=.12;ctx.fillStyle='#a5ad7c';
    for(let i=0;i<18;i++){ctx.beginPath();ctx.ellipse((i*173)%1250,(i*97)%850,95,25,i*.3,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    roundedRect(ctx,28,28,1144,764,28);ctx.strokeStyle='#d7b76a';ctx.lineWidth=5;ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='#d7b76a';ctx.font='bold 34px Arial';ctx.fillText("BIGEVENT'S",600,100);
    ctx.fillStyle='#fff';ctx.font='bold 76px Arial';ctx.fillText('TOUS EN KAKI',600,190);
    ctx.strokeStyle='#d7b76a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(180,225);ctx.lineTo(1020,225);ctx.stroke();
    ctx.fillStyle='#d7b76a';ctx.font='bold 24px Arial';ctx.fillText('BADGE OFFICIEL DU PARTICIPANT',600,270);

    const x=465,y=300,w=270,h=250;
    ctx.save();roundedRect(ctx,x,y,w,h,18);ctx.clip();
    const scale=Math.max(w/img.width,h/img.height);const sw=w/scale,sh=h/scale;
    ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);ctx.restore();
    ctx.strokeStyle='#d7b76a';ctx.lineWidth=6;roundedRect(ctx,x,y,w,h,18);ctx.stroke();

    ctx.fillStyle='#d7b76a';ctx.font='bold 58px Arial';ctx.fillText("J'Y SERAI",600,635);
    const cleanName=name.toUpperCase();const nameSize=fitText(cleanName,900,42,'bold');
    ctx.fillStyle='#fff';ctx.font=`bold ${nameSize}px Arial`;ctx.fillText(cleanName,600,695);
    ctx.fillStyle='#d7b76a';ctx.font='bold 25px Arial';ctx.fillText(gender,600,735);
    ctx.fillStyle='#e9e3d0';ctx.font='20px Arial';ctx.fillText('CODE PARTICIPANT : '+code,600,770);
    URL.revokeObjectURL(objectUrl);
    done();
  };
  img.onerror=()=>{URL.revokeObjectURL(objectUrl);statusBox.textContent='Impossible de lire cette photo. Essaie une autre image.';downloadBtn.disabled=false;};
  img.src=objectUrl;
}

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  const name=fullnameInput.value.trim();
  const gender=genderInput.value;
  const file=photoInput.files[0];
  if(!name||!gender||!file){statusBox.textContent='Remplis tous les champs et ajoute une photo.';return;}
  if(!file.type.startsWith('image/')){statusBox.textContent='Choisis un fichier image valide.';return;}
  if(file.size>8*1024*1024){statusBox.textContent='La photo ne doit pas dépasser 8 Mo.';return;}
  const code=makeCode();
  result.hidden=false;
  downloadBtn.disabled=true;
  downloadBtn.textContent='GÉNÉRATION EN COURS…';
  statusBox.textContent='Création de ton badge…';
  drawBadge(name,gender,code,file,()=>{
    statusBox.textContent='Ton badge est prêt !';
    downloadBtn.disabled=false;
    downloadBtn.textContent='TÉLÉCHARGER LE BADGE JPG';
  });
});

downloadBtn.addEventListener('click',()=>{
  if(downloadBtn.disabled)return;
  const link=document.createElement('a');
  link.download='BigEvents-badge-Tous-en-Kaki.jpg';
  link.href=canvas.toDataURL('image/jpeg',0.94);
  link.click();
});
