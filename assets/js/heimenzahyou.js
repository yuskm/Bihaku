/***
    getXY(Ido,Keido,Gtnum)
    経度を緯度と座標系番号を与えると平面直角座標XY(単位はmeter)を返す

    Ido : 緯度(60進数<10進数変換済みであれば ”phi=Ghenkan(Ido);”をコメントアウト>)
    Keido : 経度(60進数<10進数変換済みであれば ”rmd=Ghenkan(Keido);”をコメントアウト>)
    Gtnum : 平面座標系(静岡は8)

    //引数サンプル
	//Ido="36.50.25.0000";//緯度60進
	//Keido="138.35.45.2500";//経度60進
	//Gtnum=1～19の数値（デフォルトは８）
***/
function getXY(Ido,Keido,Gtnum){
//座標系の原点の経緯度をもつ配列をつくる（60進法でもってる。データ形式.区切りに注意！）
Gt = new Array(20);
for (i=0;i<Gt.length;i++){
    Gt[i] = new Array(2);
}
//平面直角座標系（平成十四年国土交通省告示第九号）
Gt[1][1]="129.30.00.0000";Gt[1][2]="33.00.00.0000";
Gt[2][1]="131.00.00.0000";Gt[2][2]="33.00.00.0000";
Gt[3][1]="132.10.00.0000";Gt[3][2]="36.00.00.0000";
Gt[4][1]="133.30.00.0000";Gt[4][2]="36.00.00.0000";
Gt[5][1]="134.20.00.0000";Gt[5][2]="36.00.00.0000";
Gt[6][1]="136.00.00.0000";Gt[6][2]="36.00.00.0000";
Gt[7][1]="137.10.00.0000";Gt[7][2]="36.00.00.0000";
Gt[8][1]="138.30.00.0000";Gt[8][2]="36.00.00.0000";
Gt[9][1]="139.50.00.0000";Gt[9][2]="36.00.00.0000";
Gt[10][1]="140.50.00.0000";Gt[10][2]="40.00.00.0000";
Gt[11][1]="140.15.00.0000";Gt[11][2]="44.00.00.0000";
Gt[12][1]="142.15.00.0000";Gt[12][2]="44.00.00.0000";
Gt[13][1]="144.15.00.0000";Gt[13][2]="44.00.00.0000";
Gt[14][1]="142.00.00.0000";Gt[14][2]="26.00.00.0000";
Gt[15][1]="127.30.00.0000";Gt[15][2]="26.00.00.0000";
Gt[16][1]="124.00.00.0000";Gt[16][2]="26.00.00.0000";
Gt[17][1]="131.00.00.0000";Gt[17][2]="26.00.00.0000";
Gt[18][1]="136.00.00.0000";Gt[18][2]="20.00.00.0000";
Gt[19][1]="154.00.00.0000";Gt[19][2]="26.00.00.0000";

//座標系の選択(初期値）
if(!(Gtnum>=1 && Gtnum <= 19)){
Gtnum=8;//8は山梨県あたり
}
GKeido=Gt[Gtnum][1];
GIdo=Gt[Gtnum][2];

phi0=Ghenkan(Gt[Gtnum][2]);//原点の緯度
phi0RAD=deg2rad(phi0);//ラジアンにした原点の緯度
rmd0=Ghenkan(Gt[Gtnum][1]);//原点の経度
rmd0RAD=deg2rad(rmd0);//ラジアンにした原点の経度

//ターゲット
//phi=Ghenkan(Ido);//変換した緯度
phi = Ido
phiRAD=deg2rad(phi);//ラジアンにした緯度
//rmd=Ghenkan(Keido);//変換した緯度
rmd = Keido;
rmdRAD=deg2rad(rmd);//ラジアンにした緯度

//パラメータ（世界測地系）
a=6378137; //長半径
f=1/298.257222101;//扁平率
F=298.257222101;//逆扁平率

//パラメータ（日本測地系）（改正前）
/*
a=6377397.155; //長半径
f=1/299.152813;//扁平率
F=299.152813;//逆扁平率
*/


b=a*(1-f);//短半径
c=Math.pow(a,2)/b;//極での曲率半径
	/*検算(デバッグ用：b=b1,c=c1)
		b1=(a*(F-1))/F;
		c1=(a*F)/(F-1);
	検算おわり*/

//座標系
m0=0.9999;//座標系の原点における縮尺係数

//第一離心率を求める
e=Math.sqrt((Math.pow(a,2)-Math.pow(b,2))/Math.pow(a,2));//第一離心率
//第二離心率を求める
et=Math.sqrt((Math.pow(a,2)-Math.pow(b,2))/Math.pow(b,2));//第二離心率

	/*検算(デバッグ用：e=e1=e2,et=et1=et2)
		e1=Math.sqrt(2*f-Math.pow(f,2));
		et1=Math.sqrt(2*F-1)/(F-1);
		e2=Math.sqrt(Math.pow(et,2)/(1+Math.pow(et,2)));
		et2=Math.sqrt(Math.pow(e,2)/(1-Math.pow(e,2)));
	検算おわり*/

//楕円形の公式
//パラメータ
W=Math.sqrt(1-(Math.pow(e,2)*Math.pow(Math.sin(phiRAD),2)));
V=Math.sqrt(1+(Math.pow(et,2)*Math.pow(Math.cos(phiRAD),2)));

//卯酉線曲率半径の計算
N=a/W;
N1=c/V;

//子午線曲率半径
M=(a*(1-Math.pow(e,2)))/Math.pow(W,3);

R=Math.sqrt(M*N);

	/*検算(デバッグ用：M=M1=M2,R=R1=R2)
		M1=c/Math.pow(V,3);
		R1=b/Math.pow(W,2);
		R2=c/Math.pow(V,2);
	検算おわり*/

//緯度を与えて赤道からの子午線弧長を求める計算
//パラメータ演算
	A=1+3/4*Math.pow(e,2)+45/64*Math.pow(e,4)+11025/16384*Math.pow(e,8)+43659/65536*Math.pow(e,10)+693693/1048576*Math.pow(e,12)+19324305/29360128*Math.pow(e,14)+4927697775/7516192768*Math.pow(e,16);
	B=3/4*Math.pow(e,2)+15/16*Math.pow(e,4)+525/512*Math.pow(e,6)+2205/2048*Math.pow(e,8)+72765/65536*Math.pow(e,10)+297297/262144*Math.pow(e,12)+135270135/117440512*Math.pow(e,14)+547521975/469762048*Math.pow(e,16);
	C=15/64*Math.pow(e,4)+105/256*Math.pow(e,6)+2205/4096*Math.pow(e,8)+10395/16384*Math.pow(e,10)+1486485/2097152*Math.pow(e,12)+45090045/58720256*Math.pow(e,14)+766530765/939524096*Math.pow(e,16);
	D=35/512*Math.pow(e,6)+315/2048*Math.pow(e,8)+31185/131072*Math.pow(e,10)+165165/524288*Math.pow(e,12)+45090045/117440512*Math.pow(e,14)+209053845/469762048*Math.pow(e,16);
	E=315/16384*Math.pow(e,8)+3465/65536*Math.pow(e,10)+99099/1048576*Math.pow(e,12)+4099095/29360128*Math.pow(e,14)+348423075/1879048192*Math.pow(e,16);
	F=693/131072*Math.pow(e,10)+9009/524288*Math.pow(e,12)+4099095/117440512*Math.pow(e,14)+26801775/469762048*Math.pow(e,16);
	G=3003/2097152*Math.pow(e,12)+315315/58720256*Math.pow(e,14)+11486475/939524096*Math.pow(e,16);
	H=45045/117440512*Math.pow(e,14)+765765/469762048*Math.pow(e,16);
I=765765/7516192768*Math.pow(e,16);

	B1=a*(1-Math.pow(e,2))*A;
	B2=a*(1-Math.pow(e,2))*(-B/2);
	B3=a*(1-Math.pow(e,2))*(C/4);
	B4=a*(1-Math.pow(e,2))*(-D/6);
	B5=a*(1-Math.pow(e,2))*(E/8);
	B6=a*(1-Math.pow(e,2))*(-F/10);
	B7=a*(1-Math.pow(e,2))*(G/12);
	B8=a*(1-Math.pow(e,2))*(-H/14);
	B9=a*(1-Math.pow(e,2))*(I/16);

S=(B1*phiRAD)+B2*Math.sin(2*phiRAD)+B3*Math.sin(4*phiRAD)+B4*Math.sin(6*phiRAD)+B5*Math.sin(8*phiRAD)+B6*Math.sin(10*phiRAD)+B7*Math.sin(12*phiRAD)+B8*Math.sin(14*phiRAD)+B9*Math.sin(16*phiRAD);//子午線弧長

//赤道から座標系の原点の緯度phi0までの子午線弧長
S0=(B1*phi0RAD)+B2*Math.sin(2*phi0RAD)+B3*Math.sin(4*phi0RAD)+B4*Math.sin(6*phi0RAD)+B5*Math.sin(8*phi0RAD)+B6*Math.sin(10*phi0RAD)+B7*Math.sin(12*phi0RAD)+B8*Math.sin(14*phi0RAD)+B9*Math.sin(16*phi0RAD);//原点の子午線弧長

//縮尺係数の計算
drmd=rmdRAD-rmd0RAD;
nyu2=Math.pow(et,2)*Math.pow(Math.cos(phiRAD),2);
t=Math.tan(phiRAD);

//子午線収差角の計算
gma=Math.cos(phiRAD)*t*drmd + 1/3*Math.pow(Math.cos(phiRAD),3)*t*(1+3*nyu2+2*Math.pow(nyu2,2))*Math.pow(drmd,3) + 1/15*Math.pow(Math.cos(phiRAD),5)*t*(2-Math.pow(t,2))*Math.pow(drmd,5);

//x座標の計算
	//パラメータ
	x0=(S-S0)+1/2*N*Math.pow(Math.cos(phiRAD),2)*t*Math.pow(drmd,2);
	x1=1/24*N*Math.pow(Math.cos(phiRAD),4)*t*(5-Math.pow(t,2)+9*nyu2+4*Math.pow(nyu2,4))*Math.pow(drmd,4);
	x2=-1/720*N*Math.pow(Math.cos(phiRAD),5)*t*(-61+58*Math.pow(t,2)-Math.pow(t,4)-270*nyu2+330*Math.pow(t,2)*nyu2)*(Math.pow(drmd,6));
	x3=-1/40320*N*Math.pow(Math.cos(phiRAD),8)*t*(-1385+3111*Math.pow(t,2)-543*Math.pow(t,4)+Math.pow(t,6))*(Math.pow(drmd,8));
	//
x=(x0+x1+x2+x3)*m0;

//y座標の計算
	//パラメータ
	y0=N*Math.cos(phiRAD)*drmd;
	y1=-1/6*N*Math.pow(Math.cos(phiRAD),3)*(-1+Math.pow(t,2)-nyu2)*(Math.pow(drmd,3));
	y2=-1/120*N*Math.pow(Math.cos(phiRAD),5)*(-5+18*Math.pow(t,2)-Math.pow(t,4)-14*nyu2+58*Math.pow(t,2)*nyu2)*(Math.pow(drmd,5));
	y3=-1/5040*N*Math.pow(Math.cos(phiRAD),7)*(-61+479*Math.pow(t,2)-179*Math.pow(t,4)*Math.pow(t,6))*(Math.pow(drmd,7));
	//
y=(y0+y1+y2+y3)*m0;

return {"x":x,"y":y,"Gtnum":Gtnum};
}

//度からラジアンに変換する
function deg2rad(deg){
	rad=deg*3.14159265/180;
	return rad;
}

//ラジアンから度に変換する
function rad2deg(rad){
	deg=rad*180/3.14159265;
	return deg;
}
//経度緯度を60進から10進にへんかんする（ドットで区切った度に対応）
	//引数サンプル
	//Ido="36.50.25.0000";//緯度60進
	//Keido="138.35.45.2500";//経度60進
function Ghenkan(param){
	splitparam = param.split(".");
	hparam=Number(splitparam[0])+(Number(splitparam[1])*60+(Number(splitparam[2]+"."+splitparam[3])))/3600;
	return hparam;
}

/////////////////////////////////////////////////////////
/***
    calcDistLinetoPoint

    垂線((x1,y1)−(x2,y2)) と 点(x3,y3) の 距離を算出する。
    各ポイントは平面座標系とする。
    <緯度、経度から計算したい場合は上記 getXYを使って平面座標系にすること>
***/
function calcDistLinetoPoint( x1, y1, x2, y2, x3, y3 ) {
    var u = { x : x2 - x1, y : y2 - y1  };
    var v = { x : x3 - x1, y : y3 - y1  };

    uxv = u.x * v.y - u.y * v.x;
    un  = Math.hypot( u.x, u.y );

    var result = Math.abs( uxv / un );
//   LogWrite( result );

    return result;
}
/***
    calcDistPointtoPoint

    点(x1,y1) と 点(x2,y2) の 距離を算出する。
    各ポイントは平面座標系とする。
    <緯度、経度から計算したい場合は上記 getXYを使って平面座標系にすること>
***/
function calcDistPointtoPoint( x1, y1, x2, y2 ) {
    return Math.hypot( x2 - x1, y2 - y1 );
}
