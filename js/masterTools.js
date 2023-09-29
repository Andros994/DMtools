var nome, pf, alignment, inziativa, init, inputDadi;


$(document).ready(function(){

    // leggo file di config dei lavori
    $.getJSON('/DMtools/config/jobs.json', function(data) {
        jobsConfig = data;
    });

    // leggo config per le tracce audio
    $.getJSON('/DMtools/config/music.json', function(data) {
        musicConfig = data;
        popolaSelect(musicConfig);
    });

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

function popolaSelect(json){
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
        var numeroDadi = el.split('d')[0];
        var tipoDado = el.split('d')[1];
        for (i=0; i<parseInt(numeroDadi); i++){
            var risultatoTiro = Math.floor(Math.random() * parseInt(tipoDado) + 1);
            arrayResult.push(risultatoTiro);
        }
        var somma = sum(arrayResult);
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