//TODO 1: Obtenha sua chave da API OpenAI https://platform.openai.com/account/api-keys

/*
Essa função salva um valor em localStorage com a chave “openAI” e retorna o valor salvo.
Ela também adiciona um listener de evento para o elemento com id “key” que atualiza o valor salvo toda vez que o valor do elemento é alterado .
O código abaixo define uma constante API_KEY que é igual ao valor salvo em localStorage com a chave “openAI” ou “Não há chave aqui!” caso não haja valor salvo . 
*/

function updateKey() {
    const keyup = document.querySelector("#key") || "Não há chave aqui!";
    localStorage.setItem("openAI", keyup.value);
    
    keyup.addEventListener("keyup", (e) => {
        localStorage.setItem("openAI", e.target.value);
    });
    //keyup.value = '';
    
    var key = localStorage.getItem("openAI");

    console.log(key)
    return key;
}

const MIN_CHARS = 0;
let promptSpan, charSpan;

//Get the Light or Dark stylesheet depending on time of day.
//getStylesheet();

/*
Esse código está esperando quando o DOM (Document Object Model) termina de carregar e, em seguida, executa várias ações.
Ele atribui duas variáveis, "promptSpan" e "charSpan", aos elementos na página por seu id.
Em seguida, ele adiciona um ouvinte de evento a "promptSpan" que escuta a entrada e executa a função "countCharacters".
Ele também define o texto interno de "charSpan" para o valor de "MIN_CHARS", que é considerado uma constante e converte esse valor em uma string.
Ele também configura um ouvinte de evento em um elemento select com id "engines" para armazenar o mecanismo selecionado no armazenamento local do navegador quando a seleção é alterada.
E recupera o valor do mecanismo selecionado do armazenamento local quando a página é atualizada.
*/
document.addEventListener("DOMContentLoaded", function () {

    promptSpan = document.getElementById("prompt");
    promptSpan.addEventListener("input", countCharacters);

    charSpan = document.getElementById("charCount");
    charSpan.innerText = MIN_CHARS.toString();

    //ENSURES THAT THE ENGINE SELECTED IS KEPT ON A PAGE REFRESH
    const enginesList = document.getElementById("engines");
    const OPENAI_API_ENGINE = "OPENAI_API_ENGINE";
    enginesList.addEventListener('change', (event) => {
        let currentEngine = event.target.value;
        localStorage.setItem(OPENAI_API_ENGINE, currentEngine);
    });
    if (localStorage.getItem(OPENAI_API_ENGINE)) {
        enginesList.value = localStorage.getItem(OPENAI_API_ENGINE);
    }

    /*
    typeSentence("Olá, como posso ajudar?", promptSpan, '', false, 100)
        .then(afterTyping => promptSpan.innerHTML = "");
    */
});

/*
Esta função está contando o número de caracteres inseridos no elemento "promptSpan",
e, em seguida, atualizando todos os elementos com o atributo "contador" para refletir o número de caracteres inseridos.
Se o número de caracteres digitado for maior que 280 (o limite de caracteres do Twitter),
a cor do texto de todos os elementos "contadores" é definida como vermelha. Se o número de caracteres inseridos for menor ou igual a 280,
a cor do texto de todos os elementos "contadores" é definida como preta se nenhum css escuro for encontrado, caso contrário, é definido como branco.
Por fim, define o texto interno de "charSpan" para o número de caracteres inseridos.
 */
function countCharacters() {
    //Twitter character limit for reference
    const MAX_COUNTER = 2040;

    let numOfCharsEntered = promptSpan.innerText.length.toString();
    let spans = document.querySelectorAll("span[name='counter']");
    for (let i = 0; i < spans.length; i++) {
        if (numOfCharsEntered > MAX_COUNTER) {
            spans[i].style.color = "red";
        } else {
            let darkCSS = document.getElementById("darkCSS");
            if (darkCSS == null) {
                spans[i].style.color = "green";
            } else {
                spans[i].style.color = "white";
            }
        }
    }
    charSpan.innerText = numOfCharsEntered;
}

/*
This function is making an asynchronous API call to the OpenAI API to get completions based on the text entered in the "prompt" element and the engine selected in the "engines" element.
The function is first clearing any previous response and receipt by calling the clearResponseAndReceipt() function.
It then retrieves the values of "prompt" and "engines" elements and checks if they are not empty or whitespace.
If both of them have values, it makes a POST request to the OpenAI API with the specified headers, including the API key and a JSON body containing the model, prompt, temperature and max_tokens.
If the response is not ok, it logs the error and types the error message on the response element.
If the response is ok, it converts the response to json and calls the createResponse() function to create the response and types it on the response element.
If an error occurs, it logs the error.
If either prompt or engine is empty or whitespace, it types a message asking the user to enter a prompt and select an engine on the response element.
 */
async function openAI_API_Completions() {
    //Cache DOM elements to avoid unnecessary DOM traversals
    let promptElem = document.getElementById('prompt');
    let engineElem = document.getElementById("engines");
    let responseElem = document.getElementById("response");
    clearResponseAndReceipt();
    let promptText = promptElem.textContent.trim();
    let engine = engineElem.value.trim();

    if (promptText && engine) {
        try {
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': 'Bearer ' +  API_KEY
                    'Authorization': 'Bearer ' +  updateKey()
                },
                body: JSON.stringify({
                    'model': engine,
                    'prompt': promptText,
                    'temperature': 0,
                    'max_tokens': 1000,
                    'top_p': 1,
                    'frequency_penalty': 1.2,
                    'presence_penalty': 0
                })
                
            });

            if (!response.ok) {
                console.error("HTTP ERROR: " + response.status + "\n" + response.statusText);
                typeSentence("HTTP ERROR: " + response.status, responseElem);
            } else {
                const data = await response.json();
                typeSentence(createResponse(data), responseElem, data, true);
            }
        } catch (error) {
            console.error("ERROR: " + error);
        }
    } else {
        await typeSentence("Insira um texte e selecione um mecanismo", responseElem);
    }
}

/*
Esta função está limpando todos os dados na página, primeiro limpa o textContent do elemento 'prompt' e o define como uma string vazia.
Em seguida, ele chama a função countCharacters() para atualizar a contagem de caracteres.
Por fim, ele chama a função clearResponseAndReceipt() para limpar os dados de resposta e recebimento.
Esta função é útil para limpar todos os dados da página quando o usuário deseja começar do zero.
 */
function clearAll() {
    document.getElementById('prompt').textContent = '';
    countCharacters();
    clearResponseAndReceipt();
}

/*
Esta função é usada para limpar os dados de resposta e recibo na página, ela define o innerHTML dos elementos com ids 'resposta' e 'recebimento' para uma string vazia.
Essa função normalmente é chamada quando o usuário deseja limpar a resposta e o recebimento gerados anteriormente da página.
 */
function clearResponseAndReceipt() {
    document.getElementById('response').innerHTML = '';
    document.getElementById('receipt').innerHTML = '';
}

/*
Esta função está removendo o período (.) da matriz json de entrada.
Ele faz isso iterando sobre a matriz json e verificando se o elemento é um ponto.
Se for, ele remove esse elemento da matriz usando o método splice.
Em seguida, ele retorna a matriz json modificada.
Esta função é útil para remover o ponto final da frase para torná-la uma frase completa.
 */
function removePeriod(json) {
    json.forEach(function (element, index) {
        if (element === ".") {
            json.splice(index, 1);
        }
    });
    return json;
}

/*
Esta função está criando a resposta processando o objeto json de entrada.
Ele primeiro cria uma variável de string vazia chamada response.
Em seguida, ele chama a função removePeriod() para remover o ponto da matriz de opções do objeto json.
Em seguida, ele verifica se a matriz de opções possui pelo menos um elemento e, se tiver, atribui o texto do primeiro elemento da matriz de opções à variável de resposta.
Em seguida, ele retorna a variável de resposta.
Essa função normalmente é usada para criar uma resposta do objeto json retornado pela API OpenAI.
 */
function createResponse(json) {
    let response = "";
    let choices = removePeriod(json.choices);
    if (choices.length > 0) {
        response = json.choices[0].text
        //json.choices[0].index
        //json.choices[0].logprobs
        //json.choices[0].finish_reason
    }

    return response;
}

/*
Esta função está digitando uma frase na referência do elemento especificado.
Ele primeiro limpa o texto interno da referência do elemento passada como um argumento.
Em seguida, ele divide a frase em uma matriz de letras e inicia um loop que itera sobre a matriz de letras.
Dentro do loop, ele espera por um atraso especificado (30 ms) e então acrescenta a letra atual à referência do elemento.
Após a conclusão do loop, se o isReceipt for definido como true, ele chama a função createReceipt() com os dados passados ​​como argumento para criar um recibo e atualiza o innerHTML do elemento com o id "receipt".
Essa função é normalmente usada para criar um efeito de digitação na página e pode ser usada para digitar a resposta e o recibo.
 */
async function typeSentence(sentence, elementReference, data, isReceipt = false, delay = 30) {
    elementReference.innerText = "";
    if (sentence === "HTTP ERROR: 401") {
        sentence += " — Certifique-se de que sua chave de API Open AI foi definida corretamente.";
    }
    const letters = sentence.split("");
    //let delay = 30;
    let i = 0;
    while (i < letters.length) {
        await waitForMs(delay);
        elementReference.append(letters[i]);
        i++
    }

    if (isReceipt) {
        document.getElementById("receipt").innerHTML = createReceipt(data);
    }

    return;
}

/*
Esta função é uma função auxiliar que retorna uma promessa que resolve após um número especificado de milissegundos.
Leva um parâmetro, "ms", que é o número de milissegundos a esperar antes de resolver a promessa.
Essa função é normalmente usada em conjunto com a palavra-chave await para pausar a execução de uma função por um determinado período de tempo.
A promessa retornada pode ser aguardada e será resolvida após o número especificado de milissegundos, permitindo um atraso na execução da função de chamada.
 */
function waitForMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/*
Esta função cria um recebimento dos dados fornecidos pelo objeto json.
Ele primeiro comentou o código que cria uma tabela que inclui vários detalhes, como ID de conclusão, tipo de objeto, solicitado em, mecanismo usado, tokens de prompt, tokens de conclusão, tokens totais e custo total.
Ele utiliza a função setRow() para criar linhas de tabela e as funções convertEpochToDateTime() e calculateCost() para formatar os dados.
Agora ele retorna o custo total da requisição, usa a função calculateCost() para calcular o custo da requisição com base no modelo e no total_tokens utilizados.
Essa função normalmente é usada para criar um recibo da solicitação que pode ser exibido na página.
 */
function createReceipt(json) {
    /*let table = "<table border='1'>";
    table += "<tr style='background-color: orangered; color: white; text-align: left'><th>Name</th><th>Value</th></tr>";
    table += setRow("Completion ID", json.id);
    table += setRow("Object Type", json.object);
    table += setRow("Prompted At", convertEpochToDateTime(json.created));
    table += setRow("Engine Used", json.model);
    table += setRow("Prompt Tokens", json.usage.prompt_tokens, true);
    table += setRow("Completion Tokens", json.usage.completion_tokens, true);
    table += setRow("Total Tokens", json.usage.total_tokens, true);
    table += setRow("Total Cost", "$" + calculateCost(json.model, json.usage.total_tokens));
    table += "</table>";
    return table;*/

    let model = json.model;
    let promptTokens = json.usage.prompt_tokens;
    let completionTokens = json.usage.completion_tokens;
    let totalTokens = json.usage.total_tokens;
    return "<hr/><div><span>" + model + " </span><span style='font-family: ; font-weight: bolder;'>RECEIPT</span></div><br/><div style='font-family: Poppins'>Total Tokens: <span style='font-family: Orbitron'>" + totalTokens +
        "</span></div><br/>$" + calculateCost(json.model, totalTokens);
}

/*
Esta função é usada para criar uma linha de uma tabela que exibe o nome e o valor dos dados.
Leva três parâmetros: nome, valor e setWordCount.
Se setWordCount for definido como true, ele calculará o número aproximado de palavras com base na suposição de que há 0,75 tokens por palavra e o adicionará à descrição.
Em seguida, ele retorna uma string HTML que representa uma linha da tabela contendo o nome e a descrição.
Esta função é normalmente usada pela função createReceipt() para criar linhas da tabela de recibos.
 */
function setRow(name, value, setWordCount) {
    let description = value;
    if (setWordCount === true) {
        description = value + " (~" + +Math.round(value * 0.75) + " words)";
    }
    return "<tr><td>" + name + "</td><td>" + description + "</td></tr>";
}

/*
Essa função é usada para calcular o custo da solicitação com base no mecanismo usado e no número de tokens usados.
Leva três parâmetros: engineName, totalTokens e wordCount.
Ele primeiro define totalCost como 0 e declara variáveis ​​constantes para os preços por 1.000 tokens para cada mecanismo.
Em seguida, ele calcula o preço por token dividindo totalTokens por 1.000.
Em seguida, ele verifica o valor de engineName e multiplica o pricePerToken pela variável constante correspondente do mecanismo e atribui o resultado a totalCost.
Se wordCount for definido como true, ele calculará o número aproximado de palavras com base na suposição de que há 0,75 tokens por palavra.
Finalmente, ele retorna o custo total com casas decimais fixas.
Essa função normalmente é usada pela função createReceipt() para calcular o custo da solicitação.
 */
function calculateCost(engineName, totalTokens, wordCount = false) {
    let totalCost = 0;
    //Prices per 1000 tokens
    const DAVINCI_PRICE = 0.02;
    const CURIE_PRICE = 0.002;
    const BABBAGE_PRICE = 0.0005;
    const ADA_PRICE = 0.0004;
    const CODEX_PRICE = 0;

    let pricePerToken = totalTokens / 1000;
    if (engineName === "text-davinci-003") {
        totalCost = DAVINCI_PRICE * pricePerToken;
    } else if (engineName === "text-curie-001") {
        totalCost = CURIE_PRICE * pricePerToken;
    } else if (engineName === "text-babbage-001") {
        totalCost = BABBAGE_PRICE * pricePerToken;
    } else if (engineName === "text-ada-001") {
        totalCost = ADA_PRICE * pricePerToken;
    } else if (engineName === "code-davinci-002") {
        totalCost = CODEX_PRICE * pricePerToken;
    }

    return totalCost.toFixed(10);
}

/*
Esta função é usada para converter o tempo de época fornecido em segundos em uma string de data e hora legível por humanos.
Leva um parâmetro, "epoch" que é o tempo em segundos desde a época do Unix.
Ele primeiro cria um novo objeto Date multiplicando o tempo da época por 1000 para convertê-lo de segundos em milissegundos.
Em seguida, ele retorna uma representação de string da data e hora no formato de fuso horário local usando o método toLocaleString().
Essa função normalmente é usada pela função createReceipt() para formatar a data e a hora da solicitação.
 */
function convertEpochToDateTime(epoch) {
    let date = new Date(epoch * 1000);
    return date.toLocaleString();
}

/*
Esta função é usada para determinar a cor do texto da hora com base na hora atual do dia.
Ele cria uma variável "color" e a define como "dark".
Em seguida, ele cria um novo objeto Date e usa o método getHours para obter a hora atual.
Em seguida, ele verifica se a hora atual está entre 6h e 19h (inclusive) e define a variável de cor como "clara" se verdadeira.
Por fim, ele retorna a variável de cor, que será "dark" se for à noite e "light" se for de dia.
Esta função é normalmente usada para definir a cor do texto da hora na página para ser facilmente legível contra a cor de fundo.
 */
function getTimeColor() {
    let color = "dark";
    var currentTime = new Date().getHours();
    if (6 <= currentTime && currentTime < 19) {
        color = "light";
    }

    return color;
}

/*
Esta função é usada para determinar a folha de estilo apropriada para usar com base na hora atual do dia.
Ele cria duas constantes, CSS_LIGHT e CSS_DARK, que são as tags de link HTML para as folhas de estilo claras e escuras.
Em seguida, chama a função getTimeColor() para determinar a cor do texto da hora.
Se a cor do texto for preta, significa que é dia e grava a tag do link CSS_LIGHT no documento, caso contrário, ele grava a tag do link CSS_DARK no documento.
Dessa forma, a página terá um tema claro durante o dia e um tema escuro durante a noite.
Essa função é normalmente chamada no carregamento da página para aplicar a folha de estilo apropriada à página.
 */
/*
function getStylesheet() {
    const CSS_LIGHT = "<link id='lightCSS' rel='stylesheet' href='./light.css' type='text/css'>";
    const CSS_DARK = "<link id='darkCSS' rel='stylesheet' href='./chat.css' type='text/css'>";
    let timeColor = getTimeColor();
    if (timeColor === "light") {
        document.write(CSS_LIGHT);
    } else {
        document.write(CSS_DARK);
    }
    setGitHubImageAndLogo(timeColor);
}
*/
/*
This function takes in a parameter "timeColor" and uses it to determine the source of the image for the HTML element with the ID "gh-img".
If "timeColor" is equal to "dark", the source of the image is set to "../images/github-mark-white.png", and if it's not, the source is set to "../images/github-mark.png".
This function is likely used to switch the image source depending on the time of day or user preferences.
 */
/*
function setGitHubImageAndLogo(timeColor) {
    let ghImg = document.getElementById("gh-img");
    let logoImg = document.getElementById("logo");
    ghImg.src = "";
    if (timeColor === "dark") {
        ghImg.src = "../images/github-mark-white.png";
        logoImg.src = "../images/sopmac-ai-white.png";
    } else {
        ghImg.src = "../images/github-mark.png";
        logoImg.src = "../images/sopmac-ai-black.png";
    }
}
*/
/*
This function is used to switch between the light and dark stylesheets based on the current stylesheet.
It first checks if the darkCSS element exists in the document using the getElementById method and assigns the result to the variable "darkCSS", and then check if the lightCSS element exists in the document using the getElementById method and assigns the result to the variable "lightCSS".
If darkCSS variable is null, it means that the dark stylesheet is not currently being used, so it removes the light stylesheet link element and sets the new stylesheet link with the id "darkCSS" and path "./dark.css" using the setSheet function.
If lightCSS variable is null, it means that the light stylesheet is not currently being used, so it removes the dark stylesheet link element and sets the new stylesheet link with the id "lightCSS" and path "./light.css" using the setSheet function.
Next, we call setGitHubImageAndLogo() to set the src attribute of the GitHub logo image based on time of day.
Finally, it calls the countCharacters() function to update the characters count.
This function is typically used when the user wants to switch between the light and dark themes manually.
 */
/*
function switchStylesheet() {
    let darkCSS = document.getElementById("darkCSS");
    let lightCSS = document.getElementById("lightCSS");
    let newColor = "light";

    if (darkCSS == null) {
        document.getElementById("lightCSS").remove();
        setSheet("darkCSS", "./chat.css");
        newColor = "dark";
    } else if (lightCSS == null) {
        document.getElementById("darkCSS").remove();
        setSheet("lightCSS", "./light.css");
    }
    setGitHubImageAndLogo(newColor);
    countCharacters();
}
*/
/*
This function is used to set a new stylesheet link element with a provided id and href.
It takes two parameters, "id" and "href", which are the id and href attributes of the link element.
It first creates a new link element using the createElement method and assigns it to the variable "sheet".
Then it sets the rel, id, href, and type attributes of the link element using the corresponding properties of the "sheet" variable.
Finally, it appends the link element to the body of the document using the appendChild method.
This function is typically used to set a new stylesheet link element when the user switches between the light and dark themes.
 */
/*
function setSheet(id, href) {
    var sheet = document.createElement('link');
    sheet.rel = "stylesheet";
    sheet.id = id;
    sheet.href = href;
    sheet.type = "text/css";
    document.body.appendChild(sheet);
}
*/