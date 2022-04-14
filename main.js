var modal
var modalContent
var lastNumEggs=-1
var lastNumMiners=-1
var lastSecondsUntilFull=100
lastHatchTime=0
var eggstohatch1=1080000
var lastUpdate=new Date().getTime()
var modalID=0
var baseNum = '';
var currentAddr = '';

window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
        chainId: "0xa86a",
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        chainName: "Avalanche Network",
        nativeCurrency: {
            name: "Avalanche",
            symbol: "AVAX",
            decimals: 18
        },
        blockExplorerUrls: ["https://snowtrace.io/"]
    }]
});



async function Connect() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            await ethereum.enable()

            let accounts = await web3.eth.getAccounts()
            currentAddr = accounts[0]
			console.log(currentAddr)
   			console.log("hi")         
			runAPP()
            return
        } catch (error) {
            console.error(error)
        }
    } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider)

        let accounts = await web3.eth.getAccounts()
        currentAddr = accounts[0]
        console.log(currentAddr)
        runAPP()
        return
    }
    setTimeout(checkForBinanceChain, 1500)
}
async function checkForBinanceChain() {
    try {
        await window.BinanceChain.enable()
        console.log(typeof(window.BinanceChain))
        if (window.BinanceChain) {
            console.log('BinanceChain')
            await BinanceChain.enable()
            window.web3 = new Web3(window.BinanceChain)
            let accounts = await web3.eth.getAccounts()
            currentAddr = accounts[0]
            
            console.log(contract)
            runAPP()
            return
        }
    } catch (e) {}
}  

async function runAPP(){
    let networkID = await web3.eth.net.getId()
    if (networkID == 43114) { // 56 - BSC Live. 97 -- BSC Test
		contract = await new web3.eth.Contract(minersAbi, minersAddr)
		console.log(contract)
		tokenContract = await new web3.eth.Contract(tokenAbi, tokenAddr)
        console.log(tokenContract)
    } 
}

    setInterval(() => {				
        if(contract){
			$("#refString").val('https://' + window.location.host  + '/?ref=' + currentAddr)
			
        } 
    }, 3000);
        
    setInterval(() => {
        if(contract){
            web3.eth.getAccounts().then(res=>{
                currentAddr = res[0]
            })
    
            var connectedAddr = currentAddr[0] + 
                                currentAddr[1] + 
                                currentAddr[2] + 
                                currentAddr[3] + 
                                currentAddr[4] + '...' +
                                currentAddr[currentAddr.length-5] + 
                                currentAddr[currentAddr.length-4] + 
                                currentAddr[currentAddr.length-3] + 
                                currentAddr[currentAddr.length-2] + 
                                currentAddr[currentAddr.length-1]

            $("#connect-btn1").text(connectedAddr)	
			$("#connect-btn2").text(connectedAddr)
			
			/*
            contract.methods.getTokenPrice().call().then(res=>{ 
			 	TokenPrice = (res/1e18).toFixed(6)
			 	$("#token-price").html(`${TokenPrice}`)
			 	$("#token-priceM").html(`${TokenPrice}`)
             })	*/
			
            tokenContract.methods.balanceOf(currentAddr).call().then(res=>{
                $("#your-balance").text((res/1e9).toFixed(2) + " TPG");
            })	
			
			contract.methods.catchFishes(currentAddr).call().then(res=>{
                $("#testScript").text(res);
            })
			
			contract.methods.getFishesSinceLastCatch(currentAddr).call().then(res=>{
				var anzahl = (res);
				console.log("Anzahl:"+anzahl);
				if(anzahl>0)
					{
					contract.methods.calculateMoneyClaim(((anzahl)).toString()).call().then(res=>{
						console.log("Anzahl:"+anzahl);
						 $("#your-tpg").text((res/1e9));
					})
					}
            })
			
			
		}
        
    }, 3000);




function controlLoop(){
    refreshData()
    setTimeout(controlLoop,2500)
}
function controlLoopFaster(){
    liveUpdateEggs()
    // liveUpdatePeers()
    setTimeout(controlLoopFaster,30)
}

function stripDecimals(str, num){
	if (str.indexOf('.') > -1){
		var left = str.split('.')[0];
		var right = str.split('.')[1];
		return left + '.' + right.slice(0,num);
	}
	else {
		return str;
	}
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function refreshData(){

    var balanceElem = document.getElementById('contractBal');
    var baseNum = 0;
    contractBalance(function(result){
        rawStr = numberWithCommas(Number(result).toFixed(3));
        balanceElem.textContent = '' + stripDecimals(rawStr, 3) + ' AVAX';
    });
    
    web3.eth.getBalance(currentAddr).then(result => {
        rawStr = numberWithCommas(Number(web3.utils.fromWei(result)).toFixed(3));
        document.getElementById('userTrx').textContent = '' + stripDecimals(rawStr, 3) + ' AVAX';
    }).catch((err) => {
        console.log(err)
    });

    
    lastHatch(currentAddr,function(lh){
        lastHatchTime=lh
    });
    getMyEggs(function(eggs){
        if(lastNumEggs!=eggs){
            lastNumEggs=eggs
            lastUpdate=new Date().getTime()
            updateEggNumber(eggs/eggstohatch1)//formatEggs(eggs))
        }
        var timeuntilfulldoc=document.getElementById('timeuntilfull')
        secondsuntilfull=eggstohatch1-eggs/lastNumMiners
        // console.log('secondsuntilfull ',secondsuntilfull,eggsToHatch1,eggs,lastNumMiners)
        lastSecondsUntilFull=secondsuntilfull
        timeuntilfulldoc.textContent=secondsToString(secondsuntilfull)
        if(lastNumMiners==0){
            timeuntilfulldoc.textContent='?'
        }
    });
    getMyMiners(function(miners){
        lastNumMiners=miners
        var allnumminers=document.getElementsByClassName('numminers')
        for(var i=0;i<allnumminers.length;i++){
            if(allnumminers[i]){
                allnumminers[i].textContent=translateQuantity(miners)
            }
        }
        var productiondoc=document.getElementById('production')
        productiondoc.textContent=formatEggs(lastNumMiners*60*60)

        var sellsforexampledoc=document.getElementById('sellsforexample')
        calculateEggBuySimple(web3.utils.toWei('0.1'),function(eggs){
            devFee(eggs,function(fee){
                sellsforexampledoc.textContent='0.1 AVAX Hires ' + formatEggs(eggs-fee) + ' miners';
            });
        });
    });
    updateBuyPrice()
    updateSellPrice()
    var prldoc=document.getElementById('playerreflink')
    prldoc.textContent=window.location.origin+"/?ref="+currentAddr
    var copyText = document.getElementById("copytextthing");
    copyText.value=prldoc.textContent
}
function updateEggNumber(eggs){
    var hatchminersquantitydoc=document.getElementById('hatchminersquantity')
    hatchminersquantitydoc.textContent=translateQuantity(eggs,0)
    var allnumeggs=document.getElementsByClassName('numeggs')
    for(var i=0;i<allnumeggs.length;i++){
        if(allnumeggs[i]){
            allnumeggs[i].textContent=translateQuantity(eggs,3)
        }
    }
}
function hatchEggs1(){
    ref=getQueryVariable('ref')
    if (!web3.utils.isAddress(ref)){
        ref=currentAddr
    }
    console.log('hatcheggs ref ',ref)
    hatchEggs(ref,displayTransactionMessage)
}
function liveUpdateEggs(){
    if(lastSecondsUntilFull>1 && lastNumEggs>=0 && lastNumMiners>0 && eggstohatch1>0){
        currentTime=new Date().getTime()
        if(currentTime/1000-lastHatchTime>eggstohatch1){
            return;
        }
        difference=(currentTime-lastUpdate)/1000
        additionalEggs=Math.floor(difference*lastNumMiners)
        updateEggNumber(((lastNumEggs*1)+additionalEggs)/eggstohatch1)//formatEggs(lastNumEggs+additionalEggs))
    }
}
function updateSellPrice(){
    var eggstoselldoc=document.getElementById('sellprice')
    //eggstoselldoc.textContent='?'
   getMyEggs(function(eggs){
        if (eggs > 0) {
            calculateEggSell(eggs,function(sun){
                devFee(sun,function(fee){
                    eggstoselldoc.textContent=formatTrxValue(web3.utils.fromWei(sun) - web3.utils.fromWei(fee))
                });
            });
        }
   });
}

function updateBuyPrice(){
    var eggstobuydoc=document.getElementById('eggstobuy')
    var trxspenddoc=document.getElementById('ethtospend')
    calculateEggBuySimple(web3.utils.toWei(trxspenddoc.value),function(eggs){
        devFee(eggs,function(fee){
            eggstobuydoc.textContent=formatEggs((eggs-fee)/3.3)
        });
    });
}
function buyEggs2(){
    var trxspenddoc=document.getElementById('ethtospend')
    ref=getQueryVariable('ref')
    if (!web3.utils.isAddress(ref)){
        ref=currentAddr
    }
    console.log('hatcheggs ref ',ref)
    buyEggs(ref, web3.utils.toWei(trxspenddoc.value),function(){
        displayTransactionMessage();
    });
}
function formatEggs(eggs){
    return translateQuantity(eggs/eggstohatch1,3)
}
function findBaseNum(num){
    var ret = 0
    if(num>1000000){
        ret = 1000000
    }
    if(num>1000000000){
        ret = 1000000000
    }
    if(num>1000000000000){
        ret = 1000000000000
    }
    if(num>1000000000000000){
        ret = 1000000000000000
    }
    if(num>1000000000000000000){
        ret = 1000000000000000000
    }
    if(num>1000000000000000000000){
        ret = 1000000000000000000000
    }
    if(num>1000000000000000000000000){
        ret = 1000000000000000000000000
    }
    if(num>1000000000000000000000000000){
        ret = 1000000000000000000000000000
    }
    if(num>1000000000000000000000000000000){
        ret = 1000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    return ret;
}
function findBaseText(num){
    var ret = ''
    if(num>1000000){
        ret = 'Million'
    }
    if(num>1000000000){
        ret = 'Billion'
    }
    if(num>1000000000000){
        ret = 'Trillion'
    }
    if(num>1000000000000000){
        ret = 'Quadrillion'
    }
    if(num>1000000000000000000){
        ret = 'Quintillion'
    }
    if(num>1000000000000000000000){
        ret = 'Sextillion'
    }
    if(num>1000000000000000000000000){
        ret = 'Septillion'
    }
    if(num>1000000000000000000000000000){
        ret = 'Octillion'
    }
    if(num>1000000000000000000000000000000){
        ret = 'Nonillion'
    }
    if(num>1000000000000000000000000000000000){
        ret = 'Decillion'
    }
    if(num>1000000000000000000000000000000000000){
        ret = 'Undecillion'
    }
    if(num>1000000000000000000000000000000000000000){
        ret = 'Duodecillion'
    }
    if(num>1000000000000000000000000000000000000000000){
        ret = 'Tredecillion'
    }
    if(num>1000000000000000000000000000000000000000000000){
        ret = 'Quattuordecillion'
    }
    if(num>1000000000000000000000000000000000000000000000000){
        ret = 'Quindecillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000){
        ret = 'Sexdecillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000){
        ret = 'Septendecillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000){
        ret = 'Octodecillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000){
        ret = 'Novemdecillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Vigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Unvigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Duovigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Trevigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Quattuorvigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Quinvigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Sexvigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Septenvigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Octovigintillion'
    }
    if(num>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        ret = 'Novemvigintillion'
    }
    return ret;
}

function checkMarketEggsVal(quantity){
    quantity=Number(quantity)
    modifier = ' Quattuorvigintillion'
    finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000;
    if (finalquantity > 1) {
        return finalquantity.toFixed(1)+modifier;
    } else {
        return finalquantity.toFixed(5)+modifier;
    }
}

function translateQuantity(quantity,precision){
    quantity=Number(quantity)
    finalquantity=quantity
    modifier=''
    
    if (quantity < 1e6) {
      return (quantity).toFixed(2)
    }

    //console.log('??quantity ',typeof quantity)
    if(quantity>1000000){
        modifier=' Million'
        finalquantity=quantity/1000000
    }
    if(quantity>1000000000){
        modifier=' Billion'
        finalquantity=quantity/1000000000
    }
    if(quantity>1000000000000){
        modifier=' Trillion'
        finalquantity=quantity/1000000000000
    }
    if(quantity>1000000000000000){
        modifier=' Quadrillion'
        finalquantity=quantity/1000000000000000
    }
    if(quantity>1000000000000000000){
        modifier=' Quintillion'
        finalquantity=quantity/1000000000000000000
    }
    if(quantity>1000000000000000000000){
        modifier=' Sextillion'
        finalquantity=quantity/1000000000000000000000
    }
    if(quantity>1000000000000000000000000){
        modifier=' Septillion'
        finalquantity=quantity/1000000000000000000000000
    }
    if(quantity>1000000000000000000000000000){
        modifier=' Octillion'
        finalquantity=quantity/1000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000){
        modifier=' Nonillion'
        finalquantity=quantity/1000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000){
        modifier=' Decillion'
        finalquantity=quantity/1000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000){
        modifier = ' Undecillion'
        finalquantity=quantity/1000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000){
        modifier = ' Duodecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000){
        modifier = ' Tredecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000){
        modifier = ' Quattuordecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000){
        modifier = ' Quindecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000){
        modifier = ' Sexdecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000){
        modifier = ' Septendecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000){
        modifier = ' Octodecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Novemdecillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Vigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Unvigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Duovigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Trevigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Quattuorvigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Quinvigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Sexvigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Septenvigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Octovigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(quantity>1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000){
        modifier = ' Novemvigintillion'
        finalquantity=quantity/1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    }
    if(precision == undefined){
        precision=0
        if(finalquantity<10000){
            precision=1
        }
        if(finalquantity<1000){
            precision=2
        }
        if(finalquantity<100){
            precision=3
        }
        if(finalquantity<10){
            precision=4
        }
    }
    if(precision==0){
        finalquantity=Math.floor(finalquantity)
    }
    return finalquantity.toFixed(precision)+modifier;
}
function removeModal2(){
    $('#adModal').modal('toggle');
}
function removeModal(){
        modalContent.innerHTML=""
        modal.style.display = "none";
}
function displayTransactionMessage(){
    displayModalMessage("Transaction Submitted")
}
function displayModalMessage(message){
    modal.style.display = "block";
    modalContent.textContent=message;
    setTimeout(removeModal,3000)
}
function formatTrxValue(trxstr){
    return parseFloat(parseFloat(trxstr).toFixed(4));
}
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function copyRef() {
  var copyText = document.getElementById("playerreflink");
  copyText.style.display="block"
  copyText.select();
  document.execCommand("Copy");
  copyText.style.display="none"
  displayModalMessage("copied link to clipboard")
  //alert("Copied the text: " + copyText.value);
}



function secondsToString(seconds)
{
    seconds=Math.max(seconds,0)
    var numdays = Math.floor(seconds / 86400);

    var numhours = Math.floor((seconds % 86400) / 3600);

    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

    var numseconds = ((seconds % 86400) % 3600) % 60;
    var endstr=""

    return numhours + "h " + numminutes + "m "//+numseconds+"s";
}
function disableButtons(){
    var allnumminers=document.getElementsByClassName('btn-lg')
    for(var i=0;i<allnumminers.length;i++){
        if(allnumminers[i]){
            allnumminers[i].style.display="none"
        }
    }
    var allnumminers=document.getElementsByClassName('btn-md')
    for(var i=0;i<allnumminers.length;i++){
        if(allnumminers[i]){
            allnumminers[i].style.display="none"
        }
    }
}
function enableButtons(){
    var allnumminers=document.getElementsByClassName('btn-lg')
    for(var i=0;i<allnumminers.length;i++){
        if(allnumminers[i]){
            allnumminers[i].style.display="inline-block"
        }
    }
        var allnumminers=document.getElementsByClassName('btn-md')
    for(var i=0;i<allnumminers.length;i++){
        if(allnumminers[i]){
            allnumminers[i].style.display="inline-block"
        }
    }
}
function onlyLetters(text){
    return text.replace(/[^0-9a-zA-Z\s\.!?,]/gi, '')
}
function checkOnlyLetters(str){
    var pattern=new RegExp('^[0-9a-zA-Z\s\.!?,]*$')
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
}
function onlyurl(str){
     return str.replace(/[^0-9a-zA-Z\.?&\/\+#=\-_:]/gi, '')
}
function validurlsimple(str){
    var pattern=new RegExp('^[a-z0-9\.?&\/\+#=\-_:]*$')
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
}
function ValidURL(str) {
  var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}
function callbackClosure(i, callback) {
    return function() {
        return callback(i);
    }
}
