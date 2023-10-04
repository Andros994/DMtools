var nome, pf, alignment, inziativa, init, inputDadi;


$(document).ready(function(){

    // leggo file di config dei lavori
    $.getJSON('/DMtools/config/jobs.json', function(data) {
        jobsConfig = data;
    });

    // leggo config per le tracce audio
    $.getJSON('/DMtools/config/music.json', function(data) {
        musicConfig = data;
        popolaSelectMusic(musicConfig);
    });
    
    // leggo config per le armi di SW
    $.getJSON('/DMtools/config/SWweapons.json', function(data) {
        swWeapons = data;
        popolaSelectSWweapons(swWeapons);
    });

    // config per SW items
    $.getJSON("/DMtools/config/items.json", function(data) {
        itemsConfig = data;
    })

    $('#modalAdd').hide();

    $('#selectCombattimento, #selectEsplorazione').on('change', function(){
        if (this.id == "selectCombattimento"){
            $('#iframeCombattimento').attr('src', this.value)
        } else if (this.id == "selectEsplorazione"){
            $('#iframeEsplorazione').attr('src', this.value)
        }
    })

    $('.btnAdd').on('click', function(){
        if (this.id == "addEnemy"){
            alignment = "enemy"
        } else if (this.id == "addAlly"){
            alignment = "ally"
        } else {
            alignment = "npc"
        }
        $('#modalAdd').show();
    })

    $('#randomName').on('click', function(){
        var arrayName = [];
        $.ajax({
            type: "GET",
            url: 'https://randommer.io/api/Name?nameType=fullname&quantity=1',
            headers: {"X-Api-Key": "9e63af1a0c8f4659934478690939fc20"},
            success: function(data){
                arrayName = data
                $('#inputName').val(arrayName[0])
            },
            error: function(error){
                console.log(error)
            }
        });
    })

    $(document).on('click', '#closeModal', function(){
        $('#modalAdd').hide();
        $('#inputName').val("");
        $('#iniziativa').val("");
        $('#pf').val("");
        alignment = "";
    })
    
    $(document).on('click', '#salvaCard', function(){
        creaCard();
        $('#modalAdd').hide();
        $('#inputName').val("");
        $('#iniziativa').val("");
        $('#pf').val("");
        alignment = "";
    })

    $(document).on('click', '.deleteCard', function(){
        $(this).parent().parent().parent().remove();
    })

    $(document).on('click', '#sortIniziativa', function(){
        var arrayToCreate = [];
        var listaIniziative = [];
        var inputIniziativa = Object.values($(document).find('.inputIniziativa'));
        var listaCards = Object.values($(document).find('.card')).slice(0,-2);
        inputIniziativa.forEach(el => {
            if(el.className && el.className != ""){
                listaIniziative.push(el.textContent);
            }
        })
        listaIniziative.sort(function(a, b){return b - a});
        listaIniziative = removeDuplicates(listaIniziative);
        listaIniziative.forEach(el => {
            listaCards.forEach(card => {
                if (card.attributes && card.attributes.iniziativa && card.attributes.iniziativa.value == el){
                    arrayToCreate.push(card);
                }
            })
        })
        arrayToCreate.forEach(el => {
            $('#cardsContainer').append(el);
        })
    })

    $(document).on("click", "#clearAll", function(){
        $('#cardsContainer').empty();
    })

    $(document).on('click', '#closeModalDadi', function(){
        $('#risultatoDadi').empty();
        $('#modaleDadi').hide();
    })

    $(document).on("click", "#tiraDadi", function(){
        inputDadi = $('#inputDadi').val();
        if (inputDadi != ""){
            calcolaDadi(inputDadi);
            $('#modaleDadi').show();
        }
    })

    $(document).on('click', '#ClearDices', function(){
        $('#risultatoDadi').empty();
    })

    $(document).on('click', '#randomNamesBtn', function(){
        var names = [];
        $.ajax({
            type: "GET",
            url: 'https://randommer.io/api/Name?nameType=fullname&quantity=10',
            headers: {"X-Api-Key": "9e63af1a0c8f4659934478690939fc20"},
            success: function(data){
                $('#randomNames').empty();
                names = data
                names.forEach(el => {
                    var singleName = `
                    <p>${el}</p>
                    `;
                    $('#randomNames').append(singleName);
                })
            },
            error: function(error){
                console.log(error)
            }
        });
    })

    $(document).on("click", "#randomNamesClear", function(){
        $('#randomNames').empty();
    })

    $(document).on('click', '#randomJobsBtn', function(){
        $('#randomJobs').empty();
        var outputJobs = [];
        for (n=0; n<=9; n++){
            var singleJob = jobsConfig.jobs[Math.floor(Math.random()*jobsConfig.jobs.length)]
            if (!outputJobs.includes(singleJob)){
                outputJobs.push(singleJob);
            } else {
                n--;
            }
        }
        outputJobs.forEach(element => {
            var singleJob = `<p>${element}</p>`;
            $('#randomJobs').append(singleJob);
        });
    })

    $(document).on("click", "#randomJobsClear", function(){
        $('#randomJobs').empty();
    })

    $(document).on('click', '#randomSWweaponClear', function(){
        $('#randomSWweapon').empty();
    })

    $(document).on('click', '#randomSwitemsBtn', function(){
        $('#randomSWitems').empty();
        var arrayRandomItems = [];
        for (i=0; i<10; i++){
            var randomItem = random_item(itemsConfig.itemList);
            arrayRandomItems.push(randomItem);
        }
        console.log(arrayRandomItems);
        arrayRandomItems.forEach(el => {
            if (!el.Description){
                el.Description = "";
            }
            var objAppend = `
            <div>
                <h4 class="redText"><b>${el.Name}</b></h4>
                <p>Category: ${el.Category}</p>
                <p>${el.Description}</p>
                <p>Cost: ${el.Cost}</p>
                <p>Weight: ${el.Weight}</p>
            </div>
            <hr>`;
            $('#randomSWitems').append(objAppend);
        })
    })

    $(document).on("click", "#randomSWitemsClear", function(){
        $('#randomSWitems').empty();
    })
})

function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

function creaCard(){
    nome = $('#inputName').val();
    init = $('#iniziativa').val();
    pf = $('#pf').val();
    
    var icon = "";
    if (alignment == "enemy"){
        icon = '<i class="fa-solid fa-ghost"></i>';
    } else if (alignment == "ally"){
        icon = '<i class="fa-solid fa-shield"></i>'
    } else {
        icon = '<i class="fa-solid fa-user"></i>'
    }

    var card = `
        <div class="card squareCard ${alignment}" iniziativa="${init}">
            <div class="card-header">
                <div class="cardHeader">
                    ${icon}
                    <h6>${nome}</h6>
                    <button type="button" class="btn btn-danger deleteCard"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="col-12 d-flex">
                <label class="col-6">Iniziative</label>
                <label class="inputIniziativa col-6" refName="${nome}" value="${init}">${init}</label>
            </div>
            <div class="col-12 d-flex mt-2">
                <label class="col-2">PF</label>
                <input type="number" placeholder="Current PF" class="col-8 noBorder"></input>
                <label class="col-2">/ ${pf} </label>
            </div>
            <div>
                <textarea class="textarea p-2 mb-2" placeholder="Notes"></textarea>
            </div>
        </div>
    `

    $('#cardsContainer').append(card);
}

function popolaSelectMusic(json){
    json.fightMusic.forEach(element => {
        var option = `<option value="${element.src}">${element.title}</option>`;
        $('#selectCombattimento').append(option);
    });
    json.exploringMusic.forEach(element => {
        var option = `<option value="${element.src}">${element.title}</option>`;
        $('#selectEsplorazione').append(option);
    });
}

function calcolaDadi(input){
    arrayDadi = input.split(',');
    var firstCol = "";
    var secondCol = "<td></td>";
    var thirdCol = "<td></td>";
    arrayDadi.forEach(el => {
        var arrayResult = [];
        var symbol = "";
        var modifier = 0;
        if (el.includes("+")){
            modifier = parseInt(el.split('+')[1]);
            el = el.split("+")[0]
            symbol = "+";
        } else if (el.includes("-")) {
            modifier = parseInt(el.split('-')[1]);
            el = el.split("-")[0]
            symbol = "-";
        }
        var numeroDadi = el.split('d')[0];
        var tipoDado = el.split('d')[1];
        for (i=0; i<parseInt(numeroDadi); i++){
            var risultatoTiro = Math.floor(Math.random() * parseInt(tipoDado) + 1);
            arrayResult.push(risultatoTiro);
        }
        var somma = sum(arrayResult);
        if (symbol == "+"){
            somma+=modifier;
        } else if (symbol == "-"){
            somma-=modifier;
        }
        firstCol = `<td>${el}</td>`;
        if ($('#mostraRisultati').is(':checked')){
            secondCol = `<td>Single results: ${arrayResult}</td>`;
        }
        if ($('#sommaRisultati').is(':checked')){
            thirdCol = `<td>Total: ${somma}</td>`;
        }
        var outputHtml = '<tr style="border-bottom: 1px solid #ddd;">'+firstCol+secondCol+thirdCol+'</tr>';
        $('#risultatoDadi').append(outputHtml);
    })
}

sum = function(arr) {
    return arr.reduce((a, b) => a + b, 0);
};

function readJsonConfig(){
    return $.getJSON('/config/jobs.json').then(function(){
        return {
            
        }
    })
}

function popolaSelectSWweapons(json){
    console.log(json);
    json.equipmentType.forEach(el => {
        var optionWeaponType = `<option value="${el}">${el}</option>`;
        $('#SWweaponType').append(optionWeaponType);
    })
    json.rarity.forEach(el => {
        var optionRarity = `<option value="${el.description}">${el.description}</option>`;
        $('#SWweaponRarity').append(optionRarity);
    })
    $(document).on('change', '#SWweaponRarity', function(){
        var selectedRarity = $('#SWweaponRarity').find(":selected").val();
        if (selectedRarity != ""){
            $('#SWweaponMods').empty()
            json.rarity.forEach(el => {
                if (el.description == selectedRarity){
                    for (i=0; i<=el.slots; i++){
                        var installedMods = `<option id="${i}">${i}</option>`
                        $('#SWweaponMods').append(installedMods);
                    }
                }
            })
        }
    })

    $(document).on('click', '#randomSWweaponBtn', function(){
        var weaponType = $('#SWweaponType').val();
        var weaponRarity = $('#SWweaponRarity').val();
        var installedMods = $('#SWweaponMods').val();
        if (weaponType != null && weaponRarity != null && installedMods != null){
            $('#randomSWweapon').empty();
            // Focus Generator
            if (weaponType == "Focus Generator"){
                var obj = json.equipmentList[weaponType].weaponList[0];
                var objAppend = `
                <hr>
                <div>
                    <p>${obj.name}</p>
                    <p>${obj.description}</p>
                    <p>Cost: ${obj.cost}</p>
                    <p>Weight: ${obj.weight}</p>
                </div>`;
            // WristPad
            } else if (weaponType == "Wristpad"){
                var obj = json.equipmentList[weaponType].weaponList[0];
                var objAppend = `
                <hr>
                <div>
                    <p>${obj.name}</p>
                    <p>${obj.description}</p>
                    <p>Cost: ${obj.cost}</p>
                    <p>Weight: ${obj.weight}</p>
                </div>`;
            // Clothing
            } else if (weaponType == "Clothing") {
                var possibleChoices = json.equipmentList[weaponType].weaponList;
                var randomClothes = random_item(possibleChoices);
                var objAppend = `
                <hr>
                <div>
                    <p>${randomClothes.name}</p>
                    <p>${randomClothes.description}</p>
                    <p>Cost: ${randomClothes.cost}</p>
                    <p>Weight: ${randomClothes.weight}</p>
                </div>`;
            // Armor
            } else if (weaponType == "Armor"){
                var possibleChoices = json.equipmentList[weaponType].weaponList;
                var randomArmor = random_item(possibleChoices);
                var objAppend = `
                <hr>
                <div>
                    <p>${randomArmor.Name}</p>
                    <p>Type: ${randomArmor.Type}</p>
                    <p>AC: ${randomArmor.AC}</p>
                    <p>Property: ${randomArmor.Property}</p>
                    <p>Cost: ${randomArmor.Cost}</p>
                    <p>Weight: ${randomArmor.Weight}</p>
                    <p>Stealth: ${randomArmor.Stealth}</p>
                </div>`;
            // Weapon
            } else {
                var possibleChoices = json.equipmentList[weaponType].weaponList;
                var randomWeapon = random_item(possibleChoices);
                var objAppend = `
                <hr>
                <div>
                    <h4 class="redText"><b>${randomWeapon.Name}</b></h4>
                    <p>Type: ${randomWeapon.Type}</p>
                    <p>Property: ${randomWeapon.Property}</p>
                    <p>Damage: ${randomWeapon.Damage}</p>
                    <p>Cost: ${randomWeapon.Cost}</p>
                    <p>Weight: ${randomWeapon.Weight}</p>
                </div>`;
            }
            $('#randomSWweapon').append(objAppend);
            //* Parte per le mods
            if (installedMods != "0"){
                getMods(installedMods, weaponRarity, weaponType, json);
            }
        }
    })
}

function random_item(items){
    return items[Math.floor(Math.random()*items.length)];
}

function getMods(modsNumber, rarity, weaponType, json){
    var d100arr = [];
    var startN = 1;
    while (startN<101){
        d100arr.push(startN);
        startN+=1;
    }
    var nMods = parseInt(modsNumber);
    var nAttunemens = 0;
    var costoMods = 0;
    if (nMods > 4){
        var nAttunemens = nMods - 4;
        nMods = 4;
    }
    var arrayPossibleRarities = [];
    switch(rarity){
        case "Standard":
            arrayPossibleRarities = ["Standard"]
            break;
        case "Premium":
            arrayPossibleRarities = ["Standard", "Premium"]
            break;
        case "Prototype":
            arrayPossibleRarities = ["Standard", "Premium", "Prototype"]
            break;
        case "Advanced":
            arrayPossibleRarities = ["Standard", "Premium", "Prototype", "Advanced"]
            break;
        case "Legendary":
            arrayPossibleRarities = ["Standard", "Premium", "Prototype", "Advanced", "Legendary"]
            break;
        case "Artifact":
            arrayPossibleRarities = ["Standard", "Premium", "Prototype", "Advanced", "Legendary", "Artifact"]
            break;
        default:
            ""
    }
    var returnMods = [];
    for (i=0; i<nMods; i++){
        currentRarity = random_item(arrayPossibleRarities);
        json.rarity.forEach(el => {
            if (el.description == currentRarity){
                var arrayVantaggio = [];
                for (k=0; k<2; k++){
                    arrayVantaggio.push(random_item(d100arr))
                }
                var possibleMods = el.modList[weaponType];
                var randomMod = random_item(possibleMods);
                randomMod["rarity"] = currentRarity;
                randomMod["removalDC"] = el.installationRemovalDC;
                var d100 = arrayVantaggio.reduce((a, b) => Math.max(a, b), -Infinity);;
                costoMods += (d100*el.valueModifier);
                returnMods.push(randomMod); 
            }
        })
    }

    var returnAttunements = [];
    for (j=0; j<nAttunemens; j++){
        currentRarity = random_item(arrayPossibleRarities);
        json.rarity.forEach(el => {
            if (el.description == currentRarity){
                var possibleAtt = el.modList["Augment"];
                var randomAtt = random_item(possibleAtt);
                randomAtt["rarity"] = currentRarity;
                returnAttunements.push(randomAtt);
            }
        })
    }
    
    var modDivHeader = `<hr><div id="SWmodsDiv"><h3>Installed mods</h3></div>`;
    $('#randomSWweapon').append(modDivHeader);

    returnMods.forEach(el => {
        var singleModDiv = `
        <div>
            <h4 class="redText"><b>${el.name}</b></h4>
            <p>Rarity: ${el.rarity}</p>
            <p>Installation / Removal DC: ${el.removalDC}</p>
            <p>${el.description}</p>
        </div>`;
        $('#SWmodsDiv').append(singleModDiv);
    })
    
    returnAttunements.forEach(el => {
        var singleModDiv = `
        <div class="">
            <h5>${el.name}</h5>
            <p>Rarity: ${el.rarity}</p>
            <p>${el.description}</p>
        </div>`;
        $('#SWmodsDiv').append(singleModDiv);
    })

    var costoModsAppend = `<hr><h5>Chassis total cost: ${costoMods}</h5>`;
    $('#SWmodsDiv').append(costoModsAppend);
}